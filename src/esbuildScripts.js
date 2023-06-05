import esbuild from 'esbuild'
import esbuildPluginAlias from './esbuildPluginAlias.js';

/**
 * buildNode - esbuild example for node applications.
 *             configured build options, format: esm, platform: node, target: esnext.
 * @param {Array} filesAll list of files to include in bundle
 * @param {Boolean} bundle To bundle a file means to inline any imported dependencies
 *        into the file itself. This process is recursive so dependencies of dependencies
 *        (and so on) will also be inlined.
 * @param {Boolean} minify tell esbuild to automatically rename all properties that match this
 *        regular expression. It's useful when you want to minify certain property names in your
 *        code either to make the generated code smaller or to somewhat obfuscate your code's intent.
 * @param {Boolean} sourcemap can make it easier to debug your code. They encode the information necessary
 *        to translate from a line/column offset in a generated output file back to a line/column offset
 *        in the corresponding original input file.
 * @param {Map} opts
 */
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

/**
 * buildBrowser - esbuild example for browser applications.
 *             configured build options, format: esm, platform: browser, target: esnext.
 * @param {Array} filesAll list of files to include in bundle
 * @param {Boolean} bundle To bundle a file means to inline any imported dependencies
 *        into the file itself. This process is recursive so dependencies of dependencies
 *        (and so on) will also be inlined.
 * @param {Boolean} minify tell esbuild to automatically rename all properties that match this
 *        regular expression. It's useful when you want to minify certain property names in your
 *        code either to make the generated code smaller or to somewhat obfuscate your code's intent.
 * @param {Boolean} sourcemap can make it easier to debug your code. They encode the information necessary
 *        to translate from a line/column offset in a generated output file back to a line/column offset
 *        in the corresponding original input file.
 * @param {Map} opts
 */
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