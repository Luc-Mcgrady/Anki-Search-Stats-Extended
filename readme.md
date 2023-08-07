# New Anki Graphs+

Like the new anki graphs? Want more? This is the addon for you.
This addon is going to be in no way compatible with any other addon which changes the new stats page but as far as im aware this is the only one soo.

It would be possible to make this compatible with the caveat that you would have 2 search bars. If any more addons come out then that might be a sacrifice I would be willing to make for compatibility.


## Development

Building this addon works on linux, might work on mac and unless you have some sorta godly setup where symlinks work properly and have make installed, doesn't work on windows

Clone this repo recursively (It contains all anki's source files, sorry)
```
git clone https://github.com/Luc-Mcgrady/Anki-New-Stats-Plus.git --recursive
```

run make to setup source files

```
make
``` 

Then every-time you make any changes run make again.
Due to the way its set up you don't have to reload anki for javascript changes, you only have to run make again and reload the stats menu.
