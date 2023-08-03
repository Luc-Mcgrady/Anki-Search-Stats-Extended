import esbuild from 'esbuild'
import sveltePlugin from 'esbuild-svelte'

esbuild.build({
    entryPoints: ["ts/src/index.ts"],
    outfile: "graphs.min.js",
    bundle: true,
    minify: true, // This is actually required because I embed it inline for some insane reason I forgot.
    plugins: [sveltePlugin()]
})