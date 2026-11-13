const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
const mockHttp = require('..');
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-mock-http-'));
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

function runtime(file) {
  const exits = [];
  const module = {exports: {}};
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    module, exports: module.exports, require: createRequire(file),
    process: {exit: (...args) => exits.push(args)}
  }, {filename: file});
  return {factory: module.exports, exits};
}

function differential(name, scenario) {
  test(`legacy differential: ${name}`, async () => {
    const legacy = runtime(path.join(__dirname, 'fixtures/legacy.cjs'));
    const current = runtime(path.join(packageRoot, 'lib/index.js'));
    assert.deepEqual(await scenario(current), await scenario(legacy));
  });
}

const http = require('node:http');

differential('anonymous constructible CommonJS function retains arity and exports', ({factory}) => {
  const result = new factory('/constructed');
  assert.equal(result.req.url, '/constructed');
  assert.equal(result.req instanceof http.IncomingMessage, true);
  assert.equal(factory.default, undefined);
  return [factory.name, factory.length, typeof factory.prototype];
});

differential('URL, query, JSON, boxed strings and defaults', ({factory}) => {
  const cases = ['/path?value=1', '', 'url=/query&method=POST&value=1&value=2',
    '{"url":"/json","method":"PATCH","headers":{"x-test":"yes"}}',
    new String('/boxed'), new String('url=/boxed-query'), {},
    {url: '/object', method: undefined, httpVersion: undefined}];
  return cases.map(input => {
    const {req, res} = factory(input);
    assert.equal(req instanceof http.IncomingMessage, true);
    assert.equal(res instanceof http.ServerResponse, true);
    assert.equal(res.req, req);
    return [String(req.url), req.method, req.httpVersion, JSON.stringify(req.headers), req.value];
  });
});

differential('shallow request clone, response identity and input mutation', ({factory}) => {
  class Injected {
    constructor() { this.url = '/old'; this.headers = {'x-test': 'yes'}; }
    methodOnPrototype() {}
  }
  const original = new Injected();
  const response = {end() { return 42; }};
  const input = {req: original, res: response, method: 'POST', url: '/new'};
  const result = factory(input);
  assert.notEqual(result.req, original);
  assert.equal(result.req instanceof Injected, false);
  assert.equal(result.req.methodOnPrototype, undefined);
  assert.equal(result.req.headers, original.headers);
  assert.equal(result.res, response);
  assert.equal(result.req.url, '/new');
  assert.equal(original.url, '/old');
  assert.equal(Object.hasOwn(input, 'req'), false);
  assert.equal(Object.hasOwn(input, 'res'), false);
  return [Object.keys(input), Object.keys(result.req), result.req.method, result.req.httpVersion];
});

differential('injection selection uses truthiness and copies own enumerable keys', ({factory}) => {
  const results = [];
  for (const value of [undefined, null, false, 0, '']) {
    const input = {req: value, res: value};
    const {req, res} = factory(input);
    assert.equal(req instanceof http.IncomingMessage, true);
    assert.equal(res instanceof http.ServerResponse, true);
    assert.equal(req.req, value); assert.equal(req.res, value);
    results.push(Object.keys(input));
  }
  const symbol = Symbol('extra');
  const request = Object.create({inherited: true});
  request[symbol] = 42; request.own = true;
  Object.defineProperty(request, 'hidden', {value: 'no'});
  const {req, res} = factory({req: request, res: 'raw-response'});
  assert.equal(req[symbol], 42); assert.equal(req.inherited, undefined); assert.equal(req.hidden, undefined);
  assert.equal(res, 'raw-response');
  return results;
});

differential('argument getters, inherited values and symbol copy behavior', ({factory}) => {
  const reads = [];
  const req = {};
  const res = {};
  const input = Object.create({req, res, inherited: 42});
  Object.defineProperty(input, 'url', {enumerable: true, get() { reads.push('url'); return '/getter'; }});
  Object.defineProperty(input, 'method', {enumerable: true, get() { reads.push('method'); return 'PUT'; }});
  const symbol = Symbol('ignored'); input[symbol] = 'not copied by for-in';
  const result = factory(input);
  assert.equal(result.res, res); assert.equal(result.req.inherited, undefined);
  assert.equal(result.req[symbol], undefined);
  return [reads, Object.keys(result.req), result.req.url, result.req.method];
});

differential('callback receiver, exact result, thrown errors and falsy app', async ({factory}) => {
  for (const result of [undefined, null, false, 0, 42, {value: 42}, Promise.resolve(42)]) {
    const app = {callback() {
      assert.equal(this, app);
      return (req, res) => {
        assert.equal(req.url, '/app'); assert.equal(res.req, req); return result;
      };
    }};
    assert.equal(factory('/app', app), result);
  }
  const failure = new Error('callback failed');
  assert.throws(() => factory('/', {callback() { throw failure; }}), actual => actual === failure);
  assert.throws(() => factory('/', {callback: () => () => { throw failure; }}), actual => actual === failure);
  for (const app of [undefined, null, false, 0, '']) assert.equal(factory('/falsy', app).req.url, '/falsy');
  return true;
});

differential('exitOnEnd overwrites the original method and exits without forwarding', ({factory, exits}) => {
  let called = false;
  const response = {end() { called = true; }};
  const input = {res: response, exitOnEnd: 'yes'};
  const result = factory(input);
  assert.equal(Object.hasOwn(input, 'exitOnEnd'), false);
  assert.equal(result.res.end.length, 1);
  assert.equal(result.res.end('ignored'), undefined);
  assert.equal(called, false);
  assert.deepEqual(exits, [[]]);
  const normal = factory({exitOnEnd: false});
  assert.equal(normal.req.exitOnEnd, false);
  return [Object.keys(input), result.res.end.name, exits];
});

differential('frozen inputs and response methods keep legacy non-strict operations', ({factory, exits}) => {
  const req = {url: '/frozen'};
  const res = Object.freeze({end() { return 42; }});
  const input = Object.freeze({req, res, exitOnEnd: true, method: 'PATCH'});
  const result = factory(input);
  assert.equal(result.req.req, req); assert.equal(result.req.res, res);
  assert.equal(result.req.exitOnEnd, true); assert.equal(result.res.end(), 42);
  assert.equal(result.req.method, 'PATCH'); assert.equal(exits.length, 0);
  for (const raw of ['text', 1, true, Symbol('response')]) {
    assert.equal(factory({res: raw, exitOnEnd: true}).res, raw);
  }
  return Object.keys(input);
});

differential('nonwritable request fields and proxy delete traps remain observable', ({factory}) => {
  const proto = {}; Object.defineProperty(proto, 'locked', {value: 'old'});
  const request = {};
  Object.defineProperty(request, '__proto__', {enumerable: true, value: proto});
  const input = {req: request, locked: 'new'};
  const result = factory(input);
  assert.equal(result.req.locked, 'old');
  const operations = [];
  const proxied = new Proxy({req: {}, res: {}, exitOnEnd: true}, {
    deleteProperty(target, key) { operations.push(key); return false; }
  });
  factory(proxied);
  assert.deepEqual(operations, ['req', 'res', 'exitOnEnd']);
  return operations;
});

differential('malformed JSON, invalid callbacks and accessor exceptions', ({factory}) => {
  const failures = [];
  for (const args of [undefined, null, '{bad-json']) {
    try { factory(args); assert.fail('expected failure'); } catch (error) { failures.push(error.name); }
  }
  for (const app of [{}, {callback: () => null}, {callback: () => 42}]) {
    assert.throws(() => factory('/', app), error => error.name === 'TypeError');
  }
  const failure = new Error('getter');
  assert.throws(() => factory({get req() { throw failure; }}), actual => actual === failure);
  const response = {set end(value) { throw failure; }};
  assert.throws(() => factory({res: response, exitOnEnd: true}), actual => actual === failure);
  return failures;
});

test('exitOnEnd also exits a real child process on its first end call', () => {
  const result = spawnSync(process.execPath, ['-e', `
    const mockHttp = require(${JSON.stringify(packageRoot)});
    mockHttp({exitOnEnd: true}).res.end('ignored');
    process.exitCode = 9;
  `], {encoding: 'utf8'});
  assert.ifError(result.error); assert.equal(result.status, 0, result.stderr);
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
  const overrides = {'think-mock-http': packDependencies(packageRoot)};
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const api = installedRequire('think-mock-http');
  assert.equal(typeof api, 'function');
  assert.equal(api.default, undefined);
  assert.equal(api, installedRequire('think-mock-http/index.js'));
  assert.equal(api, installedRequire('think-mock-http/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-mock-http')).href)).default, api);
  const exchange = api('/packed');
  assert.equal(exchange.req.url, '/packed');
  assert.equal(exchange.req instanceof require('node:http').IncomingMessage, true);
  assert.equal(exchange.res instanceof require('node:http').ServerResponse, true);
  const token = {};
  assert.equal(api('/callback', {callback: () => () => token}), token);
  const installed = path.dirname(installedRequire.resolve('think-mock-http/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-mock-http/package.json');
  assert.equal(manifest.main, 'index.js'); assert.equal(manifest.types, 'index.d.ts'); assert.equal(manifest.exports, undefined);
  for (const name of ['typescript', '@types/node']) assert.equal(fs.existsSync(path.join(consumer, 'node_modules', name)), false);
  for (const extension of ['js', 'd.ts']) {
    const mapFile = path.join(installed, `lib/index.${extension}.map`);
    const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
    assert.equal(map.file, `index.${extension}`);
    assert.deepEqual(map.sources, ['../src/index.ts']);
    assert.ok(fs.existsSync(path.resolve(path.dirname(mapFile), map.sources[0])));
  }
  // Consumers supply Node declarations. Pack the real TS-3.9-compatible
  // DefinitelyTyped package rather than a hand-written Node test stub.
  const localRequire = createRequire(path.join(packageRoot, 'package.json'));
  const nodeTypes = path.dirname(localRequire.resolve('@types/node-legacy/package.json'));
  const nodeArchive = packDependency(nodeTypes, tarballs, staging).packed.archive;
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', nodeArchive]);
  fs.copyFileSync(path.join(__dirname, 'fixtures/consumer.ts'), path.join(consumer, 'consumer.ts'));
  fs.writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {strict: true, noEmit: true, skipLibCheck: false, types: ['node'], target: 'ES2018', module: 'CommonJS', esModuleInterop: true},
    files: ['consumer.ts']
  }));
  const oldCompiler = createRequire(path.join(root, 'packages/think-typescript/package.json'));
  assert.equal(oldCompiler('typescript').version, '3.9.10'); assert.equal(require('typescript').version, '5.9.3');
  const positive = fs.readFileSync(path.join(consumer, 'consumer.ts'), 'utf8');
  const modernTypes = path.dirname(localRequire.resolve('@types/node/package.json'));
  const modernArchive = packDependency(modernTypes, tarballs, staging).packed.archive;
  const modernDependencies = packDependencies(modernTypes);
  for (const compiler of [oldCompiler.resolve('typescript/bin/tsc'), tsc]) {
    if (compiler === tsc) {
      const manifestFile = path.join(consumer, 'package.json');
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      manifest.overrides['@types/node'] = modernDependencies;
      fs.writeFileSync(manifestFile, JSON.stringify(manifest));
      npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', modernArchive]);
      assert.equal(installedRequire('@types/node/package.json').version, '25.8.0');
    }
    fs.writeFileSync(path.join(consumer, 'consumer.ts'), positive);
    compile(consumer, ['-p', 'tsconfig.json'], compiler);
    fs.writeFileSync(path.join(consumer, 'consumer.ts'), positive.replace(/\/\/ @ts-expect-error[^\n]*/g, ''));
    const errors = compile(consumer, ['-p', 'tsconfig.json'], compiler, compiler === tsc ? 2 : 1);
    for (const code of ['TS2322', 'TS2769', 'TS7009']) assert.match(errors, new RegExp(code));
  }

});

test('actual production execution maps to one TS LCOV record without generated duplicates', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-mock-http-lcov-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const driver = path.join(dir, 'run.cjs');
  fs.writeFileSync(driver, `
    const mockHttp = require(${JSON.stringify(packageRoot)});
    mockHttp('/mapped');
    mockHttp('url=/query');
    mockHttp('{"url":"/json"}');
    mockHttp({req: {method: 'POST'}, res: {end() {}}, url: '/injected'});
    mockHttp('/callback', {callback() { return () => 42; }});
  `);
  const env = {...process.env}; delete env.NODE_V8_COVERAGE;
  const result = spawnSync(process.execPath, [require.resolve('c8/bin/c8.js'), '--config', path.join(root, '.c8rc.json'),
    '--all=false', '--reports-dir', path.join(dir, 'coverage'), '--temp-directory', path.join(dir, 'v8'),
    '--reporter=lcovonly', process.execPath, driver], {cwd: root, env, encoding: 'utf8'});
  assert.ifError(result.error); assert.equal(result.status, 0, result.stdout + result.stderr);
  const lcov = fs.readFileSync(path.join(dir, 'coverage/lcov.info'), 'utf8').replaceAll('\\', '/');
  const sections = lcov.split('end_of_record');
  const records = sections.filter(section => /^SF:packages\/think-mock-http\/src\/index.ts$/m.test(section));
  assert.equal(records.length, 1, lcov);
  for (const pattern of [/^DA:\d+,[1-9]\d*$/m, /^FNDA:[1-9]\d*,/m, /^BRDA:.*,.*,[1-9]\d*$/m]) assert.match(records[0], pattern);
  assert.doesNotMatch(lcov, /^SF:.*think-mock-http\/(?:lib\/|test\/|.*\.d\.ts)/m);
  assert.equal(mockHttp, require('../lib/index.js'));
});
