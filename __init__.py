from anki.hooks import wrap
from aqt.stats import NewDeckStats

with open("graphs_append.js") as f:
    js = f.read()

def newRefresh(self: NewDeckStats):
    self.form.web.eval(js)

NewDeckStats.refresh = wrap(NewDeckStats.refresh, newRefresh)