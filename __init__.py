from anki.hooks import wrap

from aqt.stats import NewDeckStats
from aqt.qt import QUrl
from aqt import mw

import urllib.request

with open("replacement.html") as f:
    html = f.read()
#with open("graphs_append.js") as f:
#    innerJs = f.read()

with urllib.request.urlopen(f"{mw.serverURL()}/_anki/pages/graphs.js") as resp:
    js: str = resp.read().decode(encoding="utf8")

html = html.format(
    js=js,
    media=mw.serverURL()
)

def new_refresh(self: NewDeckStats):
    
    old_load_url = self.form.web.load_url

    def fake_load(url: QUrl):
        print(url.url())

        if "graphs" in url.url(): # Without this it overflows as setHtml calls load_url
            self.form.web.setHtml(html)
            print(html)
        else:
            print(url.url())
            old_load_url(url)

    self.form.web.load_url = fake_load

NewDeckStats.refresh = wrap(NewDeckStats.refresh, new_refresh, "before")