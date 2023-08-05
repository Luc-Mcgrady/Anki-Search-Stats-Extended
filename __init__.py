from anki.hooks import wrap

from aqt.stats import NewDeckStats
import os.path

addon_dir = os.path.dirname(__file__)

def new_refresh(self: NewDeckStats):
    with open(f"{addon_dir}/graphs.min.js") as f: # Putting this inside the function allows you to rebuild the page with anki still open
        innerJs = f.read()
    with open(f"{addon_dir}/graphs.min.css") as f: # Putting this inside the function allows you to rebuild the page with anki still open
        innerCss = f.read()

    setCss = f"const css = `{innerCss}`;"
    self.form.web.eval(setCss + innerJs)

NewDeckStats.refresh = wrap(NewDeckStats.refresh, new_refresh, "after")