# duo_watch

Polls Apple's pickup availability for the iPhone Duo near a ZIP and alerts (macOS notification with sound, plus an ntfy.sh push to your phone) when a (store, part) goes from unavailable to available. No repeat alerts while it stays available; it alerts again if it sells out and returns.

```
pip install -r requirements.txt
python3 duo_watch.py --probe        # lists the stores in range
python3 duo_watch.py --test-notify
python3 duo_watch.py
```

Edit `CONFIG` at the top of `duo_watch.py`, or override keys in a `config.json` next to it (or `--config PATH`). Set `ntfy_topic` to a long random string and subscribe to it in the ntfy app. Each check is logged to `duo_watch.log` (rotating, 1MB x 5). Add email by subclassing `Notifier` and adding it to `build_notifiers`.

## How it gets its data

The old `fulfillment-messages` endpoint answers HTTP 541 to every plain request. This uses `pickup-message-recommendations`, which has three quirks the script is built around:

- It reports stock for one store only, the store nearest the `location` ZIP. The script queries each store in the radius using that store's own ZIP, so a cycle is one request per store (about 8 for 60630 at 25 miles), spaced about 1.5s apart.
- It lists up to 3 other in-stock configurations of the same model and never the queried part. The script queries an unwatched `probe_part` (2TB Night Sky) and sends follow-up probes if a response is full. If every response is full, the hidden parts keep their previous state instead of being marked sold out.
- It takes one `product` per request, so the "one request per cycle" goal is not possible with this endpoint.

Verified against live responses: store discovery, per-store ZIP targeting for all 8 stores near 60630, and the available-entry shape (checked on in-stock iPhones). No Duo is in stock yet, so no Duo alert has fired live. Not run on a Mac, so the `osascript` and ntfy paths are untested.
