const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
const middleware = require('..');
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-router-rest-'));
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
  for (const name of ['debug']) {
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
  const create = createRequire(path.join(source, 'package.json'))('./index.js');
  assert.equal(create({})(context(), () => 42), 42);
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

function context(controller = {_REST: true}, method = 'POST') {
  return {app: {modules: [], controllers: {user: controller}}, controller: 'user', method, action: 'index', query: {}};
}

function differential(name, scenario) {
  test(`legacy differential: ${name}`, async () => {
    const before = await scenario(legacy);
    const after = await scenario(middleware);
    assert.deepEqual(after, before);
  });
}

differential('HTTP and CLI methods, exact case and override truthiness', create => {
  const results = [];
  for (const method of ['GET', 'POST', 'CLI', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'post', 'cli', 'CUSTOM', '']) {
    for (const override of [undefined, null, false, 0, '', 'DeLeTe']) {
      const ctx = context({_REST: true, _method: '_method'}, method);
      ctx.query._method = override;
      assert.equal(create({})(ctx, () => 42), 42);
      assert.equal(ctx.action, (['POST', 'CLI'].includes(method) && override ? override : method).toLowerCase());
      results.push(ctx.action);
    }
  }
  return results;
});

differential('missing and falsy REST flags skip all routing and query work', create => {
  const results = [];
  for (const controller of [undefined, null, false, 0, '', {}, {_REST: false}, {_REST: 0}, {_REST: ''}]) {
    const ctx = context(controller);
    ctx.app.controllers.user = controller;
    Object.defineProperty(ctx, 'method', {get() { throw Error('must not read method'); }});
    Object.defineProperty(ctx, 'query', {get() { throw Error('must not read query'); }});
    assert.equal(create({})(ctx, () => 'skipped'), 'skipped');
    results.push(ctx.action);
  }
  assert.deepEqual(results, results.map(() => 'index'));
  return results;
});

differential('single and multi-module registries retain inherited lookup and missing errors', create => {
  const results = [];
  for (const module of ['home', 'admin']) {
    const ctx = context(); ctx.module = module;
    ctx.app = {modules: ['home', 'admin'], controllers: Object.create({home: Object.create({user: {_REST: true}}), admin: {user: {_REST: false}}})};
    create({})(ctx, () => undefined); results.push(ctx.action);
  }
  assert.deepEqual(results, ['post', 'index']);
  for (const module of [undefined, 'missing']) {
    const ctx = context(); ctx.module = module; ctx.app.modules = ['home'];
    let called = false;
    assert.throws(() => create({})(ctx, () => { called = true; }), TypeError);
    assert.equal(called, false);
  }
  const inherited = context(Object.create({_REST: 'enabled'}), 'GET');
  create({})(inherited, () => undefined);
  assert.equal(inherited.action, 'get');
  return results;
});

differential('custom constants and factory option snapshots', create => {
  const trace = [];
  const options = {get restConstName() { trace.push('rest'); return 'REST'; }, get methodConstName() { trace.push('method'); return 'METHOD'; }};
  const run = create(options);
  const ctx = context({REST: true, METHOD: 'verb'}); ctx.query.verb = 'PaTcH';
  run(ctx, () => trace.push('next'));
  assert.equal(ctx.action, 'patch');
  assert.deepEqual(trace, ['rest', 'method', 'next']);
  const mutable = {restConstName: 'REST', methodConstName: 'METHOD'};
  const saved = create(mutable); mutable.restConstName = 'changed'; mutable.methodConstName = 'changed';
  saved(ctx, () => undefined); assert.equal(ctx.action, 'patch');
  for (const settings of [{}, {restConstName: '', methodConstName: ''}, {restConstName: null, methodConstName: 0}, false, 1, 'options']) {
    const fallback = context({_REST: true, _method: 'verb'}); fallback.query.verb = 'DELETE';
    create(settings)(fallback, () => undefined); assert.equal(fallback.action, 'delete');
  }
  assert.throws(() => create(), TypeError);
  assert.throws(() => create(null), TypeError);
  return trace;
});

differential('controller classes and live registry changes are observed', create => {
  class Controller {}
  Controller._REST = true; Controller._method = 'verb';
  const ctx = context(Controller); ctx.query.verb = 'PUT';
  const run = create({}); run(ctx, () => undefined); assert.equal(ctx.action, 'put');
  Controller._REST = false; ctx.action = 'reset'; run(ctx, () => undefined); assert.equal(ctx.action, 'reset');
  ctx.app.controllers.user = {_REST: true}; run(ctx, () => undefined); assert.equal(ctx.action, 'post');
  return ctx.action;
});

differential('query getters are read twice and errors are not coerced or swallowed', create => {
  const trace = []; let queries = 0; let values = 0;
  const query = {get verb() { trace.push('verb'); return values++ ? 'PATCH' : 'DELETE'; }};
  const ctx = context({_REST: true, _method: 'verb'});
  Object.defineProperty(ctx, 'query', {get() { queries++; trace.push('query'); return query; }});
  create({})(ctx, () => trace.push('next'));
  assert.equal(ctx.action, 'patch'); assert.equal(queries, 2);
  assert.deepEqual(trace, ['query', 'verb', 'query', 'verb', 'next']);
  for (const value of [1, true, [], {}, ['DELETE']]) {
    const invalid = context({_REST: true, _method: 'verb'}); invalid.query.verb = value;
    let called = false;
    assert.throws(() => create({})(invalid, () => { called = true; }), TypeError);
    assert.equal(called, false);
  }
  for (const value of [undefined, null]) {
    const invalid = context({_REST: true, _method: 'verb'}); invalid.query = value;
    assert.throws(() => create({})(invalid, () => assert.fail('must not call next')), TypeError);
  }
  return trace;
});

differential('custom toLowerCase receiver and returned values remain untouched', create => {
  const marker = {custom: true};
  const value = {toLowerCase() { assert.equal(this, value); return marker; }};
  const ctx = context({_REST: true, _method: 7}); ctx.query[7] = value;
  create({})(ctx, () => undefined); assert.equal(ctx.action, marker);
  const coercible = {toString() { return 'verb'; }};
  const other = context({_REST: true, _method: coercible}); other.query.verb = 'PUT';
  create({})(other, () => undefined); assert.equal(other.action, 'put');
  return [ctx.action, other.action];
});

differential('accessor and proxy observation order matches legacy', create => {
  const trace = [];
  const track = (object, label) => new Proxy(object, {get(target, key, receiver) { trace.push(`${label}.${String(key)}`); return Reflect.get(target, key, receiver); }, set(target, key, value, receiver) { trace.push(`${label}.${String(key)}=${value}`); return Reflect.set(target, key, value, receiver); }});
  const controller = track({_REST: true, _method: 'verb'}, 'controller');
  const ctx = context(controller); ctx.query = track({verb: 'DELETE'}, 'query');
  ctx.app.controllers = track(ctx.app.controllers, 'controllers'); ctx.app = track(ctx.app, 'app');
  create({})(track(ctx, 'ctx'), () => trace.push('next'));
  assert.equal(ctx.action, 'delete');
  return trace;
});

differential('read-only and rejected writes retain non-strict behavior', create => {
  const results = [];
  const frozen = Object.freeze(context());
  const getter = context(); Object.defineProperty(getter, 'action', {get() { return 'getter'; }});
  const inherited = context(); delete inherited.action; Object.setPrototypeOf(inherited, Object.freeze({action: 'inherited'}));
  const noAction = context(); delete noAction.action; Object.preventExtensions(noAction);
  const falseProxy = new Proxy(context(), {set() { return false; }});
  for (const ctx of [frozen, getter, inherited, noAction, falseProxy]) {
    assert.equal(create({})(ctx, () => 'done'), 'done'); results.push(ctx.action);
  }
  assert.deepEqual(results, ['index', 'getter', 'inherited', undefined, 'index']);
  let receiver; let written;
  const setter = context(); Object.defineProperty(setter, 'action', {get() { return 'old'; }, set(value) { receiver = this; written = value; }});
  create({})(setter, () => undefined); assert.equal(receiver, setter); assert.equal(written, 'post');
  const error = new Error('write failure');
  for (const ctx of [new Proxy(context(), {set() { throw error; }}), Object.defineProperty(context(), 'action', {set() { throw error; }})]) {
    assert.throws(() => create({})(ctx, () => assert.fail('must not call next')), actual => actual === error);
  }
  return results;
});

differential('downstream return identity, receiver, throws and rejected promises', async create => {
  const run = create({}); const results = [];
  for (const controller of [{_REST: true}, {}]) {
    for (const value of [undefined, false, 0, '', {}, Promise.resolve(7), {then() { throw Error('must not await'); }}]) {
      let calls = 0;
      const returned = run(context(controller), function() { 'use strict'; assert.equal(this, undefined); calls++; return value; });
      assert.equal(returned, value); assert.equal(calls, 1); results.push(typeof returned);
    }
    const error = new Error('downstream');
    assert.throws(() => run(context(controller), () => { throw error; }), actual => actual === error);
    const rejected = Promise.reject(error); const returned = run(context(controller), () => rejected);
    assert.equal(returned, rejected); await assert.rejects(returned, actual => actual === error);
  }
  return results;
});

differential('factory and middleware remain anonymous nonconstructible arrows', create => {
  const run = create({});
  assert.equal(create.name, ''); assert.equal(create.length, 1); assert.equal(run.name, ''); assert.equal(run.length, 2);
  for (const fn of [create, run]) { assert.equal(fn.prototype, undefined); assert.throws(() => new fn({}), TypeError); }
  return [Object.keys(create), Object.keys(run)];
});

test('cold prepack installs offline with CommonJS, maps and TS 3.9/5.9 consumers', async t => {
  const {dir, source} = fixture(t);
  const tarballs = path.join(dir, 'tarballs');
  fs.mkdirSync(tarballs);
  const packed = pack(source, tarballs);
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'index.d.ts', 'index.js', 'lib/index.d.ts', 'lib/index.d.ts.map',
    'lib/index.js', 'lib/index.js.map', 'package.json', 'src/debug.d.ts', 'src/index.ts'
  ]);
  // Pack the installed dependency graph without lifecycle scripts; consumers
  // receive real tarballs, no workspace links, registry fallback or dev tools.
  const seen = new Set();
  function packDependencies(folder) {
    const localRequire = createRequire(path.join(folder, 'package.json'));
    const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
    const dependencies = {};
    for (const name of Object.keys(manifest.dependencies || {})) {
      const dependency = path.dirname(localRequire.resolve(`${name}/package.json`));
      const metadata = localRequire(`${name}/package.json`);
      const archive = path.join(tarballs, `${metadata.name.replace('@', '').replace('/', '-')}-${metadata.version}.tgz`);
      dependencies[name] = {'.': `file:${archive}`, ...packDependencies(dependency)};
      if (!seen.has(dependency)) {
        seen.add(dependency);
        assert.equal(pack(dependency, tarballs, true).archive, archive);
      }
    }
    return dependencies;
  }
  const overrides = {'think-router-rest': packDependencies(packageRoot)};
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  // Resolve the exact dependency graph from local tarballs without modifying
  // published manifests or relying on workspace links or a registry.
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const create = installedRequire('think-router-rest');
  assert.equal(typeof create, 'function');
  assert.equal(create.default, undefined);
  assert.equal(create, installedRequire('think-router-rest/index.js'));
  assert.equal(create, installedRequire('think-router-rest/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-router-rest')).href)).default, create);
  const ctx = context({_REST: true, _method: 'verb'}); ctx.query.verb = 'DELETE';
  assert.equal(create({})(ctx, () => 42), 42);
  assert.equal(ctx.action, 'delete');
  const installed = path.dirname(installedRequire.resolve('think-router-rest/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-router-rest/package.json');
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
    "import middleware = require('think-router-rest');",
    "import deep = require('think-router-rest/index.js');",
    "import compiled = require('think-router-rest/lib/index.js');",
    "import defaultImport from 'think-router-rest';",
    'class Controller {static _REST = true; static _method = "verb";}',
    'const ctx = {app: {modules: [], controllers: {user: Controller}}, controller: "user", method: "POST", action: "index", query: {verb: "DELETE"}};',
    'const run = middleware({});',
    'const number: number = run(ctx, () => 42);',
    'const asyncResult: Promise<string> = run(ctx, async () => "value");',
    'const voidResult: void = run(ctx, () => {});',
    'const object: {id: number} = run(ctx, () => ({id: 1}));',
    'interface Options {restConstName?: string; methodConstName?: string;}',
    'const options: Options = {restConstName: "REST", methodConstName: "METHOD"}; middleware(options);',
    'const multi = {app: {modules: ["home"], controllers: {home: {user: Controller}}}, module: "home", controller: "user", method: "GET"};',
    'run(multi, () => null);',
    'interface Query {verb: string | string[] | undefined;}',
    'const query: Query = {verb: ["DELETE"]}; run({...ctx, query}, () => undefined);',
    'const context: Parameters<ReturnType<typeof middleware>>[0] = ctx;',
    'run(context, () => undefined);',
    'deep(options)(ctx, () => 1); compiled({})(ctx, () => 1); defaultImport({})(ctx, () => 1);',
    '// @ts-expect-error The options argument is required by the runtime.',
    'middleware();',
    '// @ts-expect-error Options cannot be null.',
    'middleware(null);',
    '// @ts-expect-error Constant names must be strings.',
    'middleware({restConstName: true});',
    '// @ts-expect-error Constant names must be strings.',
    'middleware({methodConstName: 1});',
    '// @ts-expect-error The routing context is required.',
    'run({}, () => 1);',
    '// @ts-expect-error HTTP method must be a string.',
    'run({...ctx, method: 1}, () => 1);',
    '// @ts-expect-error Module names must be strings.',
    'run({...ctx, module: true}, () => 1);',
    '// @ts-expect-error A next function is required.',
    'run(ctx, 42);',
    '// @ts-expect-error Middleware calls next without required arguments.',
    'run(ctx, (value: string) => value);',
    '// @ts-expect-error The return value is exactly what next returns.',
    'const wrong: string = run(ctx, () => 1);',
    '// @ts-expect-error The factory is not a constructor.',
    'new middleware({});',
    'void number; void asyncResult; void voidResult; void object; void wrong;'
  ].join('\n'));
  fs.writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {strict: true, noEmit: true, skipLibCheck: false, types: [], target: 'ES2018', module: 'CommonJS', esModuleInterop: true},
    files: ['consumer.ts']
  }));
  const oldCompiler = createRequire(path.join(root, 'packages/think-typescript/package.json'));
  assert.equal(oldCompiler('typescript').version, '3.9.10');
  assert.equal(require('typescript').version, '5.9.3');
  const compilers = [oldCompiler.resolve('typescript/bin/tsc'), tsc];
  for (const compiler of compilers) compile(consumer, ['-p', 'tsconfig.json'], compiler);
  fs.writeFileSync(path.join(consumer, 'consumer.ts'),
    fs.readFileSync(path.join(consumer, 'consumer.ts'), 'utf8').replace(/\/\/ @ts-expect-error[^\n]*/g, ''));
  for (const compiler of compilers) {
    const errors = compile(consumer, ['-p', 'tsconfig.json'], compiler, compiler === tsc ? 2 : 1);
    assert.match(errors, /TS2345/);
    assert.match(errors, /TS2322/);
    assert.match(errors, /TS7009/);
  }
});
