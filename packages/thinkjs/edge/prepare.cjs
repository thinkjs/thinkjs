const path = require('node:path');
const {createRequire} = require('node:module');
const {build} = require('esbuild');
const {readFile} = require('node:fs/promises');
const helperRequire = createRequire(require.resolve('think-helper'));
const routerRequire = createRequire(require.resolve('think-router'));

build({
  absWorkingDir: path.resolve(__dirname, '../../..'),
  entryPoints: [path.join(__dirname, 'shared-entry.js')],
  outfile: path.join(__dirname, 'shared.generated.js'),
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2022',
  plugins: [
    {
      name: 'framework-web-dependencies',
      setup(builder) {
        const replacements = {
          'think-helper': path.join(__dirname, 'helper.cjs'),
          assert: path.join(__dirname, 'assert.cjs'),
          querystring: path.join(__dirname, 'querystring.cjs'),
          debug: path.join(__dirname, 'debug.cjs'),
          'think-helper/node_modules/lodash.merge':
            helperRequire.resolve('lodash.merge'),
          'think-helper/node_modules/ms': helperRequire.resolve('ms'),
          'think-router/node_modules/path-to-regexp':
            routerRequire.resolve('path-to-regexp')
        };
        // Lodash's pure merge algorithm is retained, but its legacy Node probes
        // and Function-based global detection must never enter an edge bundle.
        builder.onLoad(
          {filter: /[/\\]lodash\.merge[/\\]index\.js$/},
          async (args) => {
            const source = await readFile(args.path, 'utf8');
            const contents = source
              .replace(
                "var root = freeGlobal || freeSelf || Function('return this')();",
                'var root = globalThis;'
              )
              .replace(
                /var nodeUtil = \(function\(\) \{[\s\S]*?\}\(\)\);/,
                'var nodeUtil;'
              );
            if (
              contents.includes("Function('return this')") ||
              contents.includes("require('util')")
            ) {
              throw new Error(
                'Unsupported lodash.merge version: review the edge adaptation'
              );
            }
            return {contents, loader: 'js'};
          }
        );
        builder.onResolve(
          {
            filter:
              /^(think-helper(?:\/.*)?|think-router\/node_modules\/path-to-regexp|assert|querystring|debug)$/
          },
          (args) => ({path: replacements[args.path]})
        );
      }
    }
  ]
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
