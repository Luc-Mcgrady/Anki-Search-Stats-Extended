INCLUDED = __init__.py graphs.min.js developers.md
OUT = addon.ankiaddon

COPIED = anki/graphs/Graph.sphelte

$(OUT): $(INCLUDED)
	zip $(OUT).zip $(INCLUDED)
	mv $(OUT).zip $(OUT)

graphs.min.js: ${wildcard src/ts/*.ts} ${wildcard src/ts/*.svelte} esbuild.mjs src/ts/proto node_modules sass
	npm run build

sass:
	ln -s anki/sass sass

src/ts/protc: node_modules
	mkdir src/ts/proto -p

	npx protoc \
		-I anki/proto \
		--es_out src/ts/proto \
		--es_opt target=ts \
		anki/proto/anki/*.proto \

node_modules:
	npm i