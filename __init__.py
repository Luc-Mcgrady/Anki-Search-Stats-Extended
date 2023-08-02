from anki.hooks import wrap
from aqt.stats import NewDeckStats

def newRefresh(self: NewDeckStats):
    self.form.web.setHtml("Hello World")

NewDeckStats.refresh = wrap(NewDeckStats.refresh, newRefresh)