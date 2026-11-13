const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
const vm = require('node:vm');
const gc = require('..');

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-gc-'));
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
  for (const name of ['think-helper', 'debug', '@types/node']) {
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
  const collect = createRequire(path.join(source, 'package.json'))('./index.js');
  assert.equal(collect({gcType: 'cold', gc() {}}), undefined);
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


// Byte-for-byte legacy implementation from foundation #1811 / master aa9cdde.
// Only the scheduler and debug sink are replaced; validation and duration parsing
// use the installed runtime dependencies. Every case gets a fresh module state.
function scheduler(file, timerMode = 'unref', setup = '') {
  const localRequire = createRequire(file);
  const trace = [];
  let tick;
  const timer = {unref() { trace.push(['unref', this === timer]); }};
  const context = {
    module: {exports: {}},
    require(name) {
      if (name === 'debug') return namespace => message => trace.push(['debug', namespace, message]);
      return localRequire(name);
    },
    setInterval(callback, delay) {
      trace.push(['timer', delay]);
      tick = callback;
      if (timerMode === 'number') return 42;
      if (timerMode === 'missing') return {};
      return timer;
    }
  };
  vm.createContext(context);
  if (setup) vm.runInContext(setup, context);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename: file});
  return {gc: context.module.exports, trace, tick() { assert.ok(tick, 'a timer must be registered'); tick(); }};
}

function capture(fn) {
  try { return ['return', fn()]; } catch (error) { return ['throw', error.name, error.message]; }
}

const scenarios = {
  'one unreferenced timer, default interval, duplicate registrations and receivers'(s) {
    const first = {gcType: 'first', gc() { s.trace.push(['first', this === first]); }};
    s.trace.push(capture(() => s.gc(first)));
    s.gc({gcType: 'first', gc() { s.trace.push(['duplicate']); }}, () => true, 1);
    const second = {gcType: 'second', gc() { s.trace.push(['second', this === second]); }};
    s.gc(second, '2h');
    s.tick(); s.tick();
    assert.equal(s.trace.filter(row => row[0] === 'timer').length, 1);
    assert.deepEqual(s.trace[0], ['timer', 3600000]);
    assert.equal(s.trace.filter(row => row[0] === 'first').length, 2);
    assert.equal(s.trace.filter(row => row[0] === 'second').length, 1);
    assert.equal(s.trace.some(row => row[0] === 'duplicate'), false);
  },
  'numeric and string durations retain floor, zero, negative and nonfinite behavior'(s) {
    for (const [name, interval] of Object.entries({hour: '1h', fraction: 2500, short: 500, zero: 0, negative: -2000, nan: NaN, infinite: Infinity, invalid: 'not-time'})) {
      s.gc({gcType: name, gc() { s.trace.push(['gc', name]); }}, interval, 1000);
    }
    for (let i = 0; i < 4; i++) s.trace.push(capture(() => s.tick()));
    assert.equal(s.trace.filter(row => row[0] === 'throw' && row[2] === "think-ms('not-time') result is undefined").length, 4);
    assert.equal(s.trace.filter(row => row[0] === 'gc' && row[1] === 'fraction').length, 2);
    assert.equal(s.trace.filter(row => row[0] === 'gc' && row[1] === 'negative').length, 2);
    assert.equal(s.trace.filter(row => row[0] === 'gc' && row[1] === 'short').length, 0);
  },
  'predicate truthiness and promises remain synchronous and are never awaited'(s) {
    for (const [name, result] of [['false', false], ['zero', 0], ['empty', ''], ['null', null], ['undefined', undefined], ['true', true], ['object', {}], ['promise', Promise.resolve(false)]]) {
      s.gc({gcType: name, gc() { s.trace.push(['gc', name]); }}, () => {
        s.trace.push(['predicate', name]); return result;
      }, 10);
    }
    s.tick();
    assert.deepEqual(s.trace.filter(row => row[0] === 'gc').map(row => row[1]), ['true', 'object', 'promise']);
  },
  'validation errors, order and no accidental timer for invalid input'(s) {
    for (const value of [undefined, null, false, {}, {gc: 1, gcType: 1}, {gc() {}}, {gc() {}, gcType: 1}]) {
      s.trace.push(capture(() => s.gc(value)));
    }
    assert.ok(s.trace.every(row => row[0] === 'throw' && row[1] === 'AssertionError'));
    s.gc({gcType: '', gc() { s.trace.push(['empty-name']); }}, () => true);
    s.tick();
    assert.ok(s.trace.some(row => row[0] === 'empty-name'));
  },
  'plain-object registry retains inherited name suppression and validation'(s) {
    for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
      s.trace.push(capture(() => s.gc({gcType: name, gc() { throw Error('must not register'); }})));
    }
    assert.deepEqual(s.trace, Array(4).fill(['return', undefined]));
    s.trace.push(capture(() => s.gc({gcType: 'constructor', gc: false})));
  },
  'predicate errors abort the current tick and later ticks retain the counter'(s) {
    let count = 0;
    s.gc({gcType: 'throws', gc() { s.trace.push(['gc']); }}, () => {
      if (++count === 1) throw Error('predicate failure');
      return true;
    }, 100);
    s.gc({gcType: 'later', gc() { s.trace.push(['later']); }}, 200, 100);
    s.trace.push(capture(() => s.tick()));
    s.trace.push(capture(() => s.tick()));
    assert.ok(s.trace.some(row => row[0] === 'throw' && row[2] === 'predicate failure'));
    assert.ok(s.trace.some(row => row[0] === 'later'));
  },
  'collection errors are propagated and do not invoke subsequent collectors'(s) {
    s.gc({gcType: 'throws', gc() { throw Error('collection failure'); }}, () => true);
    s.gc({gcType: 'later', gc() { s.trace.push(['later']); }}, () => true);
    s.trace.push(capture(() => s.tick()));
    assert.equal(s.trace.some(row => row[0] === 'later'), false);
    assert.ok(s.trace.some(row => row[0] === 'throw' && row[2] === 'collection failure'));
  },
  'registered instance properties remain live, including getters'(s) {
    let name = 'original';
    const target = {get gcType() { s.trace.push(['name', name]); return name; }, gc() { s.trace.push(['original']); }};
    s.gc(target, () => true, 5);
    name = 'changed';
    target.gc = function() { s.trace.push(['changed', this === target]); };
    s.tick();
    assert.ok(s.trace.some(row => row[0] === 'changed' && row[1] === true));
    target.gc = null;
    const result = capture(() => s.tick());
    // Engines may include the source spelling in a TypeError; its class is the contract.
    s.trace.push(result.slice(0, 2));
    assert.deepEqual(result.slice(0, 2), ['throw', 'TypeError']);
  },
  'each collector retains its own divisor while the first registration owns the timer'(s) {
    s.gc({gcType: 'first', gc() { s.trace.push(['first']); }}, 200, 100);
    s.gc({gcType: 'second', gc() { s.trace.push(['second']); }}, 200, 200);
    s.tick(); s.tick();
    assert.equal(s.trace.filter(row => row[0] === 'first').length, 1);
    assert.equal(s.trace.filter(row => row[0] === 'second').length, 2);
    assert.deepEqual(s.trace[0], ['timer', 100]);
  }
};

for (const [name, scenario] of Object.entries(scenarios)) {
  test(`legacy differential: ${name}`, () => {
    const traces = ['test/fixtures/legacy.cjs', 'lib/index.js'].map(file => {
      const s = scheduler(path.join(packageRoot, file));
      scenario(s);
      return s.trace;
    });
    assert.deepEqual(traces[1], traces[0]);
  });
}

for (const mode of ['unref', 'missing', 'number']) {
  test(`legacy differential: timer handle ${mode}`, () => {
    const traces = ['test/fixtures/legacy.cjs', 'lib/index.js'].map(file => {
      const s = scheduler(path.join(packageRoot, file), mode);
      s.gc({gcType: 'timer', gc() { s.trace.push(['gc']); }}, () => true);
      s.tick();
      assert.equal(s.trace.filter(row => row[0] === 'unref').length, mode === 'unref' ? 1 : 0);
      return s.trace;
    });
    assert.deepEqual(traces[1], traces[0]);
  });
}

test('legacy differential: failed inherited read-only registry assignments remain silent', () => {
  const traces = ['test/fixtures/legacy.cjs', 'lib/index.js'].map(file => {
    const s = scheduler(path.join(packageRoot, file), 'unref',
      "Object.defineProperty(Object.prototype, 'blocked', {value: 0, writable: false});");
    s.trace.push(capture(() => s.gc({gcType: 'blocked', gc() { s.trace.push(['gc']); }}, () => true)));
    s.tick();
    assert.deepEqual(s.trace, [['timer', 3600000], ['unref', true], ['return', undefined]]);
    return s.trace;
  });
  assert.deepEqual(traces[1], traces[0]);
});

test('CommonJS entry identity is unchanged and real timers do not keep the process alive', () => {
  assert.equal(typeof gc, 'function');
  assert.equal(gc.name, 'gc');
  assert.equal(gc.length, 1);
  assert.equal(gc.default, undefined);
  assert.equal(gc, require('../index.js'));
  assert.equal(gc, require('../lib/index.js'));
  const result = spawnSync(process.execPath, ['-e', "require('./')({gcType: 'exit', gc() { throw Error('too early'); }});"], {
    cwd: packageRoot, encoding: 'utf8', timeout: 5000
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
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
  const overrides = {'think-gc': packDependencies(packageRoot)};
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  // Three different ms versions are required by debug/helper/think-ms. Scope
  // local tarball resolution by parent without modifying published manifests.
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const collect = installedRequire('think-gc');
  assert.equal(typeof collect, 'function');
  assert.equal(collect.default, undefined);
  assert.equal(collect, installedRequire('think-gc/index.js'));
  assert.equal(collect, installedRequire('think-gc/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-gc')).href)).default, collect);
  assert.equal(collect({gcType: 'installed', gc() {}}), undefined);
  const installed = path.dirname(installedRequire.resolve('think-gc/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-gc/package.json');
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
  const s = scheduler(path.join(installed, 'lib/index.js'));
  let count = 0;
  s.gc({gcType: 'installed-run', gc() { count++; }}, '2s', 1000);
  s.tick(); s.tick();
  assert.equal(count, 1);
  fs.writeFileSync(path.join(consumer, 'consumer.ts'), [
    "import gc = require('think-gc');",
    "import deep = require('think-gc/index.js');",
    "import compiled = require('think-gc/lib/index.js');",
    "import defaultImport from 'think-gc';",
    'class Store { gcType = "store"; count = 0; gc() { this.count++; } }',
    'const store = new Store();',
    'const result: void = gc(store);',
    'gc(store, 1000, 50); gc(store, "1h"); gc(store, undefined, 100);',
    'gc(store, () => false); gc(store, () => 0); gc(store, () => null);',
    'gc(store, () => Promise.resolve(false));',
    'const object = {gcType: "object", state: 1, gc() { return this.state; }};',
    'gc(object, "1h");',
    'gc({gcType: "inline", state: 1, gc() { return 1; }});',
    'gc({gcType: "async", async gc() { return 1; }});',
    'deep(store); compiled(store); defaultImport(store);',
    '// @ts-expect-error The instance is required.',
    'gc();',
    '// @ts-expect-error The gc method must be callable.',
    'gc({gcType: "invalid", gc: true});',
    '// @ts-expect-error The type name must be a string.',
    'gc({gcType: 1, gc() {}});',
    '// @ts-expect-error The collector must not require an argument.',
    'gc({gcType: "invalid", gc(required: string) { return required; }});',
    '// @ts-expect-error Interval is a duration or predicate, not a boolean.',
    'gc(store, false);',
    '// @ts-expect-error Timer step uses milliseconds as a number.',
    'gc(store, "1h", "1s");',
    '// @ts-expect-error Registration does not return a timer or promise.',
    'const wrong: number = gc(store);',
    'void result; void wrong;'
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
  fs.writeFileSync(path.join(consumer, 'consumer.ts'),
    fs.readFileSync(path.join(consumer, 'consumer.ts'), 'utf8').replace(/\/\/ @ts-expect-error[^\n]*/g, ''));
  for (const compiler of compilers) {
    const errors = compile(consumer, ['-p', 'tsconfig.json'], compiler, compiler === tsc ? 2 : 1);
    assert.match(errors, /TS2345/);
    assert.match(errors, /TS2554/);
    assert.match(errors, /TS2322/);
  }
});
