WASM = stats.wasm
INCLUDED = __init__.py stats.min.js stats.min.css developers.md manifest.json config.json LICENSE ${wildcard locale/*.ftl} ${WASM}
OUT = searchStatsExtended.ankiaddon

COPIED = anki/graphs/Graph.sphelte

$(OUT): $(INCLUDED)
	zip $(OUT).zip $(INCLUDED)
	mv $(OUT).zip $(OUT)

stats.min.js: ${wildcard src/ts/*.ts src/ts/*.svelte src/ts/categories/*.ts src/ts/categories/*.svelte } esbuild.mjs src/ts/proto/ node_modules ${WASM}
	npm run format
	npm run build

src/ts/proto/: node_modules
	mkdir -p src/ts/proto

	npx protoc \
		-I anki/proto \
		--es_out src/ts/proto \
		--es_opt target=ts \
		anki/proto/anki/*.proto \

	-find src/ts/proto -type f -name "*.ts" -exec sed -i '' -e 's/\.js//g' {} +

node_modules:
	npm i

${WASM}: ${wildcard src/rs/src/*.rs}
	cargo install wasm-pack
	wasm-pack build src/rs -t web
	cp src/rs/pkg/search_stats_extended_bg.wasm ${WASM} -f