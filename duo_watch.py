#!/usr/bin/env python3
"""Watch Apple Store pickup availability for the iPhone Duo and alert on restock.

Run:      python3 duo_watch.py
Stores:   python3 duo_watch.py --probe        (list stores in radius + save raw response)
One shot: python3 duo_watch.py --once
Notify:   python3 duo_watch.py --test-notify

Data source: apple.com/shop/pickup-message-recommendations. The older
fulfillment-messages endpoint now answers 541 to every plain request. The new one
behaves differently, and the script is built around three observed quirks:

  1. It only reports stock for ONE store: the store nearest the `location` ZIP.
     So each store in the radius is queried using its own ZIP.
  2. It lists up to 3 OTHER in-stock configurations of the same model, never the
     queried part. So the script queries an unwatched "probe" part, and follows up
     with a second probe if a response comes back full (3 entries).
  3. It takes one `product` per request.

Cost: one request per store in the radius per cycle (about 8 for 60630 at 25 mi),
spaced a second or two apart, plus an occasional follow-up when a store is busy.
"""
import argparse
import json
import logging
import logging.handlers
import platform
import random
import re
import subprocess
import sys
import time
from pathlib import Path

import requests

# ---------------------------------------------------------------- config ----
# Any key can be overridden by a config.json next to this file (or --config PATH).
CONFIG = {
    "parts": {  # watched part number -> label shown in alerts
        "MK1F4LL/A": "iPhone Duo 256GB Night Sky",
        "MK1E4LL/A": "iPhone Duo 256GB Star White",
        "MK1H4LL/A": "iPhone Duo 512GB Night Sky",
        "MK1G4LL/A": "iPhone Duo 512GB Star White",
    },
    # Queried to see its siblings; it can never show up in its own results, so it
    # must be a Duo part you do NOT watch (2TB Night Sky).
    "probe_part": "MK1R4LL/A",
    "zip": "60630",
    "radius_miles": 25,
    "poll_seconds": 45,
    "jitter_seconds": 10,
    "request_gap_seconds": 1.5,  # pause between the per-store requests inside a cycle
    "max_backoff_seconds": 600,
    "store_refresh_seconds": 3600,
    "ntfy_topic": "CHANGE-ME-pick-a-long-random-topic",
    "ntfy_server": "https://ntfy.sh",
    "log_file": "duo_watch.log",
    "state_file": "duo_watch_state.json",
}

HERE = Path(__file__).resolve().parent
ENDPOINT = "https://www.apple.com/shop/pickup-message-recommendations"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
BUY_URL = "https://www.apple.com/shop/product/{part}"  # 301s to the exact configuration page
RATE_LIMIT_STATUSES = {429, 503}
ERRORS_BEFORE_BACKOFF = 3  # for errors that are not an explicit 429/503
SATURATION = 3  # max sibling entries Apple returns; a full response may be hiding more
MAX_PROBES = 4  # per store per cycle, including the first

log = logging.getLogger("duo_watch")


class FetchError(Exception):
    def __init__(self, msg, status=None):
        super().__init__(msg)
        self.status = status


class ShapeError(Exception):
    pass


# ----------------------------------------------------------------- fetch ----
def api_get(product, location, timeout=20):
    try:
        r = requests.get(
            ENDPOINT,
            params={"fae": "true", "location": location, "product": product},
            headers={"User-Agent": USER_AGENT, "Accept": "application/json", "Accept-Language": "en-US,en;q=0.9"},
            timeout=timeout,
        )
    except requests.RequestException as e:
        raise FetchError(f"network error: {e}") from e
    if r.status_code != 200:
        raise FetchError(f"HTTP {r.status_code}", status=r.status_code)
    try:
        return r.json()
    except ValueError as e:
        raise FetchError(f"non-JSON response ({r.headers.get('content-type')})", status=r.status_code) from e


# ----------------------------------------------------------------- parse ----
def parse_stores(data):
    """-> [{id, name, zip, distance, parts: {part: title}}], nearest store first.

    `parts` holds only entries Apple marks available for pickup. An unrecognized
    product comes back with no `stores` key, or with no PickupMessage at all; both parse to [].
    """
    body = data.get("body") if isinstance(data, dict) else None
    if not isinstance(body, dict):
        raise ShapeError("response has no body object")
    out = []
    for s in body.get("PickupMessage", {}).get("stores", []):
        try:
            parts = {}
            for part, info in s["partsAvailability"].items():
                if info.get("pickupDisplay") == "available" and info.get("storePickEligible", True):
                    title = info.get("messageTypes", {}).get("regular", {}).get("storePickupProductTitle", "")
                    parts[part] = title.replace("\xa0", " ")
            out.append(
                {
                    "id": s["storeNumber"],
                    "name": s["storeName"],
                    "zip": s["address"]["postalCode"],
                    "distance": float(s["storedistance"]),
                    "parts": parts,
                }
            )
        except (KeyError, TypeError, ValueError, AttributeError) as e:
            raise ShapeError(f"unexpected store entry ({e!r}): {json.dumps(s)[:300]}") from e
    return out


# ---------------------------------------------------------------- logic -----
def discover_stores(cfg):
    """Stores within the radius of cfg zip, keyed by id, with distance from that ZIP."""
    stores = parse_stores(api_get(cfg["probe_part"], cfg["zip"]))
    return {s["id"]: s for s in stores if s["distance"] <= cfg["radius_miles"]}


def check_store(cfg, store, sleep=time.sleep):
    """Query one store. Returns (available, unavailable) subsets of the watched parts.

    A watched part in neither set is unknown this cycle (hidden behind a full response)
    and keeps its previous state.
    """
    watched = set(cfg["parts"])
    probe, probed, visible, unavailable = cfg["probe_part"], [], set(), set()
    for _ in range(MAX_PROBES):
        probed.append(probe)
        stores = parse_stores(api_get(probe, store["zip"]))
        if not stores or stores[0]["id"] != store["id"]:
            got = stores[0]["id"] if stores else None
            log.warning("querying ZIP %s for %s evaluated %s instead; skipping store", store["zip"], store["id"], got)
            return set(), set()
        parts = stores[0]["parts"]
        visible |= set(parts)
        if watched <= visible:  # every watched part seen in stock; nothing more to learn
            break
        if len(parts) < SATURATION:  # complete view of everything except the probe itself
            unavailable |= watched - set(parts) - {probe}
            break
        nxt = next((p for p in parts if p not in probed), None)
        if nxt is None:
            break
        probe = nxt
        sleep(cfg["request_gap_seconds"])
    return watched & visible, (unavailable - visible)


def apply_result(prev_parts, available, unavailable):
    """-> (new_state_for_store, newly_available)."""
    new = (set(prev_parts) - unavailable) | available
    return new, available - set(prev_parts)


# -------------------------------------------------------------- notifiers ---
class Notifier:
    """Subclass and add an instance to build_notifiers() to add a channel (e.g. email)."""

    def send(self, title, message, url):
        raise NotImplementedError


class MacNotifier(Notifier):
    def send(self, title, message, url):
        if platform.system() != "Darwin":
            log.debug("skipping macOS notification: not on macOS")
            return
        esc = lambda s: s.replace("\\", "\\\\").replace('"', '\\"')
        script = f'display notification "{esc(message)}" with title "{esc(title)}" sound name "Glass"'
        subprocess.run(["osascript", "-e", script], check=True, timeout=10)


class NtfyNotifier(Notifier):
    def __init__(self, server, topic):
        self.server, self.topic = server.rstrip("/"), topic

    def send(self, title, message, url):
        if self.topic.startswith("CHANGE-ME"):
            log.warning("ntfy topic not set in CONFIG; skipping phone push")
            return
        r = requests.post(
            f"{self.server}/{self.topic}",
            data=message.encode("utf-8"),
            headers={"Title": title.encode("ascii", "replace").decode(), "Click": url, "Priority": "urgent", "Tags": "iphone"},
            timeout=15,
        )
        r.raise_for_status()


def build_notifiers(cfg):
    return [MacNotifier(), NtfyNotifier(cfg["ntfy_server"], cfg["ntfy_topic"])]


def notify_all(notifiers, title, message, url):
    for n in notifiers:  # one channel failing must not block the others
        try:
            n.send(title, message, url)
        except Exception as e:
            log.error("%s failed: %s", type(n).__name__, e)


# --------------------------------------------------------------- plumbing ---
def load_config(path=None):
    cfg = dict(CONFIG)
    p = Path(path) if path else HERE / "config.json"
    if p.exists():
        cfg.update(json.loads(p.read_text()))
    if cfg["probe_part"] in cfg["parts"]:
        sys.exit(f"probe_part {cfg['probe_part']} is also watched; it can never appear in its own results. Pick an unwatched Duo part.")
    return cfg


def setup_logging(path):
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    fh = logging.handlers.RotatingFileHandler(HERE / path, maxBytes=1_000_000, backupCount=5)
    sh = logging.StreamHandler()
    for h in (fh, sh):
        h.setFormatter(fmt)
        log.addHandler(h)
    log.setLevel(logging.INFO)


def load_state(path):
    try:
        raw = json.loads((HERE / path).read_text())
        return {sid: set(parts) for sid, parts in raw.items()}
    except (OSError, ValueError, AttributeError, TypeError):
        return {}


def save_state(path, state):
    (HERE / path).write_text(json.dumps({sid: sorted(p) for sid, p in state.items() if p}))


def sleep_for(cfg, errors, rate_limited):
    base = cfg["poll_seconds"]
    if rate_limited or errors >= ERRORS_BEFORE_BACKOFF:
        n = errors if rate_limited else errors - ERRORS_BEFORE_BACKOFF + 1
        base = min(cfg["max_backoff_seconds"], base * 2 ** max(n, 1))
        log.warning("backing off %ds (consecutive errors: %d)", base, errors)
    return max(5, base + random.uniform(-cfg["jitter_seconds"], cfg["jitter_seconds"]))


def validate_parts(cfg):
    """Warn about part numbers Apple does not recognize (it answers with zero stores) and stop watching them."""
    for part in [cfg["probe_part"], *cfg["parts"]]:
        if not parse_stores(api_get(part, cfg["zip"])):
            if part == cfg["probe_part"]:  # typo, or Apple changed the response; either way nothing can be checked
                raise ShapeError(f"probe part {part} returned no stores for ZIP {cfg['zip']}")
            log.warning("PART NOT RECOGNIZED by Apple: %s (%s). It will never alert, so it is dropped. Check for a typo.", part, cfg["parts"][part])
            del cfg["parts"][part]
        time.sleep(cfg["request_gap_seconds"])
    if not cfg["parts"]:
        sys.exit("none of the configured parts are recognized by Apple; nothing to watch")


def probe(cfg):
    data = api_get(cfg["probe_part"], cfg["zip"])
    out = HERE / "probe_response.json"
    out.write_text(json.dumps(data, indent=1))
    stores = parse_stores(data)
    print(f"{len(stores)} stores near {cfg['zip']} (raw response saved to {out})")
    for s in stores:
        mark = "WATCHED" if s["distance"] <= cfg["radius_miles"] else "outside radius"
        print(f"  {s['id']}  {s['name']:<22} ZIP {s['zip']}  {s['distance']:>6.1f} mi  {mark}")
    return 0


def run_cycle(cfg, stores, notifiers, state):
    """One pass over every watched store. Mutates `state`; returns (ok_stores, failed_stores)."""
    t0, ok, failed, new_total, avail_total = time.time(), 0, 0, 0, 0
    for i, store in enumerate(sorted(stores.values(), key=lambda s: s["distance"])):
        if i:
            time.sleep(cfg["request_gap_seconds"] * random.uniform(0.7, 1.3))
        try:
            available, unavailable = check_store(cfg, store)
        except FetchError as e:
            if e.status in RATE_LIMIT_STATUSES:
                raise
            failed += 1
            log.warning("store %s (%s) check failed: %s", store["id"], store["name"], e)
            continue
        ok += 1
        state[store["id"]], new = apply_result(state.get(store["id"], set()), available, unavailable)
        avail_total += len(state[store["id"]])
        new_total += len(new)
        for part in sorted(new):
            label, url = cfg["parts"][part], BUY_URL.format(part=part)
            log.info("ALERT %s at %s (%.1f mi) %s", label, store["name"], store["distance"], url)
            notify_all(notifiers, f"{label} in stock", f"{store['name']} ({store['distance']:.1f} mi). {url}", url)
    log.info("check: %d/%d stores ok, %d (store,part) available, %d new, %.1fs", ok, ok + failed, avail_total, new_total, time.time() - t0)
    return ok, failed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe", action="store_true", help="list stores in range, save the raw response, exit")
    ap.add_argument("--once", action="store_true", help="run a single check and exit")
    ap.add_argument("--test-notify", action="store_true", help="send a test notification and exit")
    ap.add_argument("--config", help="path to a JSON file overriding CONFIG keys")
    args = ap.parse_args()

    cfg = load_config(args.config)
    setup_logging(cfg["log_file"])
    notifiers = build_notifiers(cfg)

    if args.probe:
        return probe(cfg)
    if args.test_notify:
        notify_all(notifiers, "duo_watch test", "Notifications are working.", BUY_URL.format(part=next(iter(cfg["parts"]))))
        return 0

    state, errors, first, validated, stores, stores_at = load_state(cfg["state_file"]), 0, True, False, {}, 0.0
    log.info("watching %d parts within %s mi of %s", len(cfg["parts"]), cfg["radius_miles"], cfg["zip"])
    while True:
        rate_limited = False
        try:
            if not validated:
                validate_parts(cfg)
                validated = True
            if not stores or time.time() - stores_at > cfg["store_refresh_seconds"]:
                stores, stores_at = discover_stores(cfg), time.time()
                log.info("stores in range: %s", ", ".join(f"{s['name']} ({s['distance']:.1f} mi)" for s in stores.values()) or "none")
                if not stores:
                    raise FetchError("no stores returned for this ZIP/radius")
            ok, failed = run_cycle(cfg, stores, notifiers, state)
            save_state(cfg["state_file"], state)
            errors, first = (errors + 1, first) if ok == 0 else (0, False)
        except ShapeError as e:
            if first:
                log.error("Response shape not recognized: %s\nRun `python3 duo_watch.py --probe` and inspect probe_response.json.", e)
                return 2
            errors += 1
            log.error("shape changed mid-run: %s", e)
        except FetchError as e:
            errors += 1
            rate_limited = e.status in RATE_LIMIT_STATUSES
            log.error("check failed: %s", e)
        if args.once:
            return 0 if errors == 0 else 1
        time.sleep(sleep_for(cfg, errors, rate_limited))


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        pass
