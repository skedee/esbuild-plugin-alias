import fs from 'fs';
import { getFilesSync } from 'files-folder'
import esbuild from 'esbuild'

console.log('build');
console.log('removing previous build.');
fs.rmSync('dist', { recursive: true, force: true });

const files1 = getFilesSync('src', { filter: /\.js$/ });
const files2 = getFilesSync('src', { filter: /\.ts$/ });
const filesAll = [...files1, ...files2];

console.log('including *.js, *.ts, .....');
console.log(filesAll);

esbuild
    .build({
        entryPoints: filesAll,
        bundle: false,
        minify: false,
        sourcemap: true,  // helpful for debugging
        target: ['node18'],
        platform: 'node',
        allowOverwrite: true,
        outdir: 'dist'
    })
    .catch((error) => {
        process.exit(1)
    })
