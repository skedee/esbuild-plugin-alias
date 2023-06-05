import fs from "fs";
import path from "node:path";

/*
 * esbuildPluginAlias - Is used to replace alias (@service) with the absolute path during bundling.
 * Support files types include (.js, .jsx, .ts, .css)
 *
 * @param: opts {
 *                outDir:  'directory where esbuild writes.'
 *                testDir: 'directory where esbuild writes test files.'
 *                importPrefix: 'alias used to access test-helper classes/functions. the absolute path
 *                         will resolve to testDir.'
 *              }
 */

export default function esbuildPluginAlias(opts) {
  let config;
  let outDir = "dist";
  let testDir = "tests";
  let importPrefix = "dist";

  // check for (t|s)config.json
  if (fs.existsSync("./tsconfig.json")) {
    config = JSON.parse(fs.readFileSync("./tsconfig.json"));
  } else if (fs.existsSync("./jsconfig.json")) {
    config = JSON.parse(fs.readFileSync("./jsconfig.json"));
  } else {
    console.error("esbuild-plugin-alias failed-reading: { tsconfig.json, jsconfig.json }");
    throw "esbuild-plugin-alias failed-reading: { tsconfig.json, jsconfig.json }";
  }

  // use default values for opts
  if (opts === undefined) {
    console.log("opts: missing, default-values {outDir: dist, importPrefix: dist, testDir: tests} ");
  }
  // use user defined values for opts
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
    name: "esbuild-plugin-alias",
    setup(build) {
      let countAll = 0;  // total number alias found
      const replaceAlias = async (args, loader) => {
        let loaderFile = await fs.promises.readFile(args.path, "utf8");
        let count = 0;
        Object.keys(config.compilerOptions.paths).forEach((aliasPath) => {
          aliasPath = aliasPath.replace("*", "");
          let aliasPathNew = aliasPath.replace("@", "");
          let regExpression = new RegExp(`${aliasPath}`, "g");
          count = count + (loaderFile.match(regExpression) || []).length;  // count of the found alias in the current file

          // determine the absolute path that should be used to replace the alias
          if (aliasPathNew === "/") {
            aliasPathNew = `${args.pluginData}`;
          }
          // keep tests in testDir
          else if (aliasPathNew === `${testDir}/`) {
            aliasPathNew = `${args.pluginData}`;
          }
          else {
            let prefixPath = args.pluginData.replace(testDir, importPrefix);
            // remove duplicate path
            if (prefixPath.endsWith(aliasPathNew)) {
              aliasPathNew = prefixPath;
            }
            // create path
            else {
              aliasPathNew = `${prefixPath}${aliasPathNew}`;
            }
          }
          loaderFile = loaderFile.replace(regExpression, aliasPathNew);
        });
        countAll = countAll + count;
        console.log(`onload ${loader}: ${args.path} count: ${count}`);
        return {
          contents: loaderFile,
          loader
        };
      };
      build.onStart(() => {
        console.log("esbuild-plugin-alias started");
      });
      build.onResolve({ filter: /.\.(jsx|js|css|json)$/, namespace: "file" }, (args) => {
        return { path: path.join(args.resolveDir, args.path), pluginData: path.join(args.resolveDir, outDir, "/") };
      });
      build.onLoad({ filter: /.\.(css)$/ }, async (args) => {
        return await replaceAlias(args, "css");
      });
      build.onLoad({ filter: /.\.(js)$/ }, async (args) => {
        return await replaceAlias(args, "js");
      });
      build.onLoad({ filter: /.\.(jsx)$/ }, async (args) => {
        return await replaceAlias(args, "jsx");
      });
      build.onEnd((result) => {
        console.log(`esbuild-plugin-alias: ended, countAll: ${countAll}, errors: ${result.errors.length}`);
      });
    }
  };
}
;
