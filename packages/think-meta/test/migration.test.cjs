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
  try {
    return execFileSync(process.execPath, [npmCli, ...args], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      env: {...process.env,
        PATH: `${path.join(root, 'node_modules/.bin')}${path.delimiter}${process.env.PATH}`,
        npm_config_cache: cache,
        npm_config_ignore_scripts: 'false', npm_config_update_notifier: 'false'
      }
    });
  } catch (error) {
    // The fixture is cleaned after failure. Preserve the package identity and
    // npm's final diagnostic before that cleanup, rather than only its argv.
    let diagnostic = '';
    const logs = path.join(cache, '_logs');
    if (fs.existsSync(logs)) {
      const files = fs.readdirSync(logs).filter(file => file.endsWith('-debug-0.log')).sort();
      if (files.length) diagnostic = fs.readFileSync(path.join(logs, files[files.length - 1]), 'utf8').split('\n').slice(-40).join('\n');
    }
    error.message = `npm ${args.join(' ')} failed in ${cwd} (${process.version})\n${error.message}\n${diagnostic}`;
    throw error;
  }
}

function compile(cwd, args, compiler = tsc, expected = 0) {
  const result = spawnSync(process.execPath, [compiler, ...args], {cwd, encoding: 'utf8'});
  assert.ifError(result.error);
  assert.equal(result.status, expected, result.stdout + result.stderr);
  return result.stdout + result.stderr;
}

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-meta-'));
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

function packDependency(source, tarballs, staging) {
  const manifest = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
  const bundled = manifest.bundleDependencies || manifest.bundledDependencies;
  assert.ok(!bundled || (Array.isArray(bundled) && bundled.length === 0),
    `The isolated dependency fixture must explicitly handle bundled dependencies in ${manifest.name}`);
  const copy = fs.mkdtempSync(path.join(staging, 'package-'));
  // pnpm may hardlink every package file to its content-addressed store. npm's
  // async node-tar packer can deadlock on that topology (node-tar#460). Copy
  // bytes to independent files, not links, without changing package manifests.
  // This graph has no bundles; installed node_modules is not package content.
  fs.cpSync(source, copy, {recursive: true, filter: file => path.basename(file) !== 'node_modules'});
  return {copy, packed: pack(copy, tarballs, true)};
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
  const factory = createRequire(path.join(source, 'package.json'))('./index.js');
  assert.equal(typeof factory, 'function');
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

// Each runtime gets its own clock and nextTick queue. Real helper semantics are
// shared; no process globals or timers are patched in the test runner.
function runtime(file) {
  let now = 100;
  const ticks = [];
  const module = {exports: {}};
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    module, exports: module.exports, require: createRequire(file),
    Date: {now: () => now}, process: {nextTick: fn => ticks.push(fn)}
  }, {filename: file});
  return {factory: module.exports, ticks, advance(ms) { now += ms; }};
}

function context() {
  const events = [];
  const timeouts = [];
  const ctx = {
    res: {
      headersSent: false,
      setHeader(name, value) { events.push(['header', name, value]); },
      setTimeout(ms, fn) { events.push(['timeout', ms]); timeouts.push(fn); }
    },
    method: 'GET', url: '/page', status: 200
  };
  const app = {think: {version: '4.0.0', logger: {info(message) { events.push(['log', message]); }}}};
  return {ctx, app, events, timeouts};
}

function differential(name, scenario) {
  test(`legacy differential: ${name}`, async () => {
    const legacy = runtime(path.join(__dirname, 'fixtures/legacy.cjs'));
    const current = runtime(path.join(packageRoot, 'lib/index.js'));
    assert.deepEqual(await scenario(current), await scenario(legacy));
  });
}

differential('anonymous arrow exports and middleware remain nonconstructible', ({factory}) => {
  const {app} = context();
  const fn = factory({}, app);
  for (const value of [factory, fn]) {
    assert.throws(() => new value(), TypeError);
    assert.equal(value.default, undefined);
    assert.equal(value.prototype, undefined);
  }
  return [factory.name, factory.length, fn.name, fn.length, Reflect.ownKeys(factory), Reflect.ownKeys(fn)];
});

differential('defaults, copied options, callback receiver and deferred logs', async runtime => {
  const {factory, ticks, advance} = runtime;
  const {ctx, app, events, timeouts} = context();
  const options = {requestTimeout: '2s', requestTimeoutCallback(request, resolved) {
    assert.equal(request, ctx);
    assert.equal(this, resolved);
    assert.notEqual(resolved, options);
    assert.equal(resolved.requestTimeout, 2000);
    events.push(['callback', resolved.sendResponseTime]);
  }};
  const fn = factory(options, app);
  options.sendPowerBy = false;
  assert.equal(await fn(ctx, async () => { advance(25); return 42; }), undefined);
  assert.equal(ticks.length, 1);
  timeouts[0]();
  ctx.method = 'POST'; ctx.url = '/after'; ctx.status = 201;
  ticks.shift()();
  assert.deepEqual(events, [
    ['timeout', 2000], ['header', 'X-Powered-By', 'thinkjs-4.0.0'],
    ['header', 'X-Response-Time', '25ms'], ['callback', true], ['log', 'POST /after 201 25ms']
  ]);
  return events;
});

differential('disabled timing returns the identical downstream promise and value', async ({factory}) => {
  const {ctx, app, events} = context();
  const fn = factory({sendResponseTime: false, logRequest: false, sendPowerBy: false, requestTimeoutCallback: null}, app);
  const promise = Promise.resolve({value: 42});
  assert.equal(fn(ctx, () => promise), promise);
  assert.deepEqual(await promise, {value: 42});
  // JavaScript callers historically also pass a synchronous next in this path.
  assert.equal(fn(ctx, () => 42), 42);
  const failure = new Error('sync');
  assert.throws(() => fn(ctx, () => { throw failure; }), error => error === failure);
  return events;
});

differential('truthy rejections propagate but falsy rejections are swallowed', async ({factory, ticks, advance}) => {
  const {ctx, app, events} = context();
  const fn = factory({requestTimeoutCallback: false}, app);
  for (const error of [new Error('failed'), 'failed', {}, 7, false, null, undefined, 0, '']) {
    const result = fn(ctx, () => { advance(3); return Promise.reject(error); });
    if (error) await assert.rejects(result, actual => actual === error);
    else assert.equal(await result, undefined);
    assert.equal(ticks.length, 1);
    ticks.shift()();
  }
  const failure = new Error('sync');
  assert.throws(() => fn(ctx, () => { throw failure; }), actual => actual === failure);
  for (const value of [undefined, null, 42, {}]) assert.throws(() => fn(ctx, () => value), error => error.name === 'TypeError');
  return events;
});

differential('header suppression, separate flags and exact URL ignores', async ({factory, ticks, advance}) => {
  const results = [];
  for (const sendResponseTime of [false, true]) for (const logRequest of [false, true]) {
    const {ctx, app, events} = context();
    ctx.res.headersSent = true;
    const ignoreUrl = ['/page'];
    const fn = factory({sendResponseTime, logRequest, ignoreUrl, requestTimeoutCallback: undefined}, app);
    const result = await fn(ctx, async () => { advance(5); return 42; });
    while (ticks.length) ticks.shift()();
    assert.deepEqual(events, []);
    assert.equal(result, !sendResponseTime && !logRequest ? 42 : undefined);
    ignoreUrl.length = 0;
    await fn(ctx, async () => { advance(5); });
    while (ticks.length) ticks.shift()();
    assert.deepEqual(events, logRequest ? [['log', 'GET /page 200 5ms']] : []);
    results.push(events);
  }
  return results;
});

differential('headersSent is checked again after downstream completion', async ({factory, ticks, advance}) => {
  const {ctx, app, events} = context();
  const fn = factory({requestTimeoutCallback: null, logRequest: false}, app);
  await fn(ctx, async () => { ctx.res.headersSent = true; advance(9); });
  assert.equal(ticks.length, 0);
  assert.deepEqual(events, [['header', 'X-Powered-By', 'thinkjs-4.0.0']]);
  return events;
});

differential('undefined overrides, option getters and invalid timeout failures', async ({factory, ticks}) => {
  const {ctx, app, events} = context();
  for (const options of [undefined, null, Object.freeze({})]) {
    await factory(options, app)(ctx, async () => {});
    while (ticks.length) ticks.shift()();
  }
  const reads = [];
  const input = Object.create({logRequest: false});
  Object.defineProperty(input, 'requestTimeout', {enumerable: true, get() { reads.push('timeout'); return '3s'; }});
  Object.defineProperty(input, 'sendPowerBy', {enumerable: true, get() { reads.push('header'); return undefined; }});
  await factory(input, app)(ctx, async () => {});
  while (ticks.length) ticks.shift()();
  assert.deepEqual(reads, ['timeout', 'header']);
  for (const requestTimeout of [undefined, null, '', 'not-a-duration', true, {}]) {
    assert.throws(() => factory({requestTimeout, requestTimeoutCallback: false}, app));
  }
  return [events, reads];
});

differential('shared normalized options and callback replacement stay observable', async ({factory, ticks}) => {
  const {ctx, app, events, timeouts} = context();
  let normalized;
  const fn = factory({requestTimeoutCallback(request, options) { normalized = options; }}, app);
  await fn(ctx, async () => {});
  timeouts[0]();
  normalized.requestTimeoutCallback = function(request, options) {
    assert.equal(this, normalized); assert.equal(options, normalized);
    events.push(['replacement', request.url]);
  };
  timeouts[0]();
  normalized.logRequest = false;
  normalized.sendPowerBy = false;
  normalized.sendResponseTime = false;
  // Already queued logging re-reads ignoreUrl, not the logRequest flag.
  normalized.ignoreUrl.push('/page');
  while (ticks.length) ticks.shift()();
  assert.equal(await fn(ctx, () => Promise.resolve(99)), 99);
  timeouts[1]();
  normalized.requestTimeoutCallback = null;
  assert.throws(() => timeouts[0](), error => error.name === 'TypeError');
  return events;
});

differential('concurrent requests keep separate timing and log order', async ({factory, ticks, advance}) => {
  const first = context(); const second = context(); second.ctx.url = '/second';
  const fn = factory({requestTimeoutCallback: null}, first.app);
  let finish;
  const waiting = new Promise(resolve => { finish = resolve; });
  const one = fn(first.ctx, () => waiting);
  advance(2);
  await fn(second.ctx, async () => { advance(3); });
  advance(7); finish(); await one;
  while (ticks.length) ticks.shift()();
  assert.deepEqual(first.events.slice(-2), [['log', 'GET /second 200 3ms'], ['log', 'GET /page 200 12ms']]);
  return [first.events, second.events];
});

test('cold prepack installs offline with CJS, deep entries, maps and TS 3.9/5.9 consumers', async t => {
  const {dir, source} = fixture(t);
  const tarballs = path.join(dir, 'tarballs');
  const staging = path.join(dir, 'staging');
  fs.mkdirSync(tarballs); fs.mkdirSync(staging);
  const packed = pack(source, tarballs);
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'index.d.ts', 'index.js', 'lib/index.d.ts', 'lib/index.d.ts.map',
    'lib/index.js', 'lib/index.js.map', 'package.json', 'src/index.ts'
  ]);
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
        assert.equal(packDependency(dependency, tarballs, staging).packed.archive, archive);
      }
    }
    return dependencies;
  }
  const overrides = {'think-meta': packDependencies(packageRoot)};
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const api = installedRequire('think-meta');
  assert.equal(typeof api, 'function');
  assert.equal(api.default, undefined);
  assert.equal(api, installedRequire('think-meta/index.js'));
  assert.equal(api, installedRequire('think-meta/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-meta')).href)).default, api);
  const {ctx, app, events} = context();
  assert.equal(await api({requestTimeoutCallback: null, logRequest: false}, app)(ctx, () => Promise.resolve(42)), undefined);
  assert.equal(events[0][1], 'X-Powered-By'); assert.equal(events[1][1], 'X-Response-Time');
  const installed = path.dirname(installedRequire.resolve('think-meta/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-meta/package.json');
  assert.equal(manifest.main, 'index.js'); assert.equal(manifest.types, 'index.d.ts'); assert.equal(manifest.exports, undefined);
  for (const name of ['typescript', '@types/node']) assert.equal(fs.existsSync(path.join(consumer, 'node_modules', name)), false);
  for (const extension of ['js', 'd.ts']) {
    const mapFile = path.join(installed, `lib/index.${extension}.map`);
    const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
    assert.equal(map.file, `index.${extension}`);
    assert.deepEqual(map.sources, ['../src/index.ts']);
    assert.ok(fs.existsSync(path.resolve(path.dirname(mapFile), map.sources[0])));
  }
  fs.copyFileSync(path.join(__dirname, 'fixtures/consumer.ts'), path.join(consumer, 'consumer.ts'));
  fs.writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {strict: true, noEmit: true, skipLibCheck: false, types: [], target: 'ES2018', module: 'CommonJS', esModuleInterop: true},
    files: ['consumer.ts']
  }));
  const oldCompiler = createRequire(path.join(root, 'packages/think-typescript/package.json'));
  assert.equal(oldCompiler('typescript').version, '3.9.10'); assert.equal(require('typescript').version, '5.9.3');
  const compilers = [oldCompiler.resolve('typescript/bin/tsc'), tsc];
  for (const compiler of compilers) compile(consumer, ['-p', 'tsconfig.json'], compiler);
  fs.writeFileSync(path.join(consumer, 'consumer.ts'),
    fs.readFileSync(path.join(consumer, 'consumer.ts'), 'utf8').replace(/\/\/ @ts-expect-error[^\n]*/g, ''));
  for (const compiler of compilers) {
    const errors = compile(consumer, ['-p', 'tsconfig.json'], compiler, compiler === tsc ? 2 : 1);
    for (const code of ['TS2322', 'TS2345', 'TS7009']) assert.match(errors, new RegExp(code));
  }
});

test('actual production execution maps to one TS LCOV record without generated duplicates', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-meta-lcov-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const driver = path.join(dir, 'run.cjs');
  fs.writeFileSync(driver, `
    const meta = require(${JSON.stringify(packageRoot)});
    const ctx = {res: {setHeader() {}, setTimeout(ms, callback) { callback(); }}, method: 'GET', url: '/', status: 200};
    const app = {think: {version: '4', logger: {info() {}}}};
    (async () => {
      await meta({}, app)(ctx, () => Promise.resolve());
      await meta({logRequest: false, sendResponseTime: false}, app)(ctx, () => Promise.resolve(42));
      await meta({ignoreUrl: ['/']}, app)(ctx, () => Promise.reject(new Error('expected'))).catch(() => {});
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `);
  const env = {...process.env}; delete env.NODE_V8_COVERAGE;
  const result = spawnSync(process.execPath, [require.resolve('c8/bin/c8.js'), '--config', path.join(root, '.c8rc.json'),
    '--all=false', '--reports-dir', path.join(dir, 'coverage'), '--temp-directory', path.join(dir, 'v8'),
    '--reporter=lcovonly', process.execPath, driver], {cwd: root, env, encoding: 'utf8'});
  assert.ifError(result.error); assert.equal(result.status, 0, result.stdout + result.stderr);
  const lcov = fs.readFileSync(path.join(dir, 'coverage/lcov.info'), 'utf8').replaceAll('\\', '/');
  const sections = lcov.split('end_of_record');
  const records = sections.filter(section => /^SF:packages\/think-meta\/src\/index.ts$/m.test(section));
  assert.equal(records.length, 1, lcov);
  for (const pattern of [/^DA:\d+,[1-9]\d*$/m, /^FNDA:[1-9]\d*,/m, /^BRDA:.*,.*,[1-9]\d*$/m]) assert.match(records[0], pattern);
  assert.doesNotMatch(lcov, /^SF:.*think-meta\/(?:lib\/|test\/|.*\.d\.ts)/m);
  assert.equal(middleware, require('../lib/index.js'));
});
