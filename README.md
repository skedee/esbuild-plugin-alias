# esbuild-plugin-alias

## about
* esbuild-plugin-alias supports paths resolution for esm exploded builds.
* esbuild only natively supports paths resolution for bundling scenario.
* esm exploded minified builds are usefull for creating shareable components for both node and
browser projects.
* single location to configure path aliases for both intellisene and bundling using (t|s)config.json
* configure the source and destination path in (t|s)config.json

## (t|s)config.json
* (t|s)config.json are config files using by mscode.
* mscode supports configuring
intellisene aliaes using (t|s)config.json, which helps navigating a project.
* unfortunately (t|s)config.json aliases are not natively used when bundling.

## install plugin
```
npm install -D git@github.com:skedee/esbuild-plugin-alias.git
```

## configure plugin
```
(t|s)config.json

{
    "compilerOptions": {
        ...
        "paths": {
            "@xyz/*": [ "xyz/*" ],
            "@zzz/*": [ "zzz/*" ],
            "@styles/*": [ "styles/*" ],
            "@/*": [ "*" ]
        }
    }
}
```

## configure esbuild to use plugin
```
import esbuild from 'esbuild'
import esbuildPluginAlias from 'esbuild-plugin-alias';

esbuild
    .build({
        entryPoints: ['....'],
        bundle: false,
        minify: true,
        sourcemap: true, // helpful for debugging
        target: ['chrome108', 'firefox113'],
        platform: 'browser',
        allowOverwrite: true,
        jsx: 'automatic',
        outdir: 'dist',
        plugins: [
          esbuildPluginAlias({outDir: 'dist'}),
        ]
    })
    .catch((error) => {
        process.exit(1)
    })
```

## configure .js or .jsx files

```
import { abc } from '@xyz';
import { log } from '@zzz/app';
```
## configure .css files

```
@import '@styles/index.css';

ul {
  ....
}
```
