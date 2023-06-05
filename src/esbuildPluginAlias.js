import fs from "fs";
import path from "node:path";
export default function esbuildPluginAlias(opts) {
  let config;
  let outDir = "dist";
  let testDir = "tests";
  let importPrefix = "dist";
  if (fs.existsSync("./tsconfig.json")) {
    config = JSON.parse(fs.readFileSync("./tsconfig.json"));
  } else if (fs.existsSync("./jsconfig.json")) {
    config = JSON.parse(fs.readFileSync("./jsconfig.json"));
  } else {
    console.error("esbuild-plugin-alias failed-reading: { tsconfig.json, jsconfig.json }");
    throw "esbuild-plugin-alias failed-reading: { tsconfig.json, jsconfig.json }";
  }
  if (opts === void 0) {
    console.log("opts: missing, default-values {outDir: dist, importPrefix: dist, testDir: tests} ");
  } else {
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
      let countAll = 0;
      const replaceAlias = async (args, loader) => {
        let loaderFile = await fs.promises.readFile(args.path, "utf8");
        let count = 0;
        Object.keys(config.compilerOptions.paths).forEach((aliasPath) => {
          aliasPath = aliasPath.replace("*", "");
          let aliasPathNew = aliasPath.replace("@", "");
          let regExpression = new RegExp(`${aliasPath}`, "g");
          count = count + (loaderFile.match(regExpression) || []).length;
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
//# sourceMappingURL=esbuildPluginAlias.js.map
