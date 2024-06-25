INCLUDED = __init__.py stats.min.js stats.min.css developers.md manifest.json
OUT = searchStatsExtended.ankiaddon

COPIED = anki/graphs/Graph.sphelte

$(OUT): $(INCLUDED)
	zip $(OUT).zip $(INCLUDED)
	mv $(OUT).zip $(OUT)

stats.min.js: ${wildcard src/ts/*.ts} ${wildcard src/ts/*.svelte} esbuild.mjs src/ts/proto/ node_modules sass
	npm run format
	npm run build

sass:
	ln -s anki/sass sass

src/ts/proto/: node_modules
	mkdir src/ts/proto -p

	npx protoc \
		-I anki/proto \
		--es_out src/ts/proto \
		--es_opt target=ts \
		anki/proto/anki/*.proto \

node_modules:
	npm i