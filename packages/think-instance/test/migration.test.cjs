const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
const thinkInstance = require('..');

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-instance-'));
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
  fs.mkdirSync(path.join(source, 'node_modules/@types'), {recursive: true});
  const localRequire = createRequire(path.join(packageRoot, 'package.json'));
  for (const name of ['think-helper', '@types/node']) {
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

test('CommonJS entry identity, class identity, and existing static members are retained', () => {
  assert.equal(typeof thinkInstance, 'function');
  assert.equal(thinkInstance.default, undefined);
  assert.equal(thinkInstance, require('../index.js'));
  assert.equal(thinkInstance, require('../lib/index.js'));
  class Client { static label = 'client'; }
  assert.equal(thinkInstance(Client), Client);
  assert.equal(Client.label, 'client');
  const getInstance = Client.getInstance;
  assert.equal(thinkInstance(Client, 0), Client);
  assert.equal(Client.getInstance, getInstance);
  class Existing { static getInstance = 'already present'; }
  assert.equal(thinkInstance(Existing), Existing);
  assert.equal(Existing.getInstance, 'already present');
});

test('falsy existing members are replaced and failed assignments remain silent', () => {
  for (const value of [false, null, undefined, 0, 0n, '']) {
    class Client { static getInstance = value; constructor(id) { this.id = id; } }
    assert.equal(thinkInstance(Client), Client);
    assert.equal(typeof Client.getInstance, 'function');
    assert.equal(Client.getInstance(1).id, 1);
  }
  for (const protect of [Object.freeze, Object.preventExtensions]) {
    const Client = protect(class Client {});
    assert.equal(thinkInstance(Client), Client);
    assert.equal(Client.getInstance, undefined);
  }
  class ReadOnly {}
  Object.defineProperty(ReadOnly, 'getInstance', {value: null, writable: false});
  assert.equal(thinkInstance(ReadOnly), ReadOnly);
  assert.equal(ReadOnly.getInstance, null);
  const Rejected = new Proxy(class Client {}, {set() { return false; }});
  assert.equal(thinkInstance(Rejected), Rejected);
  assert.equal(Rejected.getInstance, undefined);
});

test('validation, classic constructors and JSON cache keys keep their behavior', () => {
  assert.throws(() => thinkInstance({}), {name: 'AssertionError', message: 'cls must be a function'});
  function Client(name) { this.name = name; }
  thinkInstance(Client);
  assert.equal(Client.getInstance('one').name, 'one');
  assert.equal(Client.getInstance(undefined), Client.getInstance(null));
  const cycle = {}; cycle.self = cycle;
  assert.throws(() => Client.getInstance(cycle), TypeError);
  const Arrow = thinkInstance(() => ({}));
  assert.throws(() => Arrow.getInstance(), TypeError);
});

test('FIFO eviction, cleanup receiver and re-creation preserve runtime semantics', () => {
  const closed = [];
  class Client {
    constructor(id) { this.id = id; }
    close() { closed.push(this.id); }
  }
  thinkInstance(Client, 2);
  const first = Client.getInstance(1);
  const second = Client.getInstance(2);
  assert.equal(Client.getInstance(1), first); // A hit does not change eviction order.
  Client.getInstance(3);
  assert.deepEqual(closed, [1]);
  assert.equal(Client.getInstance(2), second);
  assert.notEqual(Client.getInstance(1), first);
  assert.deepEqual(closed, [1, 2]);
});

test('non-positive limits and failing cleanup are not silently normalized', () => {
  for (const limit of [0, -1]) {
    let closed = 0;
    class Client { close() { closed++; } }
    thinkInstance(Client, limit);
    assert.equal(Client.getInstance(), undefined);
    assert.equal(closed, 1);
  }
  class InvalidClose { close = true; }
  thinkInstance(InvalidClose, 1);
  const first = InvalidClose.getInstance(1);
  assert.throws(() => InvalidClose.getInstance(2), TypeError);
  assert.equal(InvalidClose.getInstance(1), first);
  assert.ok(InvalidClose.getInstance(2) instanceof InvalidClose);
});

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
  const wrapped = createRequire(path.join(source, 'package.json'))('./index.js');
  class Client {}
  assert.ok(wrapped(Client).getInstance() instanceof Client);
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

test('cold prepack installs offline and preserves runtime, maps and TS 3.9/5.9 contracts', async t => {
  const {dir, source} = fixture(t);
  const tarballs = path.join(dir, 'tarballs');
  fs.mkdirSync(tarballs);
  const packed = pack(source, tarballs);
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'index.d.ts', 'index.js', 'lib/index.d.ts', 'lib/index.d.ts.map',
    'lib/index.js', 'lib/index.js.map', 'package.json', 'src/index.ts'
  ]);
  const archives = [packed.archive];
  // Pack the already installed runtime graph, never use workspace links or the
  // registry in the consumer. These dependency packs do not run their scripts.
  const seen = new Set();
  function packDependencies(folder) {
    const localRequire = createRequire(path.join(folder, 'package.json'));
    const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
    for (const name of Object.keys(manifest.dependencies || {})) {
      const dependency = path.dirname(localRequire.resolve(`${name}/package.json`));
      if (seen.has(dependency)) continue;
      seen.add(dependency);
      packDependencies(dependency);
      archives.push(pack(dependency, tarballs, true).archive);
    }
  }
  packDependencies(packageRoot);
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), '{"private":true}');
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', ...archives]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const wrapped = installedRequire('think-instance');
  assert.equal(wrapped.default, undefined);
  assert.equal(wrapped, installedRequire('think-instance/index.js'));
  assert.equal(wrapped, installedRequire('think-instance/lib/index.js'));
  const imported = await import(pathToFileURL(installedRequire.resolve('think-instance')).href);
  assert.equal(imported.default, wrapped);
  class Client { constructor(name) { this.name = name; } }
  assert.equal(wrapped(Client), Client);
  assert.equal(Client.getInstance('installed'), Client.getInstance('installed'));
  assert.equal(Client.getInstance('installed').name, 'installed');
  const installed = path.dirname(installedRequire.resolve('think-instance/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-instance/package.json');
  assert.equal(manifest.main, 'index.js');
  assert.equal(manifest.types, 'index.d.ts');
  assert.equal(manifest.exports, undefined);
  for (const extension of ['js', 'd.ts']) {
    const mapFile = path.join(installed, `lib/index.${extension}.map`);
    const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
    assert.ok(fs.existsSync(path.resolve(path.dirname(mapFile), map.sources[0])));
  }
  fs.writeFileSync(path.join(consumer, 'consumer.ts'), [
    "import thinkInstance = require('think-instance');",
    "import deep = require('think-instance/index.js');",
    "import compiled = require('think-instance/lib/index.js');",
    "import defaultImport from 'think-instance';",
    'class Client {',
    '  static label = "client";',
    '  constructor(public name: string, public count = 1) {}',
    '  close() {}',
    '}',
    'const Cached = thinkInstance(Client);',
    'const client: Client | undefined = Cached.getInstance("a", 2);',
    'const constructed: Client = new Cached("b");',
    'const label: string = Cached.label;',
    'deep(Client).getInstance("a"); compiled(Client).getInstance("a"); defaultImport(Client).getInstance("a");',
    'class Existing { static getInstance(id: number) { return {id}; } }',
    'const exact: number = thinkInstance(Existing).getInstance(1).id;',
    'class FalseMember { static getInstance = false; constructor(public id: number) {} }',
    'class NullMember { static getInstance: null = null; constructor(public id: number) {} }',
    'class UndefinedMember { static getInstance: undefined = undefined; constructor(public id: number) {} }',
    'class OptionalMember { static getInstance?: (id: number) => {id: number}; constructor(public id: number) {} }',
    'class NullableMethod { static getInstance: ((id: number) => {id: number}) | null = null; constructor(public id: number) {} }',
    'const falsy = thinkInstance(FalseMember);',
    'if (typeof falsy.getInstance === "function") { const value: FalseMember | undefined = falsy.getInstance(1); void value; }',
    'const nullValue: NullMember | undefined = thinkInstance(NullMember).getInstance(1);',
    'const undefinedValue: UndefinedMember | undefined = thinkInstance(UndefinedMember).getInstance(1);',
    'const optional: {id: number} | undefined = thinkInstance(OptionalMember).getInstance(1);',
    'const nullable: {id: number} | undefined = thinkInstance(NullableMethod).getInstance(1);',
    'const fromNew: NullMember = new (thinkInstance(NullMember))(1);',
    '// @ts-expect-error Falsy-member replacement keeps constructor arguments.',
    'thinkInstance(NullMember).getInstance("wrong");',
    '// @ts-expect-error Nullable members do not erase constructor argument types.',
    'thinkInstance(NullableMethod).getInstance("wrong");',
    'void nullValue; void undefinedValue; void optional; void nullable; void fromNew;',
    'class Box<T> { constructor(public value: T) {} }',
    'const generic = thinkInstance(Box).getInstance("a");',
    '// @ts-expect-error Unspecialized generic results are unknown, not any.',
    'const genericString: string = generic!.value;',
    'class StringBox extends Box<string> {}',
    'const specialized: string | undefined = thinkInstance(StringBox).getInstance("a")?.value;',
    '// @ts-expect-error A concrete subclass keeps its argument contract.',
    'thinkInstance(StringBox).getInstance(123);',
    'void genericString; void specialized;',
    '// @ts-expect-error Constructor arguments must not degrade to any.',
    'Cached.getInstance(123);',
    '// @ts-expect-error Required constructor arguments remain required.',
    'Cached.getInstance();',
    '// @ts-expect-error Existing static methods retain their own signatures.',
    'thinkInstance(Existing).getInstance("wrong");',
    '// @ts-expect-error A cached instance is not a number.',
    'const bad: number = Cached.getInstance("a");',
    '// @ts-expect-error Non-positive limits may immediately evict an instance.',
    'const absent: Client = thinkInstance(Client, 0).getInstance("a");',
    '// @ts-expect-error The argument must be constructible.',
    'thinkInstance(() => ({}));',
    'void client; void constructed; void label; void exact; void bad; void absent;'
  ].join('\n'));
  fs.writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {strict: true, noEmit: true, skipLibCheck: false, types: [], target: 'ES2018', module: 'CommonJS', esModuleInterop: true},
    files: ['consumer.ts']
  }));
  const legacy = createRequire(path.join(root, 'packages/think-typescript/package.json'));
  assert.equal(legacy('typescript').version, '3.9.10');
  assert.equal(require('typescript').version, '5.9.3');
  const compilers = [legacy.resolve('typescript/bin/tsc'), tsc];
  for (const compiler of compilers) compile(consumer, ['-p', 'tsconfig.json'], compiler);
  const positiveOnly = fs.readFileSync(path.join(consumer, 'consumer.ts'), 'utf8').replace(/\/\/ @ts-expect-error[^\n]*/g, '');
  fs.writeFileSync(path.join(consumer, 'consumer.ts'), positiveOnly);
  for (const compiler of compilers) {
    const errors = compile(consumer, ['-p', 'tsconfig.json'], compiler, compiler === tsc ? 2 : 1);
    assert.match(errors, /TS2345/);
    assert.match(errors, /TS2554/);
    assert.match(errors, /TS2322/);
  }
});
