'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : require('typescript');
const TrackedWatcher = require('../../think-watcher/tracked');
const {createWatcher} = require('../development');

function fixture(t, compiler = ts) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-development-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const write = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    fs.writeFileSync(path.join(root, file), content);
  };
  // These tests exercise a real semantic compiler without depending on an
  // installed framework. Installed-package HTTP acceptance covers real contracts.
  write('node_modules/thinkjs/service-types.d.ts', 'export interface ServiceModules {}\nexport type ThinkServices<T, M> = T;\nexport type ContextServices<T, M> = T;\nexport type ControllerServices<T, M, C> = T;\n');
  write('src/service/first.ts', 'export default {value: 1};\n');
  const config = {compilerOptions: {strict: true, skipLibCheck: true, module: 'commonjs',
    target: 'es2018', rootDir: 'src', outDir: 'app', sourceMap: true, resolveJsonModule: true,
    types: []}, include: ['src/**/*.ts', '.thinkjs/types/**/*.d.ts']};
  const configure = patch => {
    Object.assign(config, patch);
    write('tsconfig.json', JSON.stringify(config));
  };
  configure({});
  const builds = [];
  const Watcher = createWatcher(TrackedWatcher, compiler);
  const watcher = new Watcher({root, srcPath: path.join(root, 'src'), diffPath: path.join(root, 'app')}, result => builds.push(result));
  t.after(() => watcher.close());
  return {root, write, config, configure, watcher, builds,
    read: file => fs.readFileSync(path.join(root, file), 'utf8'),
    exists: file => fs.existsSync(path.join(root, file))};
}

test('generation precedes real semantic checking; one whole batch emits then reloads', t => {
  const f = fixture(t);
  f.watcher.poll();
  assert.equal(f.builds.length, 1);
  assert.equal(f.builds[0].event, 'build');
  assert.match(f.read('.thinkjs/types/service.d.ts'), /first/);
  assert.match(f.read('app/service/first.js'), /value: 1/);
  const mtime = fs.statSync(path.join(f.root, 'app/service/first.js')).mtimeMs;
  f.watcher.poll();
  assert.equal(f.builds.length, 1);
  assert.equal(fs.statSync(path.join(f.root, 'app/service/first.js')).mtimeMs, mtime);
  f.write('src/service/second.ts', 'export default {value: 2};\n');
  fs.renameSync(path.join(f.root, 'src/service/first.ts'), path.join(f.root, 'src/service/moved.ts'));
  f.watcher.poll();
  assert.equal(f.builds.length, 2);
  assert.equal(f.exists('app/service/first.js'), false);
  assert.equal(f.exists('app/service/first.js.map'), false);
  assert.ok(f.exists('app/service/second.js'));
  assert.ok(f.exists('app/service/moved.js'));
});

test('semantic errors block all writes and deletion, then recover without stale declarations', t => {
  const f = fixture(t);
  f.watcher.poll();
  const previous = f.read('app/service/first.js');
  f.write('src/service/second.ts', 'const value: number = "wrong"; export default {value};\n');
  fs.unlinkSync(path.join(f.root, 'src/service/first.ts'));
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_TYPECHECK'});
  assert.equal(f.builds.length, 1);
  assert.equal(f.read('app/service/first.js'), previous);
  assert.equal(f.exists('app/service/second.js'), false);
  assert.match(f.read('.thinkjs/types/service.d.ts'), /second/);
  f.write('src/service/second.ts', 'const value: number = 2; export default {value};\n');
  f.watcher.poll();
  assert.equal(f.builds.length, 2);
  assert.equal(f.exists('app/service/first.js'), false);
  assert.match(f.read('app/service/second.js'), /value = 2/);
});

test('checks declarations and runtime source coverage, config errors and unsupported JS', t => {
  const f = fixture(t);
  f.configure({include: ['src/**/*.ts']});
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
  f.configure({include: ['.thinkjs/types/**/*.d.ts']});
  f.write('src/unimported.ts', 'export const value = 1;');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
  f.configure({include: ['src/**/*.ts', '.thinkjs/types/**/*.d.ts']});
  f.write('src/legacy.js', 'module.exports = 1;');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
  fs.unlinkSync(path.join(f.root, 'src/legacy.js'));
  f.write('tsconfig.json', '{broken');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
  assert.equal(f.exists('app'), false);
});

test('project compiler re-emits const enum consumers and changed configuration', t => {
  const f = fixture(t);
  f.write('src/numbers.ts', 'export const enum Value { One = 1 }\n');
  f.write('src/service/first.ts', 'import {Value} from "../numbers"; export default {value: Value.One};\n');
  f.watcher.poll();
  assert.match(f.read('app/service/first.js'), /value: 1/);
  f.write('src/numbers.ts', 'export const enum Value { One = 9 }\n');
  f.watcher.poll();
  assert.match(f.read('app/service/first.js'), /value: 9/);
  f.config.compilerOptions.sourceMap = false;
  f.config.compilerOptions.target = 'es5';
  f.configure({});
  f.watcher.poll();
  assert.equal(f.exists('app/service/first.js.map'), false);
  assert.doesNotMatch(f.read('app/service/first.js'), /sourceMappingURL/);
  assert.equal(f.builds.length, 3);
});

test('imported JSON is emitted, updated and cleaned by compiler ownership', t => {
  const f = fixture(t);
  f.write('src/data.json', '{"value":1}');
  f.write('src/service/first.ts', 'import data = require("../data.json"); export default data;\n');
  f.watcher.poll();
  assert.equal(JSON.parse(f.read('app/data.json')).value, 1);
  f.write('src/data.json', '{"value":2}');
  f.watcher.poll();
  assert.equal(JSON.parse(f.read('app/data.json')).value, 2);
  f.write('src/service/first.ts', 'export default {value: 3};\n');
  fs.unlinkSync(path.join(f.root, 'src/data.json'));
  f.watcher.poll();
  assert.equal(f.exists('app/data.json'), false);
});

test('refused cleanup blocks reload and recovering the original snapshot repairs partial emits', t => {
  const f = fixture(t);
  f.write('src/service/second.ts', 'export default {value: 1};\n');
  f.watcher.poll();
  const original = f.read('app/service/first.js');
  // Fail on the second source after the first was emitted. Reverting source
  // must not mistake the previous successful fingerprint for a clean build.
  const emit = f.watcher.emitSource;
  f.watcher.emitSource = function(info) {
    if (info.file === path.join('service', 'second.ts')) throw new Error('disk failure');
    return emit.call(this, info);
  };
  f.write('src/service/first.ts', 'export default {value: 2};\n');
  assert.throws(() => f.watcher.poll(), /disk failure/);
  assert.equal(f.builds.length, 1);
  assert.match(f.read('app/service/first.js'), /value: 2/);
  f.write('src/service/first.ts', 'export default {value: 1};\n');
  f.watcher.emitSource = emit;
  f.watcher.poll();
  assert.equal(f.read('app/service/first.js'), original);
  assert.equal(f.builds.length, 2);
  f.write('app/service/first.js.map', 'externally changed');
  fs.unlinkSync(path.join(f.root, 'src/service/first.ts'));
  assert.throws(() => f.watcher.poll(), {code: 'OUTPUT_CHANGED'});
  assert.equal(f.builds.length, 2);
  fs.unlinkSync(path.join(f.root, 'app/service/first.js.map'));
  f.watcher.poll();
  assert.equal(f.exists('app/service/first.js'), false);
  assert.equal(f.builds.length, 3);
});

test('failed final callbacks retry, and closing during emission suppresses reload', t => {
  const f = fixture(t);
  const success = f.watcher.callback;
  for (const result of [false, new Error('failed'), Promise.resolve()]) {
    f.watcher.callback = () => result;
    assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CALLBACK'});
  }
  f.watcher.callback = success;
  f.watcher.poll();
  assert.equal(f.builds.length, 1);
  const emit = f.watcher.emitSource;
  f.watcher.emitSource = function(info) { emit.call(this, info); this.close(); };
  f.write('src/service/first.ts', 'export default {value: 2};\n');
  f.watcher.poll();
  assert.equal(f.builds.length, 1);
  f.watcher.emitSource = emit;
  f.watcher.watch();
  assert.equal(f.builds.length, 2);
  f.watcher.close();
});

test('initial semantic failure closes before emit; same watcher can restart', t => {
  const f = fixture(t);
  f.write('src/service/first.ts', 'const value: number = "bad"; export default value;\n');
  assert.throws(() => f.watcher.watch(), {code: 'DEVELOPMENT_TYPECHECK'});
  assert.equal(f.watcher.closed, true);
  assert.equal(f.watcher.timer, null);
  assert.equal(f.exists('app'), false);
  f.write('src/service/first.ts', 'export default {value: 1};\n');
  f.watcher.watch();
  assert.equal(f.builds.length, 1);
  f.watcher.close();
});

test('symlink destinations are refused before any compiler output writes', t => {
  const f = fixture(t);
  f.write('outside.js', 'untouched');
  fs.mkdirSync(path.join(f.root, 'app/service'), {recursive: true});
  fs.symlinkSync(path.join(f.root, 'outside.js'), path.join(f.root, 'app/service/first.js'));
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_OUTPUT'});
  assert.equal(f.read('outside.js'), 'untouched');
  assert.equal(f.exists('app/service/first.js.map'), false);
});


test('noCheck cannot disable semantic validation on newer compilers', t => {
  const f = fixture(t);
  f.config.compilerOptions.noCheck = true;
  f.configure({});
  f.write('src/service/first.ts', 'const value: number = "bad"; export default {value};\n');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
  assert.equal(f.exists('app'), false);
  assert.equal(f.builds.length, 0);
});


test('source edits during checking are retried before emitting the checked snapshot', t => {
  let mutate;
  const compiler = {...ts, getPreEmitDiagnostics(program) {
    const result = ts.getPreEmitDiagnostics(program);
    if (mutate) { const action = mutate; mutate = undefined; action(); }
    return result;
  }};
  const f = fixture(t, compiler);
  mutate = () => f.write('src/service/first.ts', 'export default {value: 2};\n');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CHANGED'});
  assert.equal(f.exists('app'), false);
  assert.equal(f.builds.length, 0);
  f.watcher.poll();
  assert.match(f.read('app/service/first.js'), /value: 2/);
});

test('unsupported project/output settings fail before runtime writes', t => {
  const f = fixture(t);
  const defaults = {...f.config.compilerOptions};
  for (const patch of [{rootDir: '.'}, {outDir: 'other'}, {module: 'esnext'},
    {declaration: true}, {incremental: true}, {composite: true}, {allowJs: true}]) {
    f.config.compilerOptions = {...defaults, ...patch};
    f.configure({});
    assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
    assert.equal(f.exists('app'), false);
  }
  f.config.compilerOptions = defaults;
  f.configure({references: [{path: './other'}]});
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
  delete f.config.references;
  f.configure({});
  f.write('src/loose.json', '{"value":1}');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
  fs.unlinkSync(path.join(f.root, 'src/loose.json'));
  f.watcher.declarations.outDir = 'app/types';
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_CONFIG'});
  assert.equal(f.exists('app'), false);
});

test('timer-driven semantic failures are deduplicated and recover without restarting the watcher', async t => {
  const f = fixture(t);
  const errors = [];
  f.watcher.options.interval = 10;
  f.watcher.options.onError = error => errors.push(error.code);
  const until = async check => {
    const deadline = Date.now() + 10000;
    while (!check()) {
      assert.ok(Date.now() < deadline, 'watcher did not progress');
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  };
  f.watcher.watch();
  f.write('src/service/first.ts', 'const value: number = "bad"; export default {value};\n');
  await until(() => errors.length > 0);
  await new Promise(resolve => setTimeout(resolve, 450));
  assert.deepEqual(errors, ['DEVELOPMENT_TYPECHECK']);
  assert.equal(f.builds.length, 1);
  f.write('src/service/first.ts', 'export default {value: 3};\n');
  await until(() => f.builds.length === 2);
  assert.match(f.read('app/service/first.js'), /value: 3/);
  f.watcher.close();
});

test('warm polls reuse syntax but still perform full semantic checking and emission', t => {
  let checks = 0;
  const f = fixture(t, {...ts, getPreEmitDiagnostics(program) {
    checks++;
    return ts.getPreEmitDiagnostics(program);
  }});
  f.watcher.poll();
  assert.ok(f.watcher.lastCompilerCache.parsed > 1);
  assert.equal(f.watcher.lastCompilerCache.reused, 0);
  const first = f.watcher.compilerSources.get(path.join(f.root, 'src/service/first.ts')).source;
  f.watcher.poll();
  assert.equal(f.watcher.lastCompilerCache.parsed, 0);
  assert.ok(f.watcher.lastCompilerCache.reused > 1);
  assert.equal(checks, 2);
  assert.equal(f.builds.length, 1);
  // Same size and restored mtime must not hide content changes.
  const file = path.join(f.root, 'src/service/first.ts');
  const stat = fs.statSync(file);
  f.write('src/service/first.ts', 'export default {value: 9};\n');
  fs.utimesSync(file, stat.atime, stat.mtime);
  f.watcher.poll();
  assert.equal(f.watcher.lastCompilerCache.parsed, 1);
  assert.notEqual(f.watcher.compilerSources.get(file).source, first);
  assert.match(f.read('app/service/first.js'), /value: 9/);
});

test('warm programs observe changed, missing and restored dependency declarations', t => {
  const f = fixture(t);
  f.write('node_modules/dependency/index.d.ts', 'export const value: number;\n');
  f.write('src/service/first.ts', 'import {value} from "dependency"; const result: number = value; export default result;\n');
  f.watcher.poll();
  const previous = f.read('app/service/first.js');
  f.write('node_modules/dependency/index.d.ts', 'export const value: string;\n');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_TYPECHECK'});
  assert.equal(f.read('app/service/first.js'), previous);
  assert.equal(f.watcher.lastCompilerCache.parsed, 1);
  fs.unlinkSync(path.join(f.root, 'node_modules/dependency/index.d.ts'));
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_TYPECHECK'});
  assert.equal(f.watcher.compilerSources.has(path.join(f.root, 'node_modules/dependency/index.d.ts')), false);
  f.write('node_modules/dependency/index.d.ts', 'export const value: number;\n');
  f.watcher.poll();
  assert.equal(f.read('app/service/first.js'), previous);
});

test('warm resolution sees package metadata changes and previously missing modules', t => {
  const f = fixture(t);
  f.write('node_modules/dependency/package.json', '{"types":"number.d.ts"}');
  f.write('node_modules/dependency/number.d.ts', 'export const value: number;\n');
  f.write('node_modules/dependency/string.d.ts', 'export const value: string;\n');
  f.write('src/service/first.ts', 'import {value} from "dependency"; const result: number = value; export default result;\n');
  f.watcher.poll();
  f.write('node_modules/dependency/package.json', '{"types":"string.d.ts"}');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_TYPECHECK'});
  assert.equal(f.watcher.compilerSources.has(path.join(f.root, 'node_modules/dependency/number.d.ts')), false);
  f.write('node_modules/dependency/package.json', '{"types":"number.d.ts"}');
  f.watcher.poll();
  f.write('src/service/first.ts', 'import {value} from "new-dependency"; export default value;\n');
  assert.throws(() => f.watcher.poll(), {code: 'DEVELOPMENT_TYPECHECK'});
  f.write('node_modules/new-dependency/index.d.ts', 'export const value: number;\n');
  f.watcher.poll();
  assert.match(f.read('app/service/first.js'), /new-dependency/);
});

test('inherited compiler options invalidate every cached syntax tree', t => {
  const f = fixture(t);
  delete f.config.compilerOptions.target;
  f.configure({extends: './base.json'});
  f.write('base.json', '{"compilerOptions":{"target":"es2018"}}');
  f.watcher.poll();
  f.watcher.poll();
  assert.equal(f.watcher.lastCompilerCache.parsed, 0);
  f.write('base.json', '{"compilerOptions":{"target":"es5"}}');
  f.watcher.poll();
  assert.equal(f.watcher.lastCompilerCache.reused, 0);
  assert.match(f.read('app/service/first.js'), /exports.default/);
  assert.equal(f.builds.length, 2);
});

test('renamed sources are evicted and closing releases retained syntax', t => {
  const f = fixture(t);
  f.watcher.poll();
  const count = f.watcher.compilerSources.size;
  fs.renameSync(path.join(f.root, 'src/service/first.ts'), path.join(f.root, 'src/service/renamed.ts'));
  f.watcher.poll();
  assert.equal(f.watcher.compilerSources.size, count);
  assert.equal(f.watcher.compilerSources.has(path.join(f.root, 'src/service/first.ts')), false);
  assert.equal(f.watcher.compilerSources.has(path.join(f.root, 'src/service/renamed.ts')), true);
  f.watcher.close();
  assert.equal(f.watcher.compilerSources.size, 0);
  f.watcher.watch();
  assert.equal(f.watcher.lastCompilerCache.reused, 0);
  f.watcher.close();
});

test('warm and cold programs agree through global merging, deletion and const-enum changes', t => {
  const f = fixture(t);
  const options = {strict: true, skipLibCheck: false, types: [],
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS};
  const files = ['parity/main.ts', 'parity/global.d.ts', 'parity/other.d.ts'];
  f.write(files[0], 'let x: Global = {a: 1}; let y: number = E.X;\n');
  f.write(files[1], 'interface Global {a: number} declare const enum E {X = 1}\n');
  f.write(files[2], 'interface Global {b?: number}\n');
  const compare = () => {
    const roots = files.filter(file => f.exists(file)).map(file => path.join(f.root, file));
    const result = program => {
      const diagnostics = ts.getPreEmitDiagnostics(program).map(item =>
        [item.code, ts.flattenDiagnosticMessageText(item.messageText, '\n')]);
      const output = [];
      program.emit(undefined, (file, text) => output.push([file, text]));
      return {diagnostics, output};
    };
    assert.deepEqual(result(f.watcher.program(roots, options)), result(ts.createProgram(roots, options)));
  };
  compare();
  compare();
  f.write(files[1], 'interface Global {a: string} declare const enum E {X = 2}\n');
  compare();
  f.write(files[2], 'interface Global {b: number}\n');
  compare();
  fs.unlinkSync(path.join(f.root, files[1]));
  compare();
  f.write(files[1], 'interface Global {a: number} declare const enum E {X = 3}\n');
  compare();
  fs.unlinkSync(path.join(f.root, files[2]));
  compare();
  compare();
});
