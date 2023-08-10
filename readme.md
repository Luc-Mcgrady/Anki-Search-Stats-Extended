# Search Stats Extended

Like the new anki stats screen? Want more? This is the addon for you.
This addon is going to be in no way compatible with any other addon which changes the new stats page but as far as im aware this is the only one soo.

It would be possible to make this compatible with the caveat that you would have 2 search bars. If any more addons come out then that might be a sacrifice I would be willing to make for compatibility.

## The Graphs

### Future due types

### Todays Retention

### Custom Pie

### Interval/Burden distribution

## Development

Building this with make addon works on linux and will probably work on mac 

Clone this repo recursively (It contains all anki's source files, sorry)
```
git clone https://github.com/Luc-Mcgrady/Anki-New-Stats-Plus.git --recursive
```

run make to setup source files

### Linux / Mac

```
make
``` 

Then every-time you make any changes run make again.

### Windows

You need to copy ./anki/sass to ./sass then generate the proto files by running

```sh
npm i
npx protoc \
    -I anki/proto \
    --es_out src/ts/proto \
    --es_opt target=ts \
    anki/proto/anki/*.proto \
```

Then whenever you want to build changes

```sh
npm run build
```
I haven't actually tested this so good luck.
Check the makefile for more information


Due to the way its set up you don't have to reload anki for javascript changes, you only have to run make/build again and reload the stats menu.
