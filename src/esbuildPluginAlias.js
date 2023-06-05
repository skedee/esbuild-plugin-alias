import fs from 'fs';
import path from 'node:path'

export default function esbuildPluginAlias (opts) {
  let config;
  let outDir = 'dist';
  let testDir = "tests"
  let importPrefix = "dist"

  // does tsconfig.json exists.
  if (fs.existsSync('./tsconfig.json')) {
    config = JSON.parse(fs.readFileSync('./tsconfig.json'));
  }
  // does jsconfig.json exists.
  else if (fs.existsSync('./jsconfig.json')) {
    config = JSON.parse(fs.readFileSync('./jsconfig.json'));
  }
  else {
    console.error('esbuild-plugin-alias failed-reading: { tsconfig.json, jsconfig.json }');
    throw 'esbuild-plugin-alias failed-reading: { tsconfig.json, jsconfig.json }';
  }

  if (opts === undefined) {
    console.log('opts: missing, default-values {outDir: dist, importPrefix: dist, testDir: tests} ');
  }
  else {
    if (opts.outDir) {
      outDir = opts.outDir;
      importPrefix = outDir;
      console.log(`opts: outDir: ${opts.outDir}`);
    }
    if (opts.importPrefix) {
      importPrefix = opts.importPrefix;
      console.log(`opts: importPrefix: ${opts.importPrefix}`);
    }
    if (opts.testDir) {
      testDir = opts.testDir;
      console.log(`opts: testDir: ${opts.testDir}`);
    }
  }

  return {
    name: 'esbuild-plugin-alias',
    setup(build) {
      let  countAll = 0;  // count of all aliases detected.
      const replaceAlias = async (args, loader) => {
        let loaderFile = await fs.promises.readFile(args.path, 'utf8');
        let count = 0;  // count of aliases in the current file.
        // look through each defined alias in (T|J)config.json
        Object.keys(config.compilerOptions.paths).forEach(aliasPath => {
          aliasPath = aliasPath.replace("*", "");  // remove wildcard from end of the alias path.
          let aliasPathNew = aliasPath.replace("@", "");  // remove @ from the begining of the alias path.
          let regExpression = new RegExp(`${aliasPath}`, 'g');  // regular expression for alias path.
          count = count + (loaderFile.match(regExpression)|| []).length;  // count the number of aliaes in the current file.
          // strip duplicate '/'
          if (aliasPathNew === '/') {
            aliasPathNew = `${args.pluginData}`;  // the replacement string for the detected alias.
          }
          // @test paths should be copied to the testDir
          else if (aliasPathNew === `${testDir}/`) {
            aliasPathNew = `${args.pluginData}`;  // the replacement string for the detected alias.
          }
          else {
            const prefixPath = args.pluginData.replace(testDir, importPrefix);
            aliasPathNew = `${prefixPath}${aliasPathNew}`;  // the replacement string for the detected alias.
          }
          loaderFile = loaderFile.replace(regExpression, aliasPathNew);  // replace relative paths with absolute paths
        });
        countAll = countAll + count;
        console.log(`onload ${loader}: ${args.path} count: ${count}`);
        return {
          contents: loaderFile,
          loader: loader,
        }
      };
      build.onStart(() => {
        console.log('esbuild-plugin-alias started');
      });
      // // find all js, jsx, and css files in the resolveDir
      build.onResolve({ filter: /.\.(jsx|js|css|json)$/, namespace: "file" }, args => {
        return { path: path.join(args.resolveDir, args.path), pluginData: path.join(args.resolveDir, outDir, '/') };
      });
      // Load ".css files
      build.onLoad({ filter: /.\.(css)$/ }, async (args) => {
        return await replaceAlias(args, "css");
      });
      // Load ".js files
      build.onLoad({ filter: /.\.(js)$/ }, async (args) => {
        return await replaceAlias(args, "js");
      });
      // Load ".jsx files
      build.onLoad({ filter: /.\.(jsx)$/ }, async (args) => {
        return await replaceAlias(args, "jsx");
      });
      build.onEnd(result => {
        console.log(`esbuild-plugin-alias: ended, countAll: ${countAll}, errors: ${result.errors.length}`);
      });
    },
  }
};
