# Injecting js into stats page
from anki.hooks import wrap

from aqt.stats import NewDeckStats
import os.path

addon_dir = os.path.dirname(__file__)

def new_refresh(self: NewDeckStats):
    with open(f"{addon_dir}/stats.min.js") as f: # Putting this inside the function allows you to rebuild the page without restarting anki
        innerJs = f.read()
    with open(f"{addon_dir}/stats.min.css") as f:
        innerCss = f.read()

    setCss = f"const css = `{innerCss}`;"
    self.form.web.eval(setCss + innerJs)

NewDeckStats.refresh = wrap(NewDeckStats.refresh, new_refresh, "after")

# Search endpoint
from flask import request, Response
import json

from aqt.mediasrv import post_handlers
from aqt import mw

def card_json(object):
    # https://regex101.com/r/lRU1dh/1
    return { 
        "card_id": object.card_id,
        "note_id": object.note_id,
        "deck": object.deck,
        "added": object.added,
        "first_review": object.first_review,
        "latest_review": object.latest_review,
        "due_date": object.due_date,
        "interval": object.interval,
        "ease": object.ease,
        "reviews": object.reviews,
        "average_secs": object.average_secs,
        "total_secs": object.total_secs,
        "card_type": object.card_type,
        "notetype": object.notetype,
        "custom_data": object.custom_data,
        # "revlog": Not yet implemented
    }

def card_search() -> bytes:
    search = request.data
    return Response(str(list(mw.col.find_cards(search))))

post_handlers["cardSearch"] = card_search

def card_data() -> bytes:
    cards = request.data
    cards: list[int] = json.loads(cards)
    assert isinstance(cards, list)
    assert isinstance(cards[0], int)
    return Response(json.dumps([(card_json(mw.col.card_stats_data(a))) for a in cards]))

post_handlers["cardData"] = card_data