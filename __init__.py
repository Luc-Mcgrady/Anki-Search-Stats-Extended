# Injecting js into stats page
import json
import os
import os.path
from pathlib import Path

import orjson
from anki.hooks import wrap
from aqt import QDesktopServices, QUrl, mw
from aqt.stats import NewDeckStats

addon_dir = Path(os.path.dirname(__file__))
locale_dir = addon_dir / "locale"

fallback_lang = "en_GB"


def getLocale(lang: str):
    try:
        with open(locale_dir / f"{lang}.ftl", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Search Stats Extended: Locale {lang} not found")
        return ""


def getAvailableLangs():
    try:
        return [a[:-4] for a in os.listdir(locale_dir) if a.endswith(".ftl")]
    except Exception as e:
        return ["Locale folder missing or otherwise inaccessable", e]


def new_refresh(self: NewDeckStats):
    with (
        open(addon_dir / "stats.min.js", encoding="utf-8") as f
    ):  # Putting this inside the function allows you to rebuild the page without restarting anki
        innerJs = f.read()
    with open(addon_dir / "stats.min.css", encoding="utf-8") as f:
        innerCss = f.read()

    config = mw.addonManager.getConfig(__name__)
    lang = (
        mw.pm.meta["defaultLang"]
        if config["forceLang"] is None
        else config["forceLang"]
    )

    other = {
        "rollover": mw.col.get_preferences().scheduling.rollover,
        "learn_ahead_secs": mw.col.get_preferences().scheduling.learn_ahead_secs,
        "deck_configs": {conf["id"]: conf for conf in mw.col.decks.all_config()},
        "deck_config_ids": {
            deck["id"]: deck.get("conf", None) for deck in mw.col.decks.all()
        },
        "days_elapsed": mw.col.sched.today,
        "lang": lang,
        "available_langs": getAvailableLangs(),
        "lang_ftl": getLocale(lang),
        "fallback_ftl": getLocale(fallback_lang),
    }
    setVars = (
        f"const css = `{innerCss}`;"
        f"const SSEconfig = {json.dumps(config)};"
        f"const SSEother = {json.dumps(other)};"
    )
    self.form.web.eval(setVars + innerJs)


NewDeckStats.refresh = wrap(NewDeckStats.refresh, new_refresh, "after")

# Search endpoint
from anki.utils import int_time
from aqt.mediasrv import post_handlers
from flask import Response, request


def card_search() -> bytes:
    search = request.data
    try:
        return Response(str(list(mw.col.find_cards(search))))
    except:
        return None


post_handlers["cardSearch"] = card_search

CARD_COLUMNS = [
    "id",
    "nid",
    "did",
    "ord",
    "mod",
    "usn",
    "type",
    "queue",
    "due",
    "ivl",
    "factor",
    "reps",
    "lapses",
    "left",
    "odue",
    "odid",
    "flags",
    "data",
]


def card_data() -> bytes:
    cards = request.data.strip(b"[]").decode()
    cardData = mw.col.db.all(f"SELECT * FROM cards WHERE id IN ({cards})")
    cardData = [{k: v for k, v in zip(CARD_COLUMNS, a)} for a in cardData]
    return Response(orjson.dumps(cardData))


post_handlers["cardData"] = card_data

REVLOG_COLUMNS = ["id", "cid", "ease", "ivl", "lastIvl", "time", "factor", "type"]
DAY_SECONDS = 60 * 60 * 24


def revlogs() -> bytes:
    req = orjson.loads(request.data)
    cards = ",".join(str(cid) for cid in req["cids"])
    day_range = req["day_range"]

    if day_range > 0:
        rollover = mw.col.get_preferences().scheduling.rollover
        today = (int_time() - (rollover * 60 * 60)) / DAY_SECONDS
        lower_limit = (today - day_range) * DAY_SECONDS * 1000  # +4 ?!?!?
    else:
        lower_limit = 0

    revlog_entries = mw.col.db.all(f"""
    SELECT
        {",".join(REVLOG_COLUMNS)}
    FROM revlog
    WHERE
        cid IN ({cards})
        AND revlog.id > ({lower_limit})
    ORDER BY revlog.id
    """)

    result = {"columns": REVLOG_COLUMNS, "data": revlog_entries}

    return Response(orjson.dumps(result))


post_handlers["revlogs"] = revlogs


def write_config():
    req = orjson.loads(request.data)
    config = mw.addonManager.getConfig(__name__)
    config[req["key"]] = req["value"]
    mw.addonManager.writeConfig(__name__, config)


post_handlers["writeConfig"] = write_config


def open_locale_folder():
    QDesktopServices.openUrl(QUrl.fromLocalFile(str(locale_dir.absolute())))


post_handlers["openLocaleFolder"] = open_locale_folder
