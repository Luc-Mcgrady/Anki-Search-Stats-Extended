INCLUDED = __init__.py graphs.min.js developers.md
OUT = addon.ankiaddon

COPIED = anki/graphs/Graph.sphelte

$(OUT): $(INCLUDED)
	zip $(OUT).zip $(INCLUDED)
	mv $(OUT).zip $(OUT)

graphs.min.js: ${wildcard ts/src/*.ts} ${wildcard ts/src/*.svelte} esbuild.mjs ts/src/proto node_modules sass
	npm run build

sass:
	ln -s anki/sass sass

ts/src/protc: node_modules
	mkdir ts/src/proto -p

	npx protoc \
		-I anki/proto \
		--es_out ts/src/proto \
		--es_opt target=ts \
		anki/proto/anki/*.proto \

node_modules:
	npm i