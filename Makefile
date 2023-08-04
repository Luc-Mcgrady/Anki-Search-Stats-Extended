INCLUDED =  __init__.py graphs.min.js
OUT = addon.ankiaddon

$(OUT): $(INCLUDED)
	zip $(OUT).zip $(INCLUDED)
	mv $(OUT).zip $(OUT)

graphs.min.js: ts/src/* esbuild.mjs
	npm run build