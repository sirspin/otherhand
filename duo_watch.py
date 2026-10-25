#!/usr/bin/env python3
"""Watch Apple Store pickup availability for the iPhone Duo and alert on restock.

Run:      python3 duo_watch.py
Probe:    python3 duo_watch.py --probe        (dump the raw response, then exit)
One shot: python3 duo_watch.py --once
Notify:   python3 duo_watch.py --test-notify

Apple's endpoint rejected the cloud sandbox this was written in (HTTP 541), so the
response parser below was NOT verified against a live response. It fails closed:
if the response does not look the way parse_stores() expects, the script exits and
tells you to run --probe, instead of reporting "nothing in stock" forever.
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
from urllib.parse import urlencode

import requests

# ---------------------------------------------------------------- config ----
# Any key can be overridden by a config.json next to this file.
CONFIG = {
    "parts": {  # part number -> label shown in alerts
        "MK1F4LL/A": "iPhone Duo 256GB Night Sky",
        "MK1E4LL/A": "iPhone Duo 256GB Star White",
        "MK1H4LL/A": "iPhone Duo 512GB Night Sky",
        "MK1G4LL/A": "iPhone Duo 512GB Star White",
    },
    "zip": "60630",
    "radius_miles": 25,
    "poll_seconds": 45,
    "jitter_seconds": 10,
    "max_backoff_seconds": 600,
    "ntfy_topic": "CHANGE-ME-pick-a-long-random-topic",
    "ntfy_server": "https://ntfy.sh",
    "log_file": "duo_watch.log",
    "state_file": "duo_watch_state.json",
}

HERE = Path(__file__).resolve().parent
ENDPOINT = "https://www.apple.com/shop/fulfillment-messages"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
BUY_URL = "https://www.apple.com/shop/product/{part}"  # 301s to the exact configuration page
RATE_LIMIT_STATUSES = {429, 503}
ERRORS_BEFORE_BACKOFF = 3  # for errors that are not an explicit 429/503

log = logging.getLogger("duo_watch")


class FetchError(Exception):
    def __init__(self, msg, status=None):
        super().__init__(msg)
        self.status = status


class ShapeError(Exception):
    pass


# ----------------------------------------------------------------- fetch ----
def fetch(parts, zip_code, timeout=20):
    """One request covering every part. Returns the decoded JSON body."""
    params = [("fae", "true"), ("pl", "true"), ("mts.0", "regular")]
    params += [(f"parts.{i}", p) for i, p in enumerate(parts)]
    params.append(("location", zip_code))
    url = f"{ENDPOINT}?{urlencode(params, safe='/')}"
    try:
        r = requests.get(
            url,
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
# UNVERIFIED: this is the response shape historically returned by this endpoint.
#   body.content.pickupMessage.stores[] -> storeNumber, storeName, storeDistanceWithUnit,
#       partsAvailability{part -> pickupDisplay ("available"/"unavailable"/...), storePickEligible}
# Confirm with --probe and adjust here; nothing else in the script knows the shape.
def parse_stores(data):
    """Return [{id, name, distance, parts: {part: bool}}]. Raises ShapeError on surprises."""
    try:
        stores = data["body"]["content"]["pickupMessage"]["stores"]
    except (KeyError, TypeError) as e:
        raise ShapeError(f"missing body.content.pickupMessage.stores ({e!r})") from e
    if not isinstance(stores, list):
        raise ShapeError("stores is not a list")
    out = []
    for s in stores:
        try:
            avail = {
                part: bool(info.get("storePickEligible", True)) and info["pickupDisplay"] == "available"
                for part, info in s["partsAvailability"].items()
            }
            out.append(
                {
                    "id": s["storeNumber"],
                    "name": s["storeName"],
                    "distance": _distance_miles(s),
                    "parts": avail,
                }
            )
        except (KeyError, TypeError, AttributeError) as e:
            raise ShapeError(f"unexpected store entry ({e!r}): {json.dumps(s)[:300]}") from e
    return out


def _distance_miles(store):
    raw = store.get("storeDistanceWithUnit") or (store.get("retailStore") or {}).get("distanceWithUnit")
    m = re.match(r"\s*([\d.,]+)\s*(mi|km)", raw or "", re.I)
    if not m:
        raise KeyError(f"distance (got {raw!r})")
    val = float(m.group(1).replace(",", ""))
    return val * 0.621371 if m.group(2).lower() == "km" else val


# ------------------------------------------------------------ transitions ---
def find_new_availability(stores, radius, prev):
    """Return (alerts, current). `current` is the set of (store_id, part) available in radius."""
    current, alerts = set(), []
    for s in stores:
        if s["distance"] > radius:
            continue
        for part, ok in s["parts"].items():
            if ok:
                key = (s["id"], part)
                current.add(key)
                if key not in prev:
                    alerts.append((s, part))
    return alerts, current


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
def load_config():
    cfg = dict(CONFIG)
    p = HERE / "config.json"
    if p.exists():
        cfg.update(json.loads(p.read_text()))
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
        return {tuple(k) for k in json.loads((HERE / path).read_text())}
    except (OSError, ValueError):
        return set()


def save_state(path, current):
    (HERE / path).write_text(json.dumps(sorted(current)))


def sleep_for(cfg, errors, rate_limited):
    base = cfg["poll_seconds"]
    if rate_limited or errors >= ERRORS_BEFORE_BACKOFF:
        n = errors if rate_limited else errors - ERRORS_BEFORE_BACKOFF + 1
        base = min(cfg["max_backoff_seconds"], base * 2 ** max(n, 1))
        log.warning("backing off %ds (consecutive errors: %d)", base, errors)
    return max(5, base + random.uniform(-cfg["jitter_seconds"], cfg["jitter_seconds"]))


def validate_parts(cfg, stores):
    """Warn about part numbers Apple's response never mentions (typo guard)."""
    seen = {p for s in stores for p in s["parts"]}
    if not stores:
        log.warning("Apple returned no stores for %s; cannot validate part numbers", cfg["zip"])
        return
    for part in cfg["parts"]:
        if part not in seen:
            log.warning("PART NOT RECOGNIZED by Apple: %s (%s). It will never alert. Check for a typo.", part, cfg["parts"][part])


def probe(cfg):
    parts = list(cfg["parts"])
    params = [("fae", "true"), ("pl", "true"), ("mts.0", "regular")] + [(f"parts.{i}", p) for i, p in enumerate(parts)] + [("location", cfg["zip"])]
    r = requests.get(f"{ENDPOINT}?{urlencode(params, safe='/')}", headers={"User-Agent": USER_AGENT, "Accept": "application/json"}, timeout=20)
    print(f"HTTP {r.status_code}  content-type: {r.headers.get('content-type')}  bytes: {len(r.content)}")
    out = HERE / "probe_response.txt"
    out.write_text(r.text)
    print(f"full body saved to {out}\n")
    print(r.text[:4000])
    if r.status_code != 200:
        print("\nNon-200: Apple rejected this request. Try from a different network before debugging the script.")
    return 0


def check_once(cfg, notifiers, prev, first):
    parts = list(cfg["parts"])
    t0 = time.time()
    stores = parse_stores(fetch(parts, cfg["zip"]))
    if first:
        validate_parts(cfg, stores)
    alerts, current = find_new_availability(stores, cfg["radius_miles"], prev)
    in_radius = [s for s in stores if s["distance"] <= cfg["radius_miles"]]
    log.info(
        "check ok: %d stores returned, %d within %s mi, %d (store,part) available, %d new, %.1fs",
        len(stores), len(in_radius), cfg["radius_miles"], len(current), len(alerts), time.time() - t0,
    )
    for s, part in alerts:
        label = cfg["parts"].get(part, part)
        url = BUY_URL.format(part=part)
        title = f"{label} in stock"
        msg = f"{s['name']} ({s['distance']:.1f} mi). {url}"
        log.info("ALERT %s at %s (%.1f mi) %s", label, s["name"], s["distance"], url)
        notify_all(notifiers, title, msg, url)
    return current


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe", action="store_true", help="dump the raw endpoint response and exit")
    ap.add_argument("--once", action="store_true", help="run a single check and exit")
    ap.add_argument("--test-notify", action="store_true", help="send a test notification and exit")
    args = ap.parse_args()

    cfg = load_config()
    setup_logging(cfg["log_file"])
    notifiers = build_notifiers(cfg)

    if args.probe:
        return probe(cfg)
    if args.test_notify:
        notify_all(notifiers, "duo_watch test", "Notifications are working.", BUY_URL.format(part=next(iter(cfg["parts"]))))
        return 0

    prev, errors, first = load_state(cfg["state_file"]), 0, True
    log.info("watching %d parts near %s within %s mi", len(cfg["parts"]), cfg["zip"], cfg["radius_miles"])
    while True:
        rate_limited = False
        try:
            prev = check_once(cfg, notifiers, prev, first)
            save_state(cfg["state_file"], prev)
            errors, first = 0, False
        except ShapeError as e:
            if first:
                log.error("Response shape not recognized: %s\nRun `python3 duo_watch.py --probe` and fix parse_stores().", e)
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
