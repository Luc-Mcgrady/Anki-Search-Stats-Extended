Copy eng_GB.ftl to "Your Locale Code".ftl in this folder. Then any edits you make will be displayed in the addon when that locale is selected.

You can use the "forceLang" config option to set the addons config to override Anki's currently set locale with one of your choosing (filename, minus the ".ftl")

After you are done you can submit your file via pull request on github. For help with this, use the "Submit Translation" button in the addon.

eng_GB.ftl is the default locale. You should use it while translating.

## What is my locale code?

Find it in the "Translation" section of the stats screen.

Alternatively (Old way):

1. Press "Ctrl-shift colon (:)" in Anki
2. Type `mw.pm.meta["defaultLang"]`
3. While on the same line press ctrl+shift-enter
4. Create a file in this folder with that code + ".ftl"
