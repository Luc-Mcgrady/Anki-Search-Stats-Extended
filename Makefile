INCLUDED = __init__.py stats.min.js stats.min.css developers.md manifest.json config.json LICENSE ${wildcard locale/*.ftl} 
OUT = searchStatsExtended.ankiaddon

COPIED = anki/graphs/Graph.sphelte

$(OUT): $(INCLUDED)
	zip $(OUT).zip $(INCLUDED)
	mv $(OUT).zip $(OUT)

stats.min.js: ${wildcard src/**/*.ts src/**/*.svelte} esbuild.mjs src/ts/proto/ node_modules
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