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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'think-qs-'));
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
  for (const name of ['qs']) {
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
  assert.equal(create()({request: {}}, () => 42), 42);
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


const implementations = [legacy, middleware];

function differential(name, scenario) {
  test(`legacy differential: ${name}`, async () => {
    const results = [];
    for (const create of implementations) results.push(await scenario(create));
    assert.deepEqual(results[1], results[0]);
  });
}

differential('default query parsing, repeated requests and prototype filtering', create => {
  const run = create();
  const results = [];
  for (const querystring of ['', undefined, 'a=b&a=c', 'a[b]=c&list[]=1&list[]=2', '__proto__[polluted]=yes&constructor[x]=1']) {
    const ctx = {request: {querystring}};
    let calls = 0;
    assert.equal(run(ctx, () => ++calls), 1);
    assert.equal(calls, 1);
    results.push(ctx.request._query);
  }
  assert.deepEqual(results[0], {});
  assert.deepEqual(results[2], {a: ['b', 'c']});
  assert.deepEqual(results[3], {a: {b: 'c'}, list: ['1', '2']});
  assert.equal({}.polluted, undefined);
  return results;
});

differential('parser options pass through for both query and bracketed post', create => {
  const options = {allowDots: true, depth: 1, arrayLimit: 1, parameterLimit: 8};
  const ctx = {request: {querystring: 'a.b=c&a.deep[value]=d&list[3]=x', body: {post: {'a[b]': 'value', 'nested.deep': 'x'}}}};
  create(options)(ctx, () => undefined);
  assert.deepEqual(ctx.request._query, {a: {b: 'c', deep: {'[value]': 'd'}}, list: {'3': 'x'}});
  assert.deepEqual(ctx.request.body.post, {a: {b: 'value'}, nested: {deep: 'x'}});
  return ctx;
});

differential('custom decoder values remain uncoerced', create => {
  const ctx = {request: {querystring: 'answer=42&empty=', body: {post: {'list[]': '42'}}}};
  create({decoder(value, decode, charset, kind) {
    return kind === 'value' && value === '42' ? 42 : decode(value);
  }})(ctx, () => undefined);
  assert.equal(ctx.request._query.answer, 42);
  assert.deepEqual(ctx.request.body.post, {list: [42]});
  return ctx;
});

differential('post conversion is conditional and preserves body identity', create => {
  const run = create();
  const results = [];
  for (const post of [undefined, null, false, '', 0, 'text', 5, [], {}, {plain: {nested: 'yes'}}, {'unclosed[': 'x'}, {'close]': 'x'}, {'a[b]': 'x'}, {'a[]': ['x', 'y']}]) {
    const body = {post};
    const ctx = {request: {body}};
    let called = 0;
    run(ctx, () => ++called);
    assert.equal(ctx.request.body, body);
    assert.equal(called, 1);
    if (!post || !Object.keys(post).some(key => key.includes('[') && key.includes(']'))) assert.equal(body.post, post);
    results.push(body.post);
  }
  assert.deepEqual(results[12], {a: {b: 'x'}});
  assert.deepEqual(results[13], {a: ['x', 'y']});
  return results;
});

differential('disabled and explicitly undefined flags preserve existing values', create => {
  const results = [];
  for (const options of [{query: false, post: false}, {query: undefined, post: undefined}, {query: null, post: 0}]) {
    const original = {saved: true};
    const post = {'a[b]': 'x'};
    const ctx = {request: {querystring: 'query=x', _query: original, body: {post}}};
    create(options)(ctx, () => undefined);
    assert.equal(ctx.request._query, original);
    assert.equal(ctx.request.body.post, post);
    results.push(ctx);
  }
  return results;
});

differential('factory snapshots options without mutating the caller or defaults', create => {
  const options = {query: false, post: false};
  const run = create(options);
  assert.deepEqual(options, {query: false, post: false});
  options.query = true; options.post = true;
  const ctx = {request: {querystring: 'a=b', body: {post: {'a[b]': 'c'}}}};
  run(ctx, () => undefined);
  assert.equal(ctx.request._query, undefined);
  const results = [ctx];
  for (const value of [undefined, null, {}, 1, 'option']) {
    const next = {request: {querystring: 'default=yes'}};
    create(value)(next, () => undefined);
    assert.deepEqual(next.request._query, {default: 'yes'});
    results.push(next);
  }
  return results;
});

differential('next return identity, receiver, errors and rejections', async create => {
  const run = create();
  const values = [undefined, 0, false, 'value', {}, Promise.resolve(7), {then() { throw Error('must not await'); }}];
  const results = [];
  for (const value of values) {
    let called = 0;
    const returned = run({request: {}}, function() {
      'use strict';
      assert.equal(this, undefined);
      called++;
      return value;
    });
    assert.equal(returned, value);
    assert.equal(called, 1);
    results.push(typeof returned);
  }
  const error = new Error('next failure');
  assert.throws(() => run({request: {}}, () => { throw error; }), actual => actual === error);
  const promise = Promise.reject(error);
  const returned = run({request: {}}, () => promise);
  assert.equal(returned, promise);
  await assert.rejects(returned, actual => actual === error);
  return results;
});

differential('request reads, parser mutation and next retain their order', create => {
  const trace = [];
  const ctx = {request: {
    get querystring() { trace.push('querystring'); return 'a=b'; },
    set _query(value) { trace.push(['query', value]); },
    get body() { trace.push('body'); return {post: {'a[b]': 'c'}}; }
  }};
  create()(ctx, () => trace.push('next'));
  assert.deepEqual(trace, ['querystring', ['query', {a: 'b'}], 'body', 'next']);
  trace.length = 0;
  create({query: false, post: false})(ctx, () => trace.push('next'));
  assert.deepEqual(trace, ['body', 'next']);
  return trace;
});

differential('parse/stringify failures do not call next', create => {
  let calls = 0;
  const cycle = {}; cycle.self = cycle;
  const scenarios = [
    [create({decoder() { throw Error('decoder failed'); }}), {request: {querystring: 'a=b'}}],
    [create(), {request: {body: {post: {'a[b]': cycle}}}}],
    [create(), {request: {set _query(value) { throw Error('setter failed'); }}}]
  ];
  return scenarios.map(([run, ctx]) => {
    try { run(ctx, () => calls++); assert.fail('must throw'); }
    catch (error) { assert.equal(calls, 0); return [error.name, error.message]; }
  });
});

differential('read-only, frozen and proxy writes retain sloppy CommonJS behavior', create => {
  const original = {old: true};
  const body = Object.freeze({post: {'a[b]': 'x'}});
  const request = Object.freeze({querystring: 'a=b', _query: original, body});
  let calls = 0;
  create()({request}, () => calls++);
  assert.equal(request._query, original);
  assert.deepEqual(body.post, {'a[b]': 'x'});
  const trace = [];
  const proxy = new Proxy({querystring: 'x=y'}, {set(target, key, value, receiver) {
    assert.equal(receiver, proxy);
    trace.push([key, value]); return false;
  }});
  create()({request: proxy}, () => calls++);
  const getter = {get _query() { return original; }};
  create()({request: getter}, () => calls++);
  assert.equal(getter._query, original);
  assert.equal(calls, 3);
  return trace;
});

differential('primitive requests and non-object bodies keep existing behavior', create => {
  let calls = 0;
  for (const request of ['text', 1, true, Symbol('request'), 1n]) create()({request}, () => calls++);
  for (const body of ['text', 1, true, Symbol('body'), 1n, null, false]) create()({request: {body}}, () => calls++);
  assert.equal(calls, 12);
  for (const request of [null, undefined]) assert.throws(() => create()({request}, () => calls++), TypeError);
  return calls;
});

test('CommonJS export identity and anonymous, nonconstructible factory shape', () => {
  assert.equal(typeof middleware, 'function');
  assert.equal(middleware.name, legacy.name);
  assert.equal(middleware.length, 1);
  assert.equal(middleware.prototype, undefined);
  assert.equal(middleware.default, undefined);
  assert.equal(middleware, require('../index.js'));
  assert.equal(middleware, require('../lib/index.js'));
  assert.equal(middleware().name, '');
  assert.equal(middleware().length, 2);
  assert.throws(() => new middleware(), TypeError);
});

differential('request accessors are read once per original access with the same receiver', create => {
  const trace = [];
  const first = {querystring: 'a=b'};
  const second = {set _query(value) { assert.equal(this, second); trace.push(['write', value]); }};
  const third = {get body() { trace.push('body'); return undefined; }};
  const requests = [first, second, third];
  let reads = 0;
  const ctx = {get request() { trace.push(['read', reads]); return requests[reads++]; }};
  create()(ctx, () => trace.push('next'));
  assert.equal(reads, 3);
  assert.deepEqual(trace, [['read', 0], ['read', 1], ['write', {a: 'b'}], ['read', 2], 'body', 'next']);
  return trace;
});

test('cold prepack installs offline with CommonJS, maps and TS 3.9/5.9 consumers', async t => {
  const {dir, source} = fixture(t);
  const tarballs = path.join(dir, 'tarballs');
  fs.mkdirSync(tarballs);
  const packed = pack(source, tarballs);
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'index.d.ts', 'index.js', 'lib/index.d.ts', 'lib/index.d.ts.map',
    'lib/index.js', 'lib/index.js.map', 'package.json', 'src/index.ts', 'src/qs.d.ts'
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
  const overrides = {'think-qs': packDependencies(packageRoot)};
  const consumer = path.join(dir, 'consumer');
  fs.mkdirSync(consumer);
  // Resolve the exact dependency graph from local tarballs without modifying
  // published manifests or relying on workspace links or a registry.
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({private: true, overrides}));
  npm(consumer, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', packed.archive]);
  const installedRequire = createRequire(path.join(consumer, 'package.json'));
  const create = installedRequire('think-qs');
  assert.equal(typeof create, 'function');
  assert.equal(create.default, undefined);
  assert.equal(create, installedRequire('think-qs/index.js'));
  assert.equal(create, installedRequire('think-qs/lib/index.js'));
  assert.equal((await import(pathToFileURL(installedRequire.resolve('think-qs')).href)).default, create);
  const ctx = {request: {querystring: 'installed=yes', body: {post: {'list[]': 'value'}}}};
  assert.equal(create()(ctx, () => 42), 42);
  assert.deepEqual(ctx.request._query, {installed: 'yes'});
  assert.deepEqual(ctx.request.body.post, {list: ['value']});
  const installed = path.dirname(installedRequire.resolve('think-qs/package.json'));
  assert.equal(fs.lstatSync(installed).isSymbolicLink(), false);
  const manifest = installedRequire('think-qs/package.json');
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
    "import middleware = require('think-qs');",
    "import deep = require('think-qs/index.js');",
    "import compiled = require('think-qs/lib/index.js');",
    "import defaultImport from 'think-qs';",
    'const ctx = {request: {querystring: "a=b", body: {post: {"a[b]": "c"}}}};',
    'const run = middleware();',
    'const number: number = run(ctx, () => 42);',
    'const asyncResult: Promise<string> = run(ctx, async () => "value");',
    'const voidResult: void = run(ctx, () => {});',
    'const object: {id: number} = run(ctx, () => ({id: 1}));',
    'middleware(null); middleware(undefined);',
    'middleware({query: false, post: true, depth: 2, allowDots: true});',
    'middleware({decoder(value: string) { return Number(value); }});',
    'middleware({query: undefined, post: undefined});',
    'interface ParserOptions {depth?: number; allowDots?: boolean;}',
    'const parserOptions: ParserOptions = {depth: 2}; middleware(parserOptions);',
    'interface FrameworkOptions extends ParserOptions {query?: boolean;}',
    'const frameworkOptions: FrameworkOptions = {query: false}; middleware(frameworkOptions);',
    'interface InvalidOptions {query: string; depth: number;}',
    'const invalidOptions: InvalidOptions = {query: "yes", depth: 2};',
    '// @ts-expect-error Framework flags are checked on interface-typed options too.',
    'middleware(invalidOptions);',
    'run({request: {}}, () => null);',
    'run({request: {body: "raw", _query: {already: true}}}, () => undefined);',
    'run({request: {body: null}}, () => false);',
    'const options: Parameters<typeof middleware>[0] = {query: true};',
    'const context: Parameters<ReturnType<typeof middleware>>[0] = {request: {}};',
    'run(context, () => undefined);',
    '// @ts-expect-error Parsed HTTP input and custom decoder results need narrowing.',
    'const unsafe: string = context.request._query;',
    'deep(options)(ctx, () => 1); compiled()(ctx, () => 1); defaultImport()(ctx, () => 1);',
    '// @ts-expect-error Options must be an object.',
    'middleware(1);',
    '// @ts-expect-error query must be a boolean when provided.',
    'middleware({query: "yes"});',
    '// @ts-expect-error post must be a boolean when provided.',
    'middleware({post: 1});',
    '// @ts-expect-error A request object is required.',
    'run({}, () => 1);',
    '// @ts-expect-error Query strings must be strings.',
    'run({request: {querystring: 1}}, () => 1);',
    '// @ts-expect-error A next function is required.',
    'run(ctx, 42);',
    '// @ts-expect-error Middleware calls next without required arguments.',
    'run(ctx, (value: string) => value);',
    '// @ts-expect-error The return value is exactly what next returns.',
    'const wrong: string = run(ctx, () => 1);',
    '// @ts-expect-error The factory is not a constructor.',
    'new middleware();',
    'void number; void asyncResult; void voidResult; void object; void unsafe; void wrong;'
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


differential('nullish request changes before assignment still throw before next', create => {
  const results = [];
  for (const value of [null, undefined]) {
    let reads = 0;
    let called = false;
    const ctx = {get request() { return reads++ === 0 ? {querystring: 'a=b'} : value; }};
    assert.throws(() => create()(ctx, () => { called = true; }), TypeError);
    assert.equal(reads, 2);
    assert.equal(called, false);
    const changed = {request: {querystring: 'a=b'}};
    assert.throws(() => create({decoder(input) { changed.request = value; return input; }})(changed, () => { called = true; }), TypeError);
    assert.equal(called, false);
    results.push([reads, called]);
  }
  return results;
});
