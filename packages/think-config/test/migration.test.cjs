const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
const configModule = require('..');
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-config-'));
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
  for (const name of ['think-helper']) {
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
  const {Config} = createRequire(path.join(source, 'package.json'))('./index.js');
  assert.equal(new Config({value: 42}).get('value'), 42);
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

function differential(name, scenario) {
  test(`legacy differential: ${name}`, () => {
    assert.deepEqual(scenario(configModule), scenario(legacy));
  });
}

differential('CommonJS descriptors, constructor and function shape', api => {
  assert.deepEqual(Reflect.ownKeys(api), ['Config', 'getConfigFn']);
  for (const key of Object.keys(api)) {
    const descriptor = Object.getOwnPropertyDescriptor(api, key);
    assert.deepEqual([descriptor.writable, descriptor.enumerable, descriptor.configurable], [true, true, true]);
  }
  const {Config, getConfigFn} = api;
  assert.throws(() => Config(), TypeError);
  const fn = getConfigFn({});
  assert.throws(() => new fn(), TypeError);
  return [Config.name, Config.length, getConfigFn.name, getConfigFn.length,
    fn.name, fn.length, Reflect.ownKeys(Config.prototype), Reflect.ownKeys(new Config())];
});

differential('config identity, falsy names and explicit read sources', ({Config}) => {
  const data = {value: {nested: 42}}; const other = {value: {nested: 7}};
  const instance = new Config(data);
  assert.equal(instance.config, data);
  for (const name of [undefined, null, '', false, 0, NaN]) {
    assert.equal(instance.get(name, other), data);
  }
  for (const source of [undefined, null, false, 0, '']) {
    assert.equal(instance.get('value.nested', source), 42);
  }
  assert.equal(instance.get('value.nested', other), 7);
  assert.equal(instance.get('value', other), other.value);
  assert.equal(instance.get('value.nested', {}), undefined);
  assert.equal(new Config().get('missing'), undefined);
  for (const name of [1, true, Symbol('key'), {}, ['.']]) assert.throws(() => instance.get(name), TypeError);
  assert.equal(instance.get(['value']), data.value);
  assert.equal(instance.get([]), undefined);
  return instance.get();
});

differential('dotted paths retain inherited lookups and plain-object boundaries', ({Config}) => {
  const leaf = Object.create({inherited: 42}); leaf[''] = {'': 9};
  const data = {leaf, array: [{value: 1}], date: new Date(0), fn: Object.assign(() => {}, {value: 1}), null: null, number: 1};
  const instance = new Config(data);
  const paths = ['leaf', 'leaf.inherited', 'leaf..', 'missing.x', 'leaf.missing.x', 'array.0.value', 'date.getTime', 'fn.value', 'null.x', 'number.x'];
  const values = paths.map(name => instance.get(name));
  assert.equal(values[1], 42); assert.equal(values[2], 9);
  assert.deepEqual(values.slice(3), [undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
  assert.equal(instance.get('toString'), Object.prototype.toString);
  return values.slice(1);
});

differential('setters preserve mutation, chaining, undefined and replacement rules', ({Config}) => {
  class Child extends Config {}
  const data = {keep: true}; const instance = new Child(data);
  for (const value of [null, false, 0, '', [], new Date(0), () => {}, undefined]) {
    instance.set('branch', value);
    assert.equal(instance.set('branch.leaf', value), instance);
    assert.equal(instance.get('branch.leaf'), value);
    assert.equal(instance.get(), data);
  }
  assert.equal(instance.set('name', undefined), instance);
  assert.ok(Object.hasOwn(data, 'name'));
  const object = {nested: {kept: true}};
  instance.set('object', object).set('object.nested.added', 42);
  assert.equal(object.nested.added, 42);
  instance.set('.empty.', 3); assert.equal(instance.get('.empty.'), 3);
  instance.set('literal.with.dot', 4); assert.equal(data.literal.with.dot, 4);
  return {keys: Object.keys(data), object, empty: instance.get('.empty.')};
});

differential('the existing special-key filter remains unchanged', ({Config}) => {
  const instance = new Config();
  for (const name of ['a.__proto__', '__proto__x.a', 'a.prototype', 'a.xprototypey', 'a.construcotr']) {
    assert.equal(instance.set(name, 42), instance);
    assert.deepEqual(instance.get(), {});
  }
  // Direct (non-dotted) keys are not subject to the dotted-path filter.
  instance.set('prototype', 1).set('construcotr', 2);
  instance.set('constructor', {}).set('constructor.own', 3);
  instance.set('__proto__', {localOnly: true});
  assert.equal(instance.get('localOnly'), true);
  assert.equal(Object.prototype.localOnly, undefined);
  return [Object.keys(instance.get()), instance.get('constructor.own')];
});

differential('class setters keep strict failures on read-only data', ({Config}) => {
  const failure = new Error('write failed');
  const values = [Object.freeze({value: 1}), Object.preventExtensions({}),
    Object.defineProperty({}, 'value', {get() { return 1; }}),
    new Proxy({}, {set() { return false; }})];
  for (const data of values) assert.throws(() => new Config(data).set('value', 2), TypeError);
  assert.throws(() => new Config({branch: Object.freeze({value: 1})}).set('branch.value', 2), TypeError);
  assert.throws(() => new Config(new Proxy({}, {set() { throw failure; }})).set('value', 2), error => error === failure);
  for (const data of [null, undefined, false, 0, '']) {
    const instance = new Config(data);
    if (data !== undefined) assert.equal(instance.get(), data);
  }
  return values.length;
});

differential('proxy reads, helper checks and setter observation order', ({Config}) => {
  const trace = [];
  const track = (data, label) => new Proxy(data, {
    get(target, key, receiver) { trace.push(`${label}.get:${String(key)}`); return Reflect.get(target, key, receiver); },
    set(target, key, value, receiver) { trace.push(`${label}.set:${String(key)}`); return Reflect.set(target, key, value, receiver); }
  });
  const nested = track({value: 1}, 'nested'); const data = track({nested}, 'root');
  const instance = new Config(data);
  assert.equal(instance.get('nested.value'), 1);
  instance.set('nested.value', 42); assert.equal(instance.get('nested.value'), 42);
  let count = 0;
  const changing = new Config({get branch() { count++; return count === 1 ? {} : {value: 9}; }});
  changing.set('branch.value', 8); assert.equal(count, 2);
  return trace;
});

differential('single-module reads, writes and ignored module arguments', ({Config, getConfigFn}) => {
  const data = {value: 1}; const fn = getConfigFn(data);
  assert.equal(fn(), data); assert.equal(fn(null), data); assert.equal(fn('', undefined, 'ignored'), data);
  for (const module of [undefined, 'home', 'home,admin', true, false, null, {}, 42]) {
    const result = fn('nested.value', module, module);
    if (module === undefined) assert.equal(result, undefined);
    else { assert.ok(result instanceof Config); assert.equal(result.get(), data); assert.equal(fn('nested.value'), module); }
  }
  assert.equal(fn('value', undefined), 1);
  const detached = {fn}; assert.equal(detached.fn('value'), 1);
  return [Object.keys(data), fn('nested.value')];
});

differential('multi-module defaults, fallback, comma selectors and all-module writes', ({getConfigFn}) => {
  const data = {common: {value: 1}, home: {value: 2}, admin: {value: 3}, '': {value: 4}, true: {value: 5}};
  const fn = getConfigFn(data, true);
  for (const selector of [undefined, 'missing', '', false, null]) assert.equal(fn('value', undefined, selector), 1);
  assert.equal(fn('value', undefined, true), 5);
  assert.equal(fn(undefined, undefined, 'home'), data.home);
  assert.equal(fn('value', 10, 'home,admin,missing'), undefined);
  assert.deepEqual([data.common.value, data.home.value, data.admin.value], [1, 10, 10]);
  assert.equal(fn('value', 11, ' home'), undefined); assert.equal(data.home.value, 10);
  assert.equal(fn('value', 12, ''), undefined); assert.equal(data[''].value, 12);
  assert.equal(fn('nested.value', null, true), undefined);
  for (const value of Object.values(data)) assert.equal(value.nested.value, null);
  for (const selector of [false, null, 1, {}]) assert.throws(() => fn('value', 99, selector), TypeError);
  return data;
});

differential('module construction keeps inherited enumeration and shared data', ({getConfigFn}) => {
  const inherited = {value: 2}; const data = Object.create({home: inherited}); data.common = {value: 1};
  Object.defineProperty(data, 'hidden', {value: {value: 9}});
  const symbol = Symbol('module'); data[symbol] = {value: 8};
  const fn = getConfigFn(data, true);
  assert.equal(fn('value', undefined, 'home'), 2);
  assert.equal(fn('value', undefined, 'hidden'), 1);
  assert.equal(fn('value', undefined, symbol), 1);
  fn('value', 4, true); assert.equal(inherited.value, 4); assert.equal(data.common.value, 4);
  data.home = {value: 99}; assert.equal(fn('value', undefined, 'home'), 4);
  inherited.value = 5; assert.equal(fn('value', undefined, 'home'), 5);
  const empty = getConfigFn({}, true);
  assert.throws(() => empty('missing'), TypeError);
  assert.equal(empty('value', 1, 'missing'), undefined);
  for (const name of ['constructor', 'toString', '__proto__']) {
    assert.throws(() => fn('value', undefined, name), TypeError);
    assert.throws(() => fn('value', 7, name), TypeError);
  }
  return [data.common, inherited];
});

differential('factory property getters, duplicate writes and errors stay observable', ({getConfigFn}) => {
  const trace = []; let value = 0;
  const common = {get value() { trace.push('get'); return value; }, set value(next) { trace.push(`set:${next}`); value = next; }};
  const data = {get common() { trace.push('common'); return common; }, get home() { trace.push('home'); return common; }};
  const fn = getConfigFn(data, true);
  fn('value', 7, 'common,home,common'); assert.equal(fn('value'), 7);
  const error = new Error('read failed');
  const broken = new Proxy({}, {ownKeys() { throw error; }});
  assert.throws(() => getConfigFn(broken, true), actual => actual === error);
  assert.deepEqual(trace, ['common', 'home', 'set:7', 'set:7', 'set:7', 'get']);
  return trace;
});

test('cold prepack installs offline with CommonJS, maps and TS 3.9/5.9 consumers', async t => {
  const {dir, source} = fixture(t);
  const tarballs = path.join(dir, 'tarballs');
  fs.mkdirSync(tarballs);
  const packed = pack(source, tarballs);
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'index.d.ts', 'index.js', 'lib/index.d.ts', 'lib/index.d.ts.map',
    'lib/index.js', 'lib/index.js.map', 'package.json', 'src/index.ts'
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
  const overrides = {'think-config': packDependencies(packageRoot)};
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  // Resolve the exact dependency graph from local tarballs without modifying
  // published manifests or relying on workspace links or a registry.
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const api = installedRequire('think-config');
  assert.deepEqual(Object.keys(api), ['Config', 'getConfigFn']);
  assert.equal(api.default, undefined);
  assert.equal(api, installedRequire('think-config/index.js'));
  assert.equal(api, installedRequire('think-config/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-config')).href)).default, api);
  assert.equal(new api.Config({value: 42}).get('value'), 42);
  const fn = api.getConfigFn({common: {value: 1}, home: {value: 2}}, true);
  fn('value', 3, 'home'); assert.equal(fn('value', undefined, 'home'), 3);
  const installed = path.dirname(installedRequire.resolve('think-config/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-config/package.json');
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
    "import config = require('think-config');",
    "import {Config, getConfigFn, ConfigValues, ConfigFn} from 'think-config';",
    "import deep = require('think-config/index.js');",
    "import compiled = require('think-config/lib/index.js');",
    "import defaultImport from 'think-config';",
    'interface Settings {port: number; nested: {name: string};}',
    'const settings: Settings = {port: 3000, nested: {name: "test"}};',
    'const instance: Config = new Config(settings);',
    'const values: ConfigValues = instance.get();',
    'const configProperty: ConfigValues = instance.config;',
    'const all: ConfigValues = instance.get(null, {});',
    'const value: unknown = instance.get("nested.name");',
    'const external: unknown = instance.get("port", settings);',
    'instance.set("port", undefined).set("nested.name", 42);',
    'class Extended extends Config { own() { return true; } }',
    'new Extended().set("value", 42).own();',
    'const single = getConfigFn(settings);',
    'const whole: ConfigValues = single();',
    'const empty: ConfigValues = single("", undefined, {});',
    'const returned: Config = single("port", 7, {});',
    'const nullWrite: Config = single("port", null);',
    'const falseWrite: Config = single("port", false);',
    'const objectWrite: Config = single("port", {});',
    'const read: unknown = single("port", undefined);',
    'const maybeValue: number | undefined = Math.random() ? 7 : undefined;',
    'const maybeResult: unknown = single("port", maybeValue);',
    'const multi = getConfigFn({common: settings, home: settings}, true);',
    'const multiAll: ConfigValues = multi();',
    'const homeAll: ConfigValues = multi(undefined, undefined, "home");',
    'const noResult: void = multi("port", 8, "home,common");',
    'const fanout: void = multi("port", false, true);',
    'multi("port", undefined, false); multi("port", undefined, null);',
    'const mode: boolean | undefined = Math.random() ? true : undefined;',
    'const dynamic: ConfigFn = getConfigFn(settings, mode);',
    'const dynamicSet: Config | void = dynamic("port", 1, true);',
    'const dynamicRead: unknown = dynamic("port", undefined, false);',
    'new deep.Config(); new compiled.Config(); new defaultImport.Config(); new config.Config();',
    '// @ts-expect-error Config is a constructor, not a callable factory.',
    'Config({});',
    '// @ts-expect-error Constructor requires object data.',
    'new Config(null);',
    '// @ts-expect-error Paths must be strings.',
    'instance.get(1);',
    '// @ts-expect-error Missing values are not a direct Config.set signature.',
    'instance.set("port");',
    '// @ts-expect-error Dynamic reads require narrowing.',
    'const unsafeRead: number = instance.get("port");',
    '// @ts-expect-error Undefined is read, not a chaining write.',
    'const unsafeWrite: Config = single("port", undefined);',
    '// @ts-expect-error Possibly undefined values may read.',
    'const unsafeMaybe: Config = single("port", maybeValue);',
    '// @ts-expect-error Multi-module writes return void.',
    'const unsafeMulti: Config = multi("port", 1);',
    '// @ts-expect-error False is not a write module selector.',
    'multi("port", 1, false);',
    '// @ts-expect-error Null is not a write module selector.',
    'multi("port", 1, null);',
    '// @ts-expect-error Writes require a string name.',
    'multi(null, 1);',
    '// @ts-expect-error Dynamic mode writes require a string name.',
    'dynamic(undefined, 1);',
    '// @ts-expect-error Dynamic mode cannot write to a false module selector.',
    'dynamic("port", 1, false);',
    '// @ts-expect-error Mode must be boolean.',
    'getConfigFn({}, "multi");',
    '// @ts-expect-error Namespace exports do not make the module a constructor.',
    'new config();',
    'void values; void configProperty; void all; void value; void external; void whole; void empty;',
    'void returned; void nullWrite; void falseWrite; void objectWrite; void read; void maybeResult;',
    'void multiAll; void homeAll; void noResult; void fanout; void dynamicSet; void dynamicRead;'
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
    assert.match(errors, /TS2345|TS2769/);
    assert.match(errors, /TS2322/);
    assert.match(errors, /TS2351/);
  }
});

test('package whitelist retains opt-in root declaration subpaths when stacks are combined', t => {
  const {dir, source} = fixture(t);
  // The independent application-types stack adds this root declaration. Keep
  // it publishable without coupling this migration to the unmerged contract.
  fs.writeFileSync(path.join(source, 'config-types.d.ts'), 'export interface ConfigModules {}\n');
  const packed = pack(source, dir);
  assert.ok(packed.files.some(file => file.path === 'config-types.d.ts'));
  fs.writeFileSync(path.join(source, 'consumer.ts'), "import {ConfigModules} from './config-types'; const modules: ConfigModules = {}; void modules;\n");
  compile(source, ['--strict', '--noEmit', '--skipLibCheck', 'false', 'consumer.ts']);
});
