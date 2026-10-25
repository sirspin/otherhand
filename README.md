# duo_watch

Polls Apple's pickup-availability endpoint for iPhone Duo (256GB/512GB, Night Sky/Star White) near a ZIP and alerts via macOS notification and ntfy.sh when a (store, part) goes from unavailable to available.

```
pip install -r requirements.txt
python3 duo_watch.py --probe        # first run: check the raw response from your network
python3 duo_watch.py --test-notify
python3 duo_watch.py
```

Edit `CONFIG` at the top of `duo_watch.py`, or override keys in a `config.json` next to it. Set `ntfy_topic` to a long random string and subscribe to it in the ntfy app.

The response parser (`parse_stores`) has not been checked against a live response. If it does not match, the script exits with a message instead of running blind. Add email by subclassing `Notifier` and adding it to `build_notifiers`.
