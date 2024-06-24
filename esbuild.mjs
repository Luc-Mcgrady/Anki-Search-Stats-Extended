import esbuild from 'esbuild'
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";

esbuild.build({
    entryPoints: ["src/ts/index.ts"],
    outfile: "stats.min.js",
    bundle: true,
    minify: false,
    plugins: [
        esbuildSvelte({
          preprocess: sveltePreprocess(),
        }),
      ],
})