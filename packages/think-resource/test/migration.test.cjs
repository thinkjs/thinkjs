const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
const middleware = require('..');
const vm = require('node:vm');
const crypto = require('node:crypto');
const legacy = require('./fixtures/legacy.cjs');

const packageRoot = path.resolve(__dirname, '..');
const root = path.resolve(packageRoot, '../..');
const tsc = require.resolve('typescript/bin/tsc');

function findNpmCli() {
  const candidates = [
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')
  ];
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    candidates.push(path.join(dir, 'node_modules/npm/bin/npm-cli.js'));
    const launcher = path.join(dir, 'npm');
    if (fs.existsSync(launcher)) {
      const real = fs.realpathSync(launcher);
      if (path.basename(real) === 'npm-cli.js') candidates.push(real);
    }
  }
  const cli = candidates.find(file => fs.existsSync(file));
  assert.ok(cli, 'npm CLI is required; install a Node distribution that includes npm');
  return cli;
}
const npmCli = findNpmCli();

function npm(cwd, args, cache = path.join(cwd, '.npm-cache')) {
  return execFileSync(process.execPath, [npmCli, ...args], {
    cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    env: {...process.env,
      PATH: `${path.join(root, 'node_modules/.bin')}${path.delimiter}${process.env.PATH}`,
      npm_config_cache: cache,
      npm_config_ignore_scripts: 'false', npm_config_update_notifier: 'false'
    }
  });
}

function compile(cwd, args, compiler = tsc, expected = 0) {
  const result = spawnSync(process.execPath, [compiler, ...args], {cwd, encoding: 'utf8'});
  assert.ifError(result.error);
  assert.equal(result.status, expected, result.stdout + result.stderr);
  return result.stdout + result.stderr;
}

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-resource-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const source = path.join(dir, 'source');
  fs.mkdirSync(source);
  for (const file of ['package.json', 'index.js', 'index.d.ts', 'README.md', 'LICENSE', 'src', 'tsconfig.build.json']) {
    fs.cpSync(path.join(packageRoot, file), path.join(source, file), {recursive: true});
  }
  const file = path.join(source, 'tsconfig.build.json');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  config.extends = path.join(root, 'tsconfig.base.json');
  fs.writeFileSync(file, JSON.stringify(config));
  fs.mkdirSync(path.join(source, 'node_modules'), {recursive: true});
  const localRequire = createRequire(path.join(packageRoot, 'package.json'));
  for (const name of ['think-helper', '@types/node']) {
    fs.mkdirSync(path.dirname(path.join(source, 'node_modules', name)), {recursive: true});
    fs.symlinkSync(path.dirname(localRequire.resolve(`${name}/package.json`)), path.join(source, 'node_modules', name),
      process.platform === 'win32' ? 'junction' : 'dir');
  }
  return {dir, source};
}

function pack(source, tarballs, ignoreScripts = false) {
  const output = npm(source, ['pack', '--json', '--pack-destination', tarballs, ...(ignoreScripts ? ['--ignore-scripts'] : [])], path.join(tarballs, '.npm-cache'));
  const [packed] = JSON.parse(output.slice(output.indexOf('[\n')));
  return {...packed, archive: path.join(tarballs, packed.filename)};
}

test('cold build, no-emit check and clean preserve source and non-output files', t => {
  const {source} = fixture(t);
  assert.equal(fs.existsSync(path.join(source, 'lib')), false);
  compile(source, ['-b', 'tsconfig.build.json']);
  const files = ['index.js', 'index.js.map', 'index.d.ts', 'index.d.ts.map'];
  const before = files.map(file => fs.readFileSync(path.join(source, 'lib', file), 'utf8'));
  compile(source, ['-p', 'tsconfig.build.json', '--noEmit']);
  assert.deepEqual(files.map(file => fs.readFileSync(path.join(source, 'lib', file), 'utf8')), before);
  fs.writeFileSync(path.join(source, 'lib/keep.txt'), 'not a compiler output');
  compile(source, ['-b', 'tsconfig.build.json', '--clean']);
  for (const file of files) assert.equal(fs.existsSync(path.join(source, 'lib', file)), false);
  assert.ok(fs.existsSync(path.join(source, 'src/index.ts')));
  assert.ok(fs.existsSync(path.join(source, 'index.js')));
  assert.equal(fs.readFileSync(path.join(source, 'lib/keep.txt'), 'utf8'), 'not a compiler output');
  compile(source, ['-b', 'tsconfig.build.json']);
});

test('prepack restores deleted outputs even when incremental metadata remains', t => {
  const {dir, source} = fixture(t);
  compile(source, ['-b', 'tsconfig.build.json']);
  fs.rmSync(path.join(source, 'lib'), {recursive: true});
  assert.ok(fs.existsSync(path.join(source, '.build/tsconfig.tsbuildinfo')));
  const packed = pack(source, dir);
  for (const file of ['lib/index.js', 'lib/index.js.map', 'lib/index.d.ts', 'lib/index.d.ts.map']) {
    assert.ok(packed.files.some(item => item.path === file), file);
  }
  const create = isolated(path.join(source, 'lib/index.js'), () => Promise.resolve('done'));
  assert.equal(create({root: '.'})({path: '/', method: 'POST'}, () => 42), 42);
});

test('prepack blocks type errors even when stale compiled artifacts exist', t => {
  const {dir, source} = fixture(t);
  compile(source, ['-b', 'tsconfig.build.json']);
  fs.appendFileSync(path.join(source, 'src/index.ts'), '\nconst invalid: number = "wrong"; void invalid;\n');
  assert.throws(() => pack(source, dir), error => {
    assert.notEqual(error.status, 0);
    assert.match(String(error.stdout) + String(error.stderr), /TS2322/);
    return true;
  });
  assert.equal(fs.readdirSync(dir).some(file => file.endsWith('.tgz')), false);
});


// Compile each untouched CommonJS module with an isolated dependency boundary.
// vm keeps native values/RegExp behavior in this realm, without monkey-patching
// the test runner's require cache or relying on a live filesystem for branches.
function isolated(filename, send, trace = []) {
  const exports = {};
  const module = {exports};
  const localRequire = createRequire(path.join(packageRoot, 'package.json'));
  const load = name => {
    if (name === 'koa-send') return send;
    if (name === 'debug') return namespace => (...args) => trace.push([namespace, ...args]);
    return localRequire(name);
  };
  vm.runInThisContext(`(function(exports, require, module) {${fs.readFileSync(filename, 'utf8')}\n})`, {filename})(exports, load, module);
  return module.exports;
}

function differential(name, scenario) {
  test(`legacy differential: ${name}`, async () => {
    const values = [];
    for (const file of ['test/fixtures/legacy.cjs', 'lib/index.js']) {
      values.push(await scenario((send, trace) => isolated(path.join(packageRoot, file), send, trace)));
    }
    assert.deepEqual(values[1], values[0]);
  });
}

test('the frozen legacy implementation is unchanged from the base', () => {
  const contents = fs.readFileSync(path.join(__dirname, 'fixtures/legacy.cjs'));
  assert.equal(crypto.createHash('sha256').update(contents).digest('hex'), 'eea2ed9ed008a595a9c707dbf3f20c9c4c2976087b9dd553ae2c1fd3b84eb9f9');
});

test('CommonJS factory and returned function shape are preserved', () => {
  assert.equal(typeof middleware, 'function');
  assert.equal(middleware.name, legacy.name);
  assert.equal(middleware.length, legacy.length);
  assert.ok(middleware.prototype);
  assert.equal(middleware.default, undefined);
  assert.equal(middleware.__esModule, undefined);
  assert.equal(middleware, require('../index.js'));
  assert.equal(middleware, require('../lib/index.js'));
  assert.equal(middleware({root: '.'}).name, 'serve');
  assert.equal(middleware({root: '.'}).length, 2);
  assert.equal(typeof new middleware({root: '.'}), 'function');
});

differential('missing root, invalid routes and root resolution failures', load => {
  const create = load(() => { throw Error('must not send'); });
  const failures = [];
  for (const options of [undefined, null, false, 0, '', {}, {root: ''}, {root: 42}, {root: '.', publicPath: null}, {root: '.', publicPath: false}, {root: '.', publicPath: 3}]) {
    assert.throws(() => create(options), error => {
      failures.push([error.name, error.code, error.message]); return true;
    });
  }
  assert.match(failures[0][2], /root directory is required/);
  assert.match(failures[8][2], /publicPath must be regexp or string/);
  return failures;
});

differential('defaults, recursive option snapshot, inherited/symbol options and getter reads', async load => {
  const trace = [];
  const calls = [];
  const create = load((ctx, pathname, options) => {calls.push([pathname, {...options}]); return Promise.resolve('file');}, trace);
  const proto = {hidden: true};
  const options = Object.assign(Object.create(proto), {root: '.', publicPath: 'static', extensions: ['txt'], custom: {value: 1}});
  Object.defineProperty(options, 'gzip', {enumerable: true, get() {trace.push('gzip'); return true;}});
  options[Symbol('not copied')] = 42;
  const run = create(options);
  options.root = '/changed'; options.publicPath = '/changed';
  options.extensions.push('html'); options.custom.value = 2;
  assert.equal(await run({path: '/static/file', method: 'GET'}, () => {throw Error('no next');}), undefined);
  const sent = calls[0][1];
  assert.equal(sent.root, path.resolve('.'));
  assert.equal(sent.publicPath, '/static'); assert.equal(sent.hidden, true);
  assert.equal(sent.index, 'index.html'); assert.equal(sent.format, true);
  assert.equal(sent.gzip, true); assert.equal(sent.maxage, 0);
  assert.equal(sent.setHeaders, false); assert.equal(sent.notFoundNext, false);
  assert.deepEqual(sent.extensions, ['txt']); assert.equal(sent.custom.value, 1);
  assert.equal(Object.getOwnPropertySymbols(sent).length, 0);
  assert.equal(trace.filter(item => item === 'gzip').length, 1);
  const fresh = create({root: '.'});
  await fresh({path: '/x', method: 'GET'}, () => {});
  assert.equal(calls[1][1].publicPath, '/'); assert.equal(calls[1][1].gzip, false);
  return calls;
});

differential('string routes match segments without stripping the public prefix', async load => {
  const results = [];
  for (const route of ['/', '', 'static', '/static', '/static/', '/static//', '/static/nested', '/static/nested/']) {
    for (const pathname of ['/', '/static', '/static/', '/static/file', '/static/nested', '/static/nested/file', '//static///file', '/statics/file', 'static/file']) {
      const trace = [];
      const run = load((ctx, sentPath) => {trace.push(['send', sentPath]); return Promise.resolve('done');})({root: '.', publicPath: route});
      await run({path: pathname, method: 'GET'}, () => trace.push(['next']));
      results.push([route, pathname, trace]);
    }
  }
  assert.deepEqual(results.find(row => row[0] === '/static' && row[1] === '/static/file')[2], [['send', '/static/file']]);
  assert.deepEqual(results.find(row => row[0] === '/static' && row[1] === '/statics/file')[2], [['next']]);
  return results;
});

differential('regexp global/sticky state and custom match behavior are not normalized', async load => {
  const results = [];
  for (const makeRoute of [() => /^\/static/, () => /static/g, () => /static/y, () => {const r = /unused/; r[Symbol.match] = function(input) {return input.includes('static') ? {} : null;}; return r;}]) {
    const route = makeRoute(); route.lastIndex = 1;
    const trace = [];
    const run = load(() => {trace.push('send'); return Promise.resolve('done');})({root: '.', publicPath: route});
    for (const pathname of ['/static/a', '/static/a', '/other', '/static/b']) {
      await run({path: pathname, method: 'GET'}, () => trace.push('next'));
      trace.push(route.lastIndex);
    }
    results.push(trace);
  }
  return results;
});

differential('HEAD and GET are served, all other methods and casing delegate unchanged', async load => {
  const results = [];
  for (const method of ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'head', 'get', undefined]) {
    const trace = [];
    const run = load(() => {trace.push('send'); return Promise.resolve('done');})({root: '.'});
    const result = run({path: '/', method}, () => {trace.push('next'); return 42;});
    results.push([method, result instanceof Promise, await result, trace]);
  }
  assert.deepEqual(results[0], ['HEAD', true, undefined, ['send']]);
  assert.deepEqual(results[2], ['POST', false, 42, ['next']]);
  return results;
});

differential('unmatched next values, receivers and synchronous errors preserve identity', load => {
  const run = load(() => {throw Error('no send');})({root: '.', publicPath: '/static'});
  const values = [undefined, null, false, 0, 'value', {}, Promise.resolve(1), {then() {throw Error('no await');}}];
  for (const value of values) {
    let calls = 0;
    assert.equal(run({path: '/other', method: 'GET'}, function() {'use strict'; assert.equal(this, undefined);calls++;return value;}), value);
    assert.equal(calls, 1);
  }
  const failure = new Error('next failed');
  assert.throws(() => run({path: '/other'}, () => {throw failure;}), error => error === failure);
  return values.map(value => typeof value);
});

differential('send values are discarded and only falsy values allow configured fallthrough', async load => {
  const results = [];
  for (const done of [undefined, null, false, 0, '', 'file', true, {}]) {
    for (const notFoundNext of [false, true, undefined, null, 0, 'yes']) {
      let calls = 0;
      const run = load(() => Promise.resolve(done))({root: '.', notFoundNext});
      const result = await run({path: '/', method: 'GET'}, () => {calls++;return 'downstream';});
      assert.equal(calls, !done && notFoundNext ? 1 : 0);
      assert.equal(result, calls ? 'downstream' : undefined);
      results.push([typeof done, notFoundNext, result, calls]);
    }
  }
  return results;
});

differential('send synchronous throws/rejections never call next and preserve the error', async load => {
  let calls = 0;
  const failure = new Error('send failure');
  let run = load(() => {throw failure;})({root: '.', notFoundNext: true});
  assert.throws(() => run({path: '/', method: 'GET'}, () => calls++), error => error === failure);
  run = load(() => Promise.reject(failure))({root: '.', notFoundNext: true});
  await assert.rejects(run({path: '/', method: 'GET'}, () => calls++), error => error === failure);
  assert.equal(calls, 0);
  return calls;
});

differential('matched downstream throws/rejections and asynchronous values are adopted', async load => {
  const run = load(() => Promise.resolve(undefined))({root: '.', notFoundNext: true});
  const failure = new Error('downstream failure');
  await assert.rejects(run({path: '/', method: 'GET'}, () => {throw failure;}), error => error === failure);
  await assert.rejects(run({path: '/', method: 'GET'}, () => Promise.reject(failure)), error => error === failure);
  const expected = {value: true};
  assert.equal(await run({path: '/', method: 'GET'}, () => Promise.resolve(expected)), expected);
  return expected;
});

differential('context accessor read counts, order and receivers stay unchanged', async load => {
  const traces = [];
  for (const method of ['GET', 'HEAD', 'POST']) {
    const trace = [];
    const ctx = {get path() {assert.equal(this,ctx);trace.push('path');return '/static';}, get method() {assert.equal(this,ctx);trace.push('method');return method;}};
    const run = load((sent, pathname) => {assert.equal(sent,ctx);trace.push(['send',pathname]);return Promise.resolve('file');})({root: '.', publicPath: '/static'});
    await run(ctx, () => trace.push('next'));
    traces.push(trace);
  }
  assert.deepEqual(traces[0], ['path', 'method', 'method', 'path', ['send', '/static']]);
  assert.deepEqual(traces[1], ['path', 'method', 'path', ['send', '/static']]);
  assert.deepEqual(traces[2], ['path', 'method', 'method', 'next']);
  return traces;
});

differential('send receives the same mutable options object while fallthrough is captured', async load => {
  let saved;
  const run = load((ctx, pathname, options) => {
    if (saved) assert.equal(options, saved);
    saved = options;
    options.notFoundNext = false;
    options.publicPath = '/changed';
    return Promise.resolve(undefined);
  })({root: '.', notFoundNext: true});
  let calls = 0;
  await run({path: '/', method: 'GET'}, () => ++calls);
  assert.equal(calls, 1);
  assert.equal(run({path: '/old', method: 'GET'}, () => ++calls), 2);
  await run({path: '/changed', method: 'GET'}, () => ++calls);
  assert.equal(calls, 3);
  return calls;
});

differential('header callback identity and cloned extension values', async load => {
  const extensions = ['txt'];
  const failure = new Error('headers failed');
  const setHeaders = () => {throw failure;};
  const run = load((ctx, pathname, options) => {
    assert.notEqual(options.extensions, extensions);assert.deepEqual(options.extensions, extensions);assert.equal(options.setHeaders,setHeaders);
    return Promise.resolve().then(() => options.setHeaders());
  })({root: '.', extensions, setHeaders});
  await assert.rejects(run({path: '/', method: 'GET'}, () => {}), error => error === failure);
  return true;
});

differential('boxed string routes are rejected and nonstring JS paths retain original errors', async load => {
  const values = [];
  const create = load((ctx, pathname) => {values.push(pathname);return Promise.resolve('file');});
  assert.throws(() => create({root: '.', publicPath: new String('static')}), /publicPath must be regexp or string/);
  const run = create({root: '.', publicPath: 'static'});
  await run({path: '/static', method: 'GET'}, () => values.push('next'));
  for (const pathname of [undefined, null, 42, {}, []]) {
    assert.throws(() => run({path: pathname, method: 'GET'}, () => {}), TypeError);
  }
  return values;
});

test('cold prepack installs offline with CommonJS, source maps and TS 3.9/5.9 consumers', async t => {
  const {dir, source} = fixture(t);
  const tarballs = path.join(dir, 'tarballs');
  fs.mkdirSync(tarballs);
  const packed = pack(source, tarballs);
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'index.d.ts', 'index.js', 'lib/index.d.ts', 'lib/index.d.ts.map',
    'lib/index.js', 'lib/index.js.map', 'package.json', 'src/dependencies.d.ts', 'src/index.ts'
  ]);
  const versions = new Map();
  const seen = new Set();
  const overrides = {};
  function packDependencies(folder) {
    const localRequire = createRequire(path.join(folder, 'package.json'));
    const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
    for (const name of Object.keys(manifest.dependencies || {})) {
      const dependency = path.dirname(localRequire.resolve(`${name}/package.json`));
      const metadata = localRequire(`${name}/package.json`);
      const key = `${name}@${metadata.version}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const archive = pack(dependency, tarballs, true).archive;
      const records = versions.get(name) || [];
      records.push({version: metadata.version, archive});
      versions.set(name, records);
      packDependencies(dependency);
    }
  }
  packDependencies(packageRoot);
  // Flat exact overrides avoid npm 11.19's registry fallback for nested trees.
  // Keep distinct ms versions by exact selector; publish no modified manifests.
  const dependencies = {};
  for (const [name, records] of versions) {
    if (records.length === 1) {
      dependencies[name] = `file:${records[0].archive}`;
      overrides[name] = dependencies[name];
    } else {
      for (const {version, archive} of records) overrides[`${name}@${version}`] = `file:${archive}`;
    }
  }
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, dependencies, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const create = installedRequire('think-resource');
  assert.equal(typeof create, 'function');
  assert.equal(create.default, undefined);
  assert.equal(create, installedRequire('think-resource/index.js'));
  assert.equal(create, installedRequire('think-resource/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-resource')).href)).default, create);
  assert.equal(create({root: '.'})({path: '/', method: 'POST'}, () => 42), 42);
  const assets = path.join(consumer, 'assets');
  fs.mkdirSync(assets);
  fs.writeFileSync(path.join(assets, 'installed.txt'), 'installed package content');
  const headers = new Map();
  const ctx = {
    path: '/installed.txt', method: 'GET', body: undefined,
    acceptsEncodings: () => 'identity',
    res: {removeHeader(name) {headers.delete(name);}},
    response: {get(name) {return headers.get(name);}},
    set(name, value) {headers.set(name, value);}
  };
  assert.equal(await create({root: assets})(ctx, () => {throw Error('must serve');}), undefined);
  let content = '';
  for await (const chunk of ctx.body) content += chunk;
  assert.equal(content, 'installed package content');
  assert.equal(headers.get('Content-Length'), content.length);
  assert.equal(ctx.type, '.txt');
  const installed = path.dirname(installedRequire.resolve('think-resource/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-resource/package.json');
  assert.equal(manifest.main, 'index.js');
  assert.equal(manifest.types, 'index.d.ts');
  assert.equal(manifest.exports, undefined);
  for (const name of ['typescript', '@types/node']) {
    assert.equal(fs.existsSync(path.join(consumer, 'node_modules', name)), false);
  }
  for (const extension of ['js', 'd.ts']) {
    const mapFile = path.join(installed, `lib/index.${extension}.map`);
    const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
    assert.equal(map.file, `index.${extension}`);
    assert.deepEqual(map.sources, ['../src/index.ts']);
    assert.ok(fs.existsSync(path.resolve(path.dirname(mapFile), map.sources[0])));
  }
  fs.writeFileSync(path.join(consumer, 'consumer.ts'), [
    "import resource = require('think-resource');",
    "import deep = require('think-resource/index.js');",
    "import compiled = require('think-resource/lib/index.js');",
    "import defaultImport from 'think-resource';",
    'const ctx = {',
    '  path: "/file.txt", method: "GET", type: "", body: undefined as unknown,',
    '  acceptsEncodings(...encodings: string[]): string | false {return encodings[0] || false;},',
    '  throw(message: string, status: number): never {throw new Error(message + status);},',
    '  set(field: string, value: string | string[]): void {void field; void value;},',
    '  res: {setHeader(name: string, value: string | number | readonly string[]) {void name;void value;},',
    '    getHeader(name: string): string | number | string[] | undefined {return name;}, removeHeader(name: string) {void name;}},',
    '  response: {get(field: string): string {return field;}}',
    '};',
    'const run = resource({root: "."});',
    'const constructed = new resource({root: "."}); constructed(ctx, () => 1);',
    'const synchronous: number | Promise<number | undefined> = run(ctx, () => 42);',
    'const asynchronous: Promise<number | undefined> = run(ctx, async () => 42);',
    'const empty: void | Promise<void> = run(ctx, () => {});',
    'resource({root: ".", publicPath: /^\\/assets/, index: false, extensions: ["txt"], maxage: 1000});',
    'resource({root: ".", publicPath: "assets", hidden: true, format: false, gzip: true, extensions: false, maxAge: 100, notFoundNext: true});',
    'resource({root: ".", setHeaders(res, path, stats) {',
    '  res.setHeader("x-path", path); res.setHeader("Content-Length", stats.size);',
    '  res.setHeader("Last-Modified", stats.mtime.toUTCString()); res.removeHeader("etag");',
    '  const header: string | number | string[] | undefined = res.getHeader("etag");',
    '  const file: boolean = stats.isFile(); void header; void file;',
    '}});',
    'interface Config {root: string; publicPath?: RegExp; notFoundNext?: boolean;}',
    'const config: Config = {root: "."}; resource(config);',
    'deep(config)(ctx, () => 1); compiled(config)(ctx, () => 1); defaultImport(config)(ctx, () => 1);',
    '// @ts-expect-error A root directory is required.',
    'resource();',
    '// @ts-expect-error A root directory is required in options.',
    'resource({});',
    '// @ts-expect-error Root is a path string.',
    'resource({root: 1});',
    '// @ts-expect-error A route must be a string or regular expression.',
    'resource({root: ".", publicPath: 1});',
    '// @ts-expect-error Header callback is callable or false, not true.',
    'resource({root: ".", setHeaders: true});',
    '// @ts-expect-error Extensions contain path suffix strings.',
    'resource({root: ".", extensions: [1]});',
    '// @ts-expect-error The callback path is a string.',
    'resource({root: ".", setHeaders(res, path: number, stats) {void res;void path;void stats;}});',
    '// @ts-expect-error A real Koa-compatible context is required, not just a path.',
    'run({path: "/", method: "GET"}, () => 1);',
    '// @ts-expect-error next must be callable.',
    'run(ctx, 42);',
    '// @ts-expect-error next receives no required arguments.',
    'run(ctx, (value: string) => value);',
    '// @ts-expect-error Matched requests may complete without downstream data.',
    'const wrong: Promise<number> = run(ctx, async () => 42);',
    '// @ts-expect-error Async downstream promises are assimilated, not nested.',
    'const nested: Promise<Promise<number> | undefined> = run(ctx, async () => 42);',
    'void synchronous; void asynchronous; void empty; void wrong; void nested;'
  ].join('\n'));
  fs.writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {strict: true, noEmit: true, skipLibCheck: false, types: [], target: 'ES2018', module: 'CommonJS', esModuleInterop: true},
    files: ['consumer.ts']
  }));
  const legacyCompiler = createRequire(path.join(root, 'packages/think-typescript/package.json'));
  assert.equal(legacyCompiler('typescript').version, '3.9.10');
  assert.equal(require('typescript').version, '5.9.3');
  const compilers = [legacyCompiler.resolve('typescript/bin/tsc'), tsc];
  for (const compiler of compilers) compile(consumer, ['-p', 'tsconfig.json'], compiler);
  // Optional explicit Node annotations consume the maintainer's real ambient
  // declarations, separately from the Node-free installed TS3.9/5.9 checks.
  fs.writeFileSync(path.join(consumer, 'node-hook.ts'), [
    "import resource = require('think-resource');",
    "import {ServerResponse} from 'http';",
    "import {Stats} from 'fs';",
    'resource({root: ".", setHeaders(response: ServerResponse, path: string, stats: Stats) {',
    '  response.setHeader("x-file", path); response.setHeader("x-created", stats.birthtime.toISOString());',
    '}});'
  ].join('\n'));
  const nodeTypes = path.dirname(require.resolve('@types/node/package.json'));
  compile(consumer, ['--strict', '--noEmit', '--skipLibCheck', 'false', '--target', 'ES2018',
    '--module', 'CommonJS', '--typeRoots', path.dirname(nodeTypes), '--types', 'node', 'node-hook.ts']);
  fs.writeFileSync(path.join(consumer, 'consumer.ts'),
    fs.readFileSync(path.join(consumer, 'consumer.ts'), 'utf8').replace(/\/\/ @ts-expect-error[^\n]*/g, ''));
  for (const compiler of compilers) {
    const errors = compile(consumer, ['-p', 'tsconfig.json'], compiler, compiler === tsc ? 2 : 1);
    assert.match(errors, /TS2345/);
    assert.match(errors, /TS2322/);
    assert.match(errors, /TS2554/);
  }
});

test('real HTTP serving and fallthrough match the legacy middleware', async t => {
  const Koa = require('koa');
  const request = require('supertest');
  const root = path.join(__dirname, 'assets');
  const results = [];
  for (const create of [legacy, middleware]) {
    const current = [];
    for (const scenario of [
      {method: 'head', pathname: '/1.txt', options: {}},
      {method: 'get', pathname: '/missing', options: {notFoundNext: true}},
      {method: 'get', pathname: '/missing', options: {notFoundNext: false}},
      {method: 'post', pathname: '/1.txt', options: {}},
      {method: 'get', pathname: '/1.txt', options: {publicPath: '/other'}},
      {method: 'get', pathname: '/1.txt', options: {maxAge: 7000, setHeaders(response, pathname, stats) {
        response.setHeader('x-file-size', String(stats.size));
        response.setHeader('x-file-name', path.basename(pathname));
      }}}
    ]) {
      let downstream = 0;
      const app = new Koa();
      app.use(create({root, ...scenario.options}));
      app.use(ctx => {downstream++;ctx.body = 'downstream';});
      const server = app.listen();
      t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
      const response = await request(server)[scenario.method](scenario.pathname);
      current.push({status: response.status, text: response.text, downstream,
        length: response.headers['content-length'], cache: response.headers['cache-control'],
        fileSize: response.headers['x-file-size'], fileName: response.headers['x-file-name']});
    }
    assert.equal(current[0].status, 200);assert.equal(current[0].text, undefined);assert.equal(current[0].downstream, 0);
    assert.equal(current[1].text, 'downstream');assert.equal(current[1].downstream, 1);
    assert.equal(current[2].status, 404);assert.equal(current[2].downstream, 0);
    assert.equal(current[3].text, 'downstream');assert.equal(current[4].text, 'downstream');
    assert.equal(current[5].cache, 'max-age=7');assert.equal(current[5].fileName, '1.txt');
    results.push(current);
  }
  assert.deepEqual(results[1], results[0]);
});
