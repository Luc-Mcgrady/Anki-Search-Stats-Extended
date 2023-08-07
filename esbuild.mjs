import esbuild from 'esbuild'
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";

esbuild.build({
    entryPoints: ["src/ts/index.ts"],
    outfile: "graphs.min.js",
    bundle: true,
    minify: false, // This is actually required because I embed it inline for some insane reason I forgot.
    plugins: [
        esbuildSvelte({
          preprocess: sveltePreprocess(),
        }),
      ],
})