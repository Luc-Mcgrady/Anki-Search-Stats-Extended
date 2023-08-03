from anki.hooks import wrap

from aqt.stats import NewDeckStats
from aqt.qt import QUrl
from aqt import mw

with open("graphs.min.js") as f:
    innerJs = f.read()

def new_refresh(self: NewDeckStats):
    self.form.web.eval(innerJs)

NewDeckStats.refresh = wrap(NewDeckStats.refresh, new_refresh, "after")