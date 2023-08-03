from anki.hooks import wrap

from aqt.stats import NewDeckStats
import os.path

addon_dir = os.path.dirname(__file__)

def new_refresh(self: NewDeckStats):
    with open(f"{addon_dir}/graphs.min.js") as f: # Putting this inside the function allows you to rebuild the page with anki still open
        innerJs = f.read()

    self.form.web.eval(innerJs)

NewDeckStats.refresh = wrap(NewDeckStats.refresh, new_refresh, "after")