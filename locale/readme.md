eng_GB.ftl is the default locale. You should use it while translating.

## What is my locale code?

1. Press "Ctrl-shift colon (:)" in Anki
2. Type `mw.pm.meta["defaultLang"]`
3. While on the same line press ctrl+shift-enter
4. Create a file in this folder with that code + ".ftl"

You can edit the translation files without building the app from source if you want to. Simply add a file with your locale name in the "locales" folder.