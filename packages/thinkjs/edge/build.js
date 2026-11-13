import {readdir, stat, mkdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {builtinModules} from 'node:module';
import {build} from 'esbuild';

const directory = path.dirname(fileURLToPath(import.meta.url));
const builtins = new Set(
  builtinModules.flatMap((name) => [name, `node:${name}`])
);

async function exists(file) {
  try {
    return await stat(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function files(root) {
  if (!(await exists(root))) return [];
  const result = [];
  for (const entry of await readdir(root, {withFileTypes: true})) {
    if (entry.name.startsWith('.')) continue;
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...(await files(file)));
    else if (/\.(?:[cm]?js|ts)$/.test(file) && !/\.d\.ts$/.test(file))
      result.push(file);
  }
  return result.sort();
}

/** Generate static imports without evaluating application modules at build time. */
export async function buildEdge({
  appPath,
  outfile,
  env = 'production',
  options = {}
}) {
  if (!appPath || !outfile)
    throw new TypeError('appPath and outfile are required');
  appPath = path.resolve(appPath);
  outfile = path.resolve(outfile);
  const multi = Boolean(await exists(path.join(appPath, 'common/config')));
  const modules = multi
    ? (await readdir(appPath, {withFileTypes: true}))
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .map((entry) => entry.name)
        .sort()
    : [];
  const imports = [];
  const expressions = [];
  let serial = 0;
  const importFile = (file) => {
    const name = `module${serial++}`;
    imports.push(`import * as ${name} from ${JSON.stringify(file)};`);
    return `unwrap(${name})`;
  };
  const find = async (folder, name) => {
    const candidates = [];
    for (const ext of ['js', 'ts', 'mjs', 'cjs']) {
      const file = path.join(folder, `${name}.${ext}`);
      if (await exists(file)) candidates.push(file);
    }
    if (candidates.length > 1)
      throw new Error(`Duplicate module: ${candidates.join(', ')}`);
    return candidates[0] ? importFile(candidates[0]) : '{}';
  };
  const map = async (folder) => {
    const entries = [];
    const seen = new Set();
    const source = (await files(folder)).sort(
      (a, b) =>
        b.split(path.sep).length - a.split(path.sep).length ||
        b.localeCompare(a)
    );
    for (const file of source) {
      const name = path
        .relative(folder, file)
        .replace(/\\/g, '/')
        .replace(/\.[^.]+$/, '');
      if (seen.has(name)) throw new Error(`Duplicate module: ${file}`);
      seen.add(name);
      entries.push(`${JSON.stringify(name)}: ${importFile(file)}`);
    }
    return `{${entries.join(',\n')}}`;
  };
  const common = path.join(appPath, multi ? 'common' : '');
  const configFolder = path.join(common, 'config');
  for (const file of await files(configFolder)) {
    if (/[/\\](?:adapter|crontab)(?:\.[^/\\]+)?\.(?:[cm]?js|ts)$/.test(file)) {
      throw new Error(
        `Unsupported edge configuration: ${file}; use platform bindings and Services`
      );
    }
  }
  const commonConfig = await find(configFolder, 'config');
  const commonEnv = await find(configFolder, `config.${env}`);
  if (multi) {
    const configs = [];
    for (const module of modules) {
      const folder = path.join(appPath, module, 'config');
      const config = module === 'common' ? '{}' : await find(folder, 'config');
      const environment =
        module === 'common' ? '{}' : await find(folder, `config.${env}`);
      configs.push(
        `${JSON.stringify(module)}: merge({}, ${commonConfig}, ${config}, ${commonEnv}, ${environment})`
      );
    }
    expressions.push(`config: {${configs.join(',\n')}}`);
  } else {
    expressions.push(`config: merge({}, ${commonConfig}, ${commonEnv})`);
  }
  for (const [type, key] of [
    ['controller', 'controllers'],
    ['logic', 'logics'],
    ['service', 'services']
  ]) {
    const shared = await map(path.join(common, type));
    if (multi) {
      const values = [];
      for (const module of modules) {
        const own =
          module === 'common'
            ? '{}'
            : await map(path.join(appPath, module, type));
        values.push(
          `${JSON.stringify(module)}: sort({...${shared}, ...${own}})`
        );
      }
      expressions.push(`${key}: {${values.join(',\n')}}`);
    } else expressions.push(`${key}: ${shared}`);
  }
  let routes = await find(configFolder, 'router');
  if (routes === '{}') routes = '[]';
  const moduleRoutes = [];
  for (const module of modules) {
    if (module !== 'common')
      moduleRoutes.push(
        `${JSON.stringify(module)}: ${await find(path.join(appPath, module, 'config'), 'router')}`
      );
  }
  expressions.push(`routers: routes(${routes}, {${moduleRoutes.join(',\n')}})`);
  expressions.push(`middleware: ${await map(path.join(common, 'middleware'))}`);
  const middlewareConfig = await find(configFolder, 'middleware');
  if (middlewareConfig !== '{}')
    expressions.push(`middlewares: ${middlewareConfig}`);
  expressions.push(
    `extensions: extensions(${await find(configFolder, 'extend')}, ${await map(path.join(common, 'extend'))})`
  );
  expressions.push(`validators: ${await find(configFolder, 'validator')}`);
  const bootstraps = [];
  for (const file of await files(path.join(common, 'bootstrap'))) {
    if (/worker\.(?:[cm]?js|ts)$/.test(file))
      bootstraps.push(`() => import(${JSON.stringify(file)}).then(unwrap)`);
    else if (!/master\.(?:[cm]?js|ts)$/.test(file))
      throw new Error(`Unsupported edge bootstrap: ${file}`);
  }
  expressions.push(`bootstrap: [${bootstraps.join(',\n')}]`);
  const source = `${imports.join('\n')}
import helper from 'think-helper/pure.js';
const merge = helper.extend;
function unwrap(value) {
  return value.default ?? value;
}
function sort(value) {
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => b.split('/').length - a.split('/').length || b.localeCompare(a)));
}
function extensions(config, local) {
  const result = {};
  for (const item of [].concat(config, local)) {
    for (const [name, value] of Object.entries(item)) {
      result[name] ||= {};
      Object.defineProperties(result[name], Object.getOwnPropertyDescriptors(value));
    }
  }
  return result;
}
function routes(common, modules) {
  if (Array.isArray(common)) return common;
  const result = merge({}, common);
  for (const name of Object.keys(result)) {
    if (Array.isArray(modules[name])) result[name].rules = modules[name];
  }
  return result;
}
export default {
modules: ${JSON.stringify(modules)},
${expressions.join(',\n')}
};`;
  // The manifest is loaded after the global think base classes are installed.
  const entry = `import {Application, installGlobal} from ${JSON.stringify(path.join(directory, 'index.js'))};
installGlobal();
const manifest = await import('thinkjs-edge-manifest');
const app = new Application({...${JSON.stringify({...options, env})}, runtime: 'edge', manifest: manifest.default}).run();
export default {fetch: (request, env, context) => app.fetch(request, env, context)};
`;
  await mkdir(path.dirname(outfile), {recursive: true});
  const result = await build({
    stdin: {
      contents: entry,
      resolveDir: appPath,
      sourcefile: 'thinkjs-edge-entry.js'
    },
    outfile,
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2022',
    metafile: true,
    write: false,
    logLevel: 'silent',
    plugins: [
      {
        name: 'thinkjs-edge-boundary',
        setup(builder) {
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

          builder.onResolve({filter: /^thinkjs-edge-manifest$/}, () => ({
            path: 'manifest',
            namespace: 'thinkjs-edge'
          }));
          builder.onLoad({filter: /.*/, namespace: 'thinkjs-edge'}, () => ({
            contents: source,
            resolveDir: directory,
            loader: 'js'
          }));
          builder.onResolve({filter: /.*/}, (args) => {
            if (builtins.has(args.path) || args.path.startsWith('node:')) {
              return {
                errors: [
                  {
                    text: `Node.js dependency ${args.path} is unsupported in edge: imported by ${args.importer}`
                  }
                ]
              };
            }
            if (args.path === 'thinkjs/edge')
              return {path: path.join(directory, 'index.js')};
            if (args.path === 'thinkjs')
              return {path: path.join(directory, '../lib/application.js')};
          });
        }
      }
    ]
  });
  if (result.warnings.length)
    throw new Error(
      result.warnings
        .map((warning) => `${warning.location?.file || ''}: ${warning.text}`)
        .join('\n')
    );
  const code = result.outputFiles[0].text;
  if (/\b(?:eval\s*\(|Function\s*\(|__require\s*\(\s*[^)])/.test(code))
    throw new Error(
      'Edge output contains dynamic evaluation or unresolved require'
    );
  const {writeFile} = await import('node:fs/promises');
  await writeFile(outfile, result.outputFiles[0].contents);
  return {
    outfile,
    bytes: result.outputFiles[0].contents.length,
    metafile: result.metafile
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [appPath, outfile, env] = process.argv.slice(2);
  buildEdge({appPath, outfile, env})
    .then((result) => {
      process.stdout.write(`Built ${result.outfile} (${result.bytes} bytes)\n`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
