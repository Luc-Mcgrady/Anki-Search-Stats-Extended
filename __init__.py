from anki.hooks import wrap
from aqt.stats import NewDeckStats

with open("injector.js") as f:
    injectorJs = f.read()

with open("graphs_append.js") as f:
    innerJs = f.read()

js = injectorJs % innerJs.replace("\n", ";").replace("\"", "\\\"")

def newRefresh(self: NewDeckStats):
    print(js)
    self.form.web.eval(js)

NewDeckStats.refresh = wrap(NewDeckStats.refresh, newRefresh, "before")