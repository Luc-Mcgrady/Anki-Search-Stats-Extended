WASM = stats_bg.wasm
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

${WASM}: ${wildcard src/rs/bindings/src/*.rs src/rs/bindings/Cargo.toml src/rs/lib/src/*.rs src/rs/lib/Cargo.toml}
	cargo install wasm-pack
	wasm-pack build src/rs/bindings -t web --release
	cp src/rs/bindings/pkg/search_stats_extended_wasm_bindings_bg.wasm ${WASM} -f