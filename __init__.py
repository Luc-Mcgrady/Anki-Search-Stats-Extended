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

def card_search() -> bytes:
    search = request.data
    return Response(str(list(mw.col.find_cards(search))))

post_handlers["cardSearch"] = card_search

def card_data() -> bytes:
    cards = request.data
    print(request.data)
    cards: list[int] = json.loads(cards)
    assert isinstance(cards, list)
    assert isinstance(cards[0], int)
    return Response(str([mw.col.card_stats_data(a) for a in cards]))

post_handlers["cardData"] = card_data