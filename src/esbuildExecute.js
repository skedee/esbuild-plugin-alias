import esbuild from 'esbuild'
import esbuildPluginAlias from './esbuildPluginAlias.js';

export function buildNode(filesAll, bundle, minify, sourcemap, opts) {
  esbuild
      .build({
          entryPoints: filesAll,
          bundle: bundle,
          minify: minify,
          sourcemap: sourcemap,  // helpful for debugging
          format: "esm",
          platform: "node",
          target: ["esnext"],
          allowOverwrite: true,
          outdir: opts.outDir,
          plugins: [
            esbuildPluginAlias(opts)
          ]
      })
      .catch((error) => {
          process.exit(1)
      })
}

export function buildBrowser(filesAll, bundle, minify, sourcemap, opts) {
  esbuild
      .build({
          entryPoints: filesAll,
          bundle: bundle,
          minify: minify,
          sourcemap: sourcemap,  // helpful for debugging
          format: "esm",
          platform: "browser",
          target: ["esnext"],
          allowOverwrite: true,
          outdir: opts.outDir,
          plugins: [
            esbuildPluginAlias(opts)
          ]
      })
      .catch((error) => {
          process.exit(1)
      })
}