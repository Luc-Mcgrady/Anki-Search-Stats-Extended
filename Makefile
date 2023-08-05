INCLUDED = __init__.py graphs.min.js developers.md
OUT = addon.ankiaddon

$(OUT): $(INCLUDED)
	zip $(OUT).zip $(INCLUDED)
	mv $(OUT).zip $(OUT)

graphs.min.js: ts/src/* esbuild.mjs ts/src/protc node_modules
	npm run build

ts/src/protc: node_modules
	mkdir ts/src/proto -p

	npx protoc \
		-I anki/proto \
		--es_out ts/src/proto \
		--es_opt target=ts \
		anki/proto/anki/*.proto \

node_modules:
	npm i