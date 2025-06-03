import esbuild from 'esbuild'
import esbuildSvelte from "esbuild-svelte";
import {typecheckPlugin} from '@jgoz/esbuild-plugin-typecheck';
import {sveltePreprocess} from "svelte-preprocess";

esbuild.build({
    entryPoints: ["src/ts/index.ts"],
    outfile: "stats.min.js",
    bundle: true,
    minify: false,
    plugins: [
        esbuildSvelte({
          preprocess: sveltePreprocess(),
        }),
        typecheckPlugin({
          configFile: "src/ts/tsconfig.json"
        })
      ],
})