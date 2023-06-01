import esbuild from 'esbuild'
import { copy } from 'esbuild-plugin-copy';
import esbuildPluginAlias from './esbuildPluginAlias.js';

export function execute(filesAll, bundle, minify, sourcemap, opts) {
  esbuild
      .build({
          entryPoints: filesAll,
          bundle: bundle,
          minify: minify,
          sourcemap: sourcemap,  // helpful for debugging
          target: ['node18'],
          platform: 'node',
          allowOverwrite: true,
          outdir: opts.outDir,
          plugins: [
            esbuildPluginAlias(opts),
            copy({
              assets: [
                {
                  from: ['./src/**/*.json'],
                  to: ['./'],
                },
              ],
            }),
          ],
          loader: {
            '.js': 'js',
            '.ts': 'ts'
          }
      })
      .catch((error) => {
          process.exit(1)
      })
}