const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
const Crontab = require('..');
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-crontab-'));
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
  for (const name of ['think-helper', '@types/node', 'debug', 'node-schedule', 'think-cluster', 'think-mock-http']) {
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


// Keep clocks, scheduler, cluster messaging and mock HTTP isolated from globals.
function runtime(file) {
  const events = [];
  const timers = [];
  const jobs = [];
  const messages = [];
  const calls = [];
  const module = {exports: {}};
  const localRequire = createRequire(file);
  const dependencies = {
    'node-schedule': {scheduleJob(rule, callback) { events.push(['schedule', rule]); jobs.push(callback); return null; }},
    'think-cluster': {messenger: {runInOne(callback) { events.push(['one']); messages.push(callback); return 42; }}},
    'think-mock-http': (args, app) => { calls.push([args, app]); return calls; },
    debug: () => message => events.push(['debug', message])
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    module, exports: module.exports, require: name => dependencies[name] || localRequire(name),
    process: {pid: 99},
    setInterval(callback, interval) {
      events.push(['interval', interval]); timers.push(callback);
      return {unref() { events.push(['unref']); }};
    }
  }, {filename: file});
  return {Crontab: module.exports, events, timers, jobs, messages, calls};
}

function differential(name, scenario) {
  test(`legacy differential: ${name}`, () => {
    const old = runtime(path.join(__dirname, 'fixtures/legacy.cjs'));
    const current = runtime(path.join(packageRoot, 'lib/index.js'));
    assert.deepEqual(scenario(current), scenario(old));
  });
}

differential('class export, prototype, optional app and empty options', ({Crontab}) => {
  assert.throws(() => Crontab([]), error => error.name === 'TypeError');
  const instance = new Crontab([]);
  assert.equal(instance.app, undefined);
  assert.equal(instance.runTask(), undefined);
  assert.equal(Crontab.default, undefined); assert.equal(Crontab.__esModule, undefined);
  return [Crontab.name, Crontab.length, Object.getOwnPropertyNames(Crontab.prototype), Object.keys(instance)];
});

differential('string normalization, mutable inputs, truthiness and shared references', ({Crontab, calls}) => {
  const app = {};
  const cron = new Crontab('/task', app);
  const task = cron.options[0];
  assert.equal(task.type, 'one');
  assert.equal(task.handle(), calls);
  assert.equal(calls[0][0].method, 'CLI'); assert.equal(calls[0][0].url, '/task'); assert.equal(calls[0][1], app);
  const received = [];
  const option = {handle(application) { received.push([this, application]); }, type: ''};
  const options = [option];
  const normalized = cron.parseOptions(options);
  assert.notEqual(normalized, options); assert.equal(normalized[0], option); assert.equal(option.type, 'one');
  option.type = 'all'; cron.runItemTask(option);
  assert.equal(received[0][0], option); assert.equal(received[0][1], app);
  for (const enable of [undefined, true, false, null, 0, '', 'false', [], {}]) {
    const item = {handle: '/disabled', enable};
    const result = cron.parseOptions(item);
    assert.equal(result.length, enable === undefined || !!enable ? 1 : 0);
    // Even disabled entries are normalized in place before filtering.
    assert.equal(typeof item.handle, 'function'); assert.equal(item.type, 'one');
  }
  return [task.type, Object.keys(option), received.length];
});

differential('all/one dispatch, delayed mutation, receiver and ignored results', ({Crontab, events, messages}) => {
  const app = {id: 1};
  const seen = [];
  const task = {handle(application) { seen.push([this, application]); return Promise.resolve(42); }, type: 'all'};
  const cron = new Crontab(task, app);
  assert.equal(cron.runItemTask(task), undefined);
  for (const type of ['one', 'other', undefined, null, '']) {
    task.type = type;
    assert.equal(cron.runItemTask(task), undefined);
  }
  assert.equal(messages.length, 5); assert.equal(seen.length, 1);
  const replacementApp = {id: 2}; cron.app = replacementApp;
  task.handle = function(application) { seen.push([this, application]); return 123; };
  messages.splice(0).forEach(callback => assert.equal(callback(), undefined));
  assert.equal(seen.length, 6);
  for (const [receiver, application] of seen.slice(1)) { assert.equal(receiver, task); assert.equal(application, replacementApp); }
  return events;
});

differential('immediate readiness, interval precedence, unref and task labels', ({Crontab, events, timers, jobs}) => {
  const ready = []; let runs = 0;
  const app = {on(event, callback) { assert.equal(this, app); events.push(['on', event]); ready.push(callback); }};
  const option = {name: 'tick', handle(application) { assert.equal(this, option); assert.equal(application, app); runs++; }, type: 'all', immediate: true, interval: '2s', cron: '* * * * *'};
  const cron = new Crontab(option, app);
  assert.equal(cron.runTask(), undefined);
  assert.equal(runs, 0); assert.equal(jobs.length, 0); assert.equal(timers.length, 1);
  assert.equal(option.taskName, ', name:tickinterval: 2s');
  ready[0](); timers[0](); assert.equal(runs, 2);
  // Repeated calls retain the existing multiple-registration behavior.
  cron.runTask(); assert.equal(timers.length, 2); assert.equal(ready.length, 2);
  return events;
});

differential('cron strings, dates and objects are forwarded without copying', ({Crontab, events, jobs}) => {
  const rules = ['* * * * *', new Date(1000), {hour: 8}, {rule: '0 * * * *', tz: 'UTC'}];
  for (const rule of rules) {
    let executions = 0;
    const option = {handle() { executions++; }, cron: rule, type: 'all', interval: 0};
    const cron = new Crontab(option);
    cron.runTask();
    assert.equal(events[events.length - 1][1], rule);
    assert.equal(option.taskName, `, cron: ${rule}`);
    jobs[jobs.length - 1](); assert.equal(executions, 1);
  }
  return events.map(([kind, value]) => [kind, String(value)]);
});

differential('errors, immediate ordering and aborted later tasks', ({Crontab, events, timers, messages}) => {
  const failure = new Error('handler failed');
  const immediate = {handle() { events.push(['immediate']); }, type: 'all', immediate: true};
  const app = {on(event, callback) { callback(); }};
  const cron = new Crontab([immediate, {handle() {}, interval: 1}], app);
  assert.throws(() => cron.runTask(), /\.interval or \.cron need be set/);
  assert.equal(events[0][0], 'immediate'); assert.equal(timers.length, 0);
  const throwing = new Crontab({handle() { throw failure; }, type: 'all'});
  assert.throws(() => throwing.runItemTask(throwing.options[0]), error => error === failure);
  throwing.options[0].type = 'one'; throwing.runItemTask(throwing.options[0]);
  assert.throws(() => messages[0](), error => error === failure);
  assert.throws(() => new Crontab({handle() {}, immediate: true, interval: 1}).runTask(), error => error.name === 'TypeError');
  for (const interval of ['not-a-duration', {}]) assert.throws(() => new Crontab({handle() {}, interval}).runTask());
  return events;
});

differential('strict class writes, invalid inputs and captured URL values', ({Crontab, calls}) => {
  for (const value of [undefined, null, 42, true, [null], Object.freeze({handle() {}})]) {
    assert.throws(() => new Crontab(value), error => error.name === 'TypeError');
  }
  const input = {handle: '/original'};
  const cron = new Crontab(input);
  const wrapped = input.handle;
  input.handle = '/changed'; cron.app = {later: true}; wrapped();
  assert.equal(calls[0][0].url, '/original'); assert.equal(calls[0][1], cron.app);
  const boxed = new Crontab(new String('/boxed'));
  boxed.options[0].handle(); assert.equal(calls[1][0].url, undefined);
  return calls.map(([args, app]) => [args.method, String(args.url), app]);
});


test('cold prepack installs offline with CJS, deep entries, maps and TS 3.9/5.9 consumers', async t => {
  const {dir, source} = fixture(t);
  const tarballs = path.join(dir, 'tarballs');
  const staging = path.join(dir, 'staging');
  fs.mkdirSync(tarballs); fs.mkdirSync(staging);
  const packed = pack(source, tarballs);
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'index.d.ts', 'index.js', 'lib/index.d.ts', 'lib/index.d.ts.map',
    'lib/index.js', 'lib/index.js.map', 'package.json', 'src/dependencies.d.ts', 'src/index.ts'
  ]);
  const graph = new Map();
  const packages = new Map();
  function packDependencies(folder) {
    const localRequire = createRequire(path.join(folder, 'package.json'));
    const manifest = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
    const identity = `${manifest.name}@${manifest.version}`;
    const dependencies = {};
    for (const name of Object.keys(manifest.dependencies || {})) {
      dependencies[name] = localRequire(`${name}/package.json`).version;
    }
    if (graph.has(identity)) {
      assert.deepEqual(graph.get(identity), dependencies, `Conflicting fixture graphs for ${identity}`);
      return;
    }
    graph.set(identity, dependencies);
    for (const name of Object.keys(dependencies)) {
      const dependency = path.dirname(localRequire.resolve(`${name}/package.json`));
      const metadata = localRequire(`${name}/package.json`);
      if (!packages.has(name)) packages.set(name, new Map());
      const versions = packages.get(name);
      if (!versions.has(metadata.version)) {
        const archive = packDependency(dependency, tarballs, staging).packed.archive;
        versions.set(metadata.version, `file:${archive}`);
      }
      packDependencies(dependency);
    }
  }
  packDependencies(packageRoot);
  const dependencies = {};
  const overrides = {};
  // npm 11.19+ can lose repeated deep overrides and request registry metadata.
  // Keep single-version packages flat. npm 10 can misapply version-qualified
  // overrides on local tarballs, so conflicting leaf versions are scoped to
  // their owning packages instead. Never rewrite the published manifests.
  for (const [name, versions] of packages) {
    if (versions.size === 1) dependencies[name] = overrides[name] = [...versions.values()][0];
  }
  for (const [identity, edges] of graph) {
    const parent = identity.slice(0, identity.lastIndexOf('@'));
    for (const [name, version] of Object.entries(edges)) {
      if (packages.get(name).size === 1) continue;
      assert.equal(packages.get(parent).size, 1, `Version-aware parent fixture needed for ${identity}`);
      if (typeof overrides[parent] === 'string') overrides[parent] = {'.': overrides[parent]};
      overrides[parent][name] = packages.get(name).get(version);
    }
  }
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, dependencies, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const checked = new Set();
  function checkInstalledGraph(folder) {
    const localRequire = createRequire(path.join(folder, 'package.json'));
    const manifest = localRequire('./package.json');
    const identity = `${manifest.name}@${manifest.version}`;
    if (checked.has(identity)) return;
    checked.add(identity);
    const expected = graph.get(identity);
    assert.ok(expected, `Unexpected installed package ${identity}`);
    assert.deepEqual(Object.keys(manifest.dependencies || {}).sort(), Object.keys(expected).sort());
    for (const [name, version] of Object.entries(expected)) {
      assert.equal(localRequire(`${name}/package.json`).version, version, `${identity} -> ${name}`);
      checkInstalledGraph(path.dirname(localRequire.resolve(`${name}/package.json`)));
    }
  }
  checkInstalledGraph(path.dirname(installedRequire.resolve('think-crontab/package.json')));
  assert.equal(checked.size, graph.size);
  const api = installedRequire('think-crontab');
  assert.equal(typeof api, 'function');
  assert.equal(api.default, undefined);
  assert.equal(api, installedRequire('think-crontab/index.js'));
  assert.equal(api, installedRequire('think-crontab/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-crontab')).href)).default, api);
  let received;
  const app = {marker: 42};
  const instance = new api({handle(application) { received = [this, application]; }, type: 'all', interval: '1s'}, app);
  assert.equal(instance.runItemTask(instance.options[0]), undefined);
  assert.equal(received[0], instance.options[0]); assert.equal(received[1], app);
  assert.equal(instance.app, app);
  assert.equal(new api('/packed').options[0].handle().req.url, '/packed');
  const installed = path.dirname(installedRequire.resolve('think-crontab/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-crontab/package.json');
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
    for (const code of ['TS2322', 'TS2345', 'TS2348']) assert.match(errors, new RegExp(code));
  }
});

test('actual production execution maps to one TS LCOV record without generated duplicates', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-crontab-lcov-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const driver = path.join(dir, 'run.cjs');
  fs.writeFileSync(driver, `
    const Crontab = require(${JSON.stringify(packageRoot)});
    let runs = 0;
    const task = new Crontab([{handle() { runs++; }, type: 'all', interval: '1s'}, {handle() {}, enable: false}]);
    task.runItemTask(task.options[0]);
    task.runTask();
    if (runs !== 1) throw new Error('task did not execute');
    new Crontab('/mapped').options[0].handle();
  `);
  const env = {...process.env}; delete env.NODE_V8_COVERAGE;
  const result = spawnSync(process.execPath, [require.resolve('c8/bin/c8.js'), '--config', path.join(root, '.c8rc.json'),
    '--all=false', '--reports-dir', path.join(dir, 'coverage'), '--temp-directory', path.join(dir, 'v8'),
    '--reporter=lcovonly', process.execPath, driver], {cwd: root, env, encoding: 'utf8'});
  assert.ifError(result.error); assert.equal(result.status, 0, result.stdout + result.stderr);
  const lcov = fs.readFileSync(path.join(dir, 'coverage/lcov.info'), 'utf8').replaceAll('\\', '/');
  const sections = lcov.split('end_of_record');
  const records = sections.filter(section => /^SF:packages\/think-crontab\/src\/index.ts$/m.test(section));
  assert.equal(records.length, 1, lcov);
  for (const pattern of [/^DA:\d+,[1-9]\d*$/m, /^FNDA:[1-9]\d*,/m, /^BRDA:.*,.*,[1-9]\d*$/m]) assert.match(records[0], pattern);
  assert.doesNotMatch(lcov, /^SF:.*think-crontab\/(?:lib\/|test\/|.*\.d\.ts)/m);
  assert.equal(Crontab, require('../lib/index.js'));
});
