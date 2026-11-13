const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
const FileStore = require('..');
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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-store-file-'));
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
  for (const name of ['think-helper', '@types/node', 'think-debounce']) {
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


// Keep callback I/O, retries and cross-instance debouncing deterministic while
// retaining the actual helper promisifier and debounce dependency.
function runtime(file, options = {}) {
  const events = [];
  const files = new Set(options.files || ['/store/file']);
  const reads = (options.reads || ['content']).slice();
  const pending = [];
  const module = {exports: {}};
  const localRequire = createRequire(file);
  const helper = localRequire('think-helper');
  const methods = {};
  for (const name of ['readFile', 'writeFile', 'unlink', 'appendFile', 'access', 'stat']) {
    methods[name] = function(...args) {
      assert.equal(this, methods);
      const callback = args.pop();
      events.push([name, ...args.map(arg => name === 'readFile' && typeof arg === 'object' ? {...arg} : arg)]);
      if (options.hold && name === 'readFile') { pending.push(callback); return; }
      if (options.errors && name in options.errors) { callback(options.errors[name]); return; }
      if (name === 'readFile') {
        const result = reads.shift();
        if (result instanceof Error) callback(result); else callback(null, result);
      } else if (name === 'stat') callback(null, options.stats);
      else callback(null);
    };
  }
  methods.constants = fs.constants;
  const fakeHelper = {...helper,
    isFile(file) { events.push(['isFile', file]); return files.has(file); },
    mkdir(file) { events.push(['mkdir', file]); return options.mkdir !== false; },
    chmod(file) { events.push(['chmod', file]); return options.chmod !== false; },
    timeout(ms) { events.push(['timeout', ms]); return Promise.resolve(); }
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    module, exports: module.exports,
    require: name => name === 'fs' ? methods : name === 'think-helper' ? fakeHelper : localRequire(name)
  }, {filename: file});
  return {FileStore: module.exports, events, files, pending};
}

function differential(name, scenario) {
  test(`legacy differential: ${name}`, async () => {
    const old = file => runtime(path.join(__dirname, 'fixtures/legacy.cjs'), file);
    const current = file => runtime(path.join(packageRoot, 'lib/index.js'), file);
    assert.deepEqual(await scenario(current), await scenario(old));
  });
}

differential('class shape, symbol method, mutable root and synchronous assertions', async runtime => {
  const {FileStore, events} = runtime();
  assert.throws(() => FileStore('/store'), error => error.name === 'TypeError');
  for (const value of [undefined, '', 'relative', null, 12, {}]) assert.throws(() => new FileStore(value));
  const store = new FileStore('/store');
  for (const method of ['get', 'set', 'delete', 'append', 'has', 'info']) {
    assert.throws(() => store[method]('../other/file', 'x'), /the file should be in storePath/);
    assert.throws(() => store[method](null), error => error.name === 'TypeError');
  }
  store.storePath = '/new'; await store.get('file');
  assert.equal(events[0][1], path.join('/new', 'file'));
  const symbols = Object.getOwnPropertySymbols(FileStore.prototype);
  assert.equal(symbols.length, 1);
  assert.equal(Object.getOwnPropertyDescriptor(FileStore.prototype, symbols[0]).enumerable, false);
  // The historical string-prefix check is preserved, not strengthened here.
  assert.equal(new FileStore('/store')[symbols[0]]('../store-sibling/file'), path.join('/store-sibling', 'file'));
  assert.equal(FileStore.default, undefined); assert.equal(FileStore.__esModule, undefined);
  return [FileStore.name, FileStore.length, Object.keys(store), Object.getOwnPropertyNames(FileStore.prototype), String(symbols[0])];
});

differential('missing files skip read, append, unlink and stat but access still runs', async runtime => {
  const missing = Object.assign(new Error('missing'), {code: 'ENOENT'});
  const {FileStore, events} = runtime({files: [], errors: {access: missing}});
  const store = new FileStore('/store');
  for (const method of ['get', 'append', 'delete', 'info']) assert.equal(await store[method]('file', 'text'), undefined);
  await assert.rejects(store.has('file'), error => error === missing);
  return events;
});

differential('write, chmod boolean, append, access and Stats identity', async runtime => {
  const stats = {size: 3, isFile() { return true; }};
  const {FileStore, events} = runtime({stats});
  const store = new FileStore('/store'); const data = Buffer.from('abc');
  assert.equal(await store.set('nested/file', data), true);
  assert.equal(await store.append('file', data), undefined);
  assert.equal(await store.has('file'), undefined);
  assert.equal(await store.info('file'), stats);
  assert.equal(await store.delete('file'), undefined);
  const noChmod = runtime({chmod: false, mkdir: false});
  assert.equal(await new noChmod.FileStore('/store').set('file', 'x'), false);
  return [events, noChmod.events];
});

differential('read retries empty content and failures at most four times', async runtime => {
  const result = [];
  const failed = new Error('read failed');
  for (const reads of [['ok'], ['', '', '', ''], ['', failed, 'ready'], [failed, failed, failed, failed], ['', '', '', failed]]) {
    const {FileStore, events} = runtime({reads});
    const store = new FileStore('/store');
    if (reads[reads.length - 1] === failed) await assert.rejects(store.get('file'), error => error === failed);
    else assert.equal(await store.get('file'), reads[reads.length - 1]);
    assert.equal(events.filter(event => event[0] === 'readFile').length, reads.length);
    assert.ok(events.filter(event => event[0] === 'timeout').every(event => event[1] === 10));
    result.push(events);
  }
  return result;
});

differential('concurrent instances share one read and release the debounce queue', async runtime => {
  const {FileStore, events, pending} = runtime({hold: true});
  const first = new FileStore('/store'); const second = new FileStore('/store');
  const values = [first.get('file'), second.get('./file')];
  await Promise.resolve(); assert.equal(pending.length, 1);
  pending.shift()(null, 'shared');
  assert.deepEqual(await Promise.all(values), ['shared', 'shared']);
  await new Promise(resolve => process.nextTick(resolve));
  const next = first.get('file'); await Promise.resolve(); assert.equal(pending.length, 1);
  pending.shift()(null, 'next'); assert.equal(await next, 'next');
  return events;
});

differential('concurrent failure preserves rejection identity and permits retry', async runtime => {
  const failed = new Error('read failed');
  const {FileStore, events} = runtime({reads: [failed, failed, failed, failed, 'recovered']});
  const store = new FileStore('/store');
  const first = store.get('file'); const second = store.get('file');
  await Promise.all([first, second].map(value => assert.rejects(value, error => error === failed)));
  await new Promise(resolve => process.nextTick(resolve));
  assert.equal(await store.get('file'), 'recovered');
  return events;
});

differential('unlink tolerates ENOENT only and other I/O errors retain identity', async runtime => {
  const result = [];
  for (const [method, operation] of [['set', 'writeFile'], ['append', 'appendFile'], ['has', 'access'], ['info', 'stat'], ['delete', 'unlink']]) {
    const failed = Object.assign(new Error('denied'), {code: 'EACCES'});
    const {FileStore, events} = runtime({errors: {[operation]: failed}});
    await assert.rejects(new FileStore('/store')[method]('file', 'x'), error => error === failed);
    assert.equal(events.some(event => event[0] === 'chmod'), false); result.push(events);
  }
  const missing = runtime({errors: {unlink: Object.assign(new Error('race'), {code: 'ENOENT'})}});
  assert.equal(await new missing.FileStore('/store').delete('file'), undefined);
  return [...result, missing.events];
});

test('original and migrated implementations agree against real filesystem operations', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-store-file-real-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const results = [];
  for (const [index, Constructor] of [require('./fixtures/legacy.cjs'), FileStore].entries()) {
    const store = new Constructor(path.join(dir, String(index)));
    const written = await store.set('nested/value', Buffer.from('alpha'));
    await store.append('nested/value', Buffer.from(' beta'));
    const data = await store.get('nested/value');
    const stat = await store.info('nested/value');
    assert.ok(stat instanceof fs.Stats); assert.equal(stat.isFile(), true);
    const access = await store.has('nested/value');
    await store.set('empty', ''); assert.equal(await store.get('empty'), '');
    await store.set('bytes', new Uint16Array([65]));
    assert.equal(fs.statSync(path.join(store.storePath, 'bytes')).size, 2);
    await store.delete('nested/value'); await store.delete('nested/value');
    assert.equal(await store.get('nested/value'), undefined);
    await assert.rejects(store.has('nested/value'), {code: 'ENOENT'});
    results.push([written, data, stat.size, access]);
  }
  assert.deepEqual(results[0], results[1]);
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
  const overrides = {'think-store-file': packDependencies(packageRoot)};
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const api = installedRequire('think-store-file');
  assert.equal(typeof api, 'function');
  assert.equal(api.default, undefined);
  assert.equal(api, installedRequire('think-store-file/index.js'));
  assert.equal(api, installedRequire('think-store-file/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-store-file')).href)).default, api);
  const instance = new api(path.join(consumer, 'data'));
  const result = await instance.set('nested/value', 'packed');
  assert.equal(typeof result, 'boolean');
  await instance.append('nested/value', Buffer.from(' bytes'));
  assert.equal(await instance.get('nested/value'), 'packed bytes');
  assert.ok((await instance.info('nested/value')) instanceof fs.Stats);
  await instance.has('nested/value');
  await instance.delete('nested/value');
  assert.equal(await instance.info('nested/value'), undefined);
  const installed = path.dirname(installedRequire.resolve('think-store-file/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-store-file/package.json');
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
    for (const code of ['TS2322', 'TS2345', 'TS2348']) assert.match(errors, new RegExp(code));
  }

});

test('actual production execution maps to one TS LCOV record without generated duplicates', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-store-file-lcov-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const driver = path.join(dir, 'run.cjs');
  fs.writeFileSync(driver, `
    const FileStore = require(${JSON.stringify(packageRoot)});
    (async () => {
      const store = new FileStore(${JSON.stringify(path.join(dir, 'data'))});
      await store.set('file', 'value'); await store.append('file', ' extra');
      if (await store.get('file') !== 'value extra') throw new Error('file read failed');
      await store.has('file'); await store.info('file'); await store.delete('file');
      await store.get('file'); await store.delete('file'); await store.append('file', 'missing');
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `);
  const env = {...process.env}; delete env.NODE_V8_COVERAGE;
  const result = spawnSync(process.execPath, [require.resolve('c8/bin/c8.js'), '--config', path.join(root, '.c8rc.json'),
    '--all=false', '--reports-dir', path.join(dir, 'coverage'), '--temp-directory', path.join(dir, 'v8'),
    '--reporter=lcovonly', process.execPath, driver], {cwd: root, env, encoding: 'utf8'});
  assert.ifError(result.error); assert.equal(result.status, 0, result.stdout + result.stderr);
  const lcov = fs.readFileSync(path.join(dir, 'coverage/lcov.info'), 'utf8').replaceAll('\\', '/');
  const sections = lcov.split('end_of_record');
  const records = sections.filter(section => /^SF:packages\/think-store-file\/src\/index.ts$/m.test(section));
  assert.equal(records.length, 1, lcov);
  for (const pattern of [/^DA:\d+,[1-9]\d*$/m, /^FNDA:[1-9]\d*,/m, /^BRDA:.*,.*,[1-9]\d*$/m]) assert.match(records[0], pattern);
  assert.doesNotMatch(lcov, /^SF:.*think-store-file\/(?:lib\/|test\/|.*\.d\.ts)/m);
  assert.equal(FileStore, require('../lib/index.js'));
});
