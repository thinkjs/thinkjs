'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {render, collectPackages, scaffold} = require('../../scripts/typescript-migration/scaffold.cjs');

const temporary = t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-template-test-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  return root;
};

test('checked template renders through the actual CLI generator with explicit scripts and type-only boundaries', async t => {
  const root = temporary(t);
  await render(root);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
  assert.equal(manifest.private, true);
  assert.deepEqual(Object.keys(manifest.scripts), ['prepare-types', 'typecheck', 'dev', 'build', 'start']);
  assert.ok(fs.existsSync(path.join(root, '.gitignore')));
  assert.match(fs.readFileSync(path.join(root, 'src/controller/base.ts'), 'utf8'), /declare service/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'start.cjs'), 'utf8'), /helper|typescript|watcher|checked/);
  const config = JSON.parse(fs.readFileSync(path.join(root, 'tsconfig.json')));
  assert.equal(config.compilerOptions.strict, true);
  assert.ok(config.include.includes('.thinkjs/types/**/*.d.ts'));
  const packages = collectPackages(manifest);
  for (const name of ['thinkjs', 'think-ts-helper', 'think-watcher', 'think-loader']) assert.ok(packages.has(name));
  assert.equal(path.basename(packages.get('think-logger3').location), 'think-logger3');
});

test('scaffolding refuses existing files, directories and dangling symlinks without changing their contents', async t => {
  const root = temporary(t);
  const file = path.join(root, 'kept.txt');
  fs.writeFileSync(file, 'keep');
  await assert.rejects(scaffold(file), {code: 'EEXIST'});
  await assert.rejects(scaffold(root), {code: 'EEXIST'});
  const link = path.join(root, 'dangling');
  fs.symlinkSync(path.join(root, 'missing'), link);
  await assert.rejects(scaffold(link), {code: 'EEXIST'});
  assert.equal(fs.readFileSync(file, 'utf8'), 'keep');
  assert.ok(fs.lstatSync(link).isSymbolicLink());
});

function checkedTemplate(t, options = {}) {
  const vm = require('node:vm');
  const root = temporary(t);
  const module = {exports: {}};
  class Watcher {
    constructor(opts) { this.opts = opts; }
    poll() {
      if (options.failBuild) throw new Error('semantic failure');
      fs.mkdirSync(this.opts.diffPath, {recursive: true});
      fs.writeFileSync(path.join(this.opts.diffPath, 'demo.js'), 'new build');
    }
    close() {}
  }
  const loader = name => {
    if (name === 'node:fs') return {...fs, ...options.fs};
    if (name === 'node:path') return path;
    if (name === 'think-ts-helper/development') return {createWatcher: () => Watcher};
    return {};
  };
  const file = path.resolve(__dirname, '../../templates/typescript-checked/template/scripts/checked.cjs');
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {require: loader, module, process, Buffer});
  return {root, checked: module.exports};
}

test('build/dev lock refuses concurrent commands, releases idempotently and refuses a state symlink', t => {
  const {root, checked} = checkedTemplate(t);
  const release = checked.lock(root);
  assert.throws(() => checked.lock(root), /all are stopped/);
  release(); release();
  checked.lock(root)();
  fs.rmdirSync(path.join(root, '.thinkjs'));
  const outside = path.join(root, 'outside');
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(root, '.thinkjs'));
  assert.throws(() => checked.lock(root), /not a symlink/);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test('checked build protects unowned outputs and preserves the previous app on semantic failure', t => {
  const {root, checked} = checkedTemplate(t);
  checked.build(root);
  const output = path.join(root, 'app/demo.js');
  fs.writeFileSync(output, 'previous');
  const failing = checkedTemplate(t, {failBuild: true}).checked;
  assert.throws(() => failing.build(root), /semantic failure/);
  assert.equal(fs.readFileSync(output, 'utf8'), 'previous');
  fs.unlinkSync(path.join(root, 'app/.thinkjs-checked-output'));
  assert.throws(() => checked.build(root), /ownership marker/);
  assert.equal(fs.readFileSync(output, 'utf8'), 'previous');
  assert.deepEqual(fs.readdirSync(path.join(root, '.thinkjs')), []);
});

test('failed publication rolls back, and failed rollback keeps its backup for manual recovery', t => {
  const {root, checked} = checkedTemplate(t);
  checked.build(root);
  const output = path.join(root, 'app/demo.js');
  fs.writeFileSync(output, 'previous');
  let failRestore = false;
  const faulty = checkedTemplate(t, {fs: {renameSync(from, to) {
    if (to === path.join(root, 'app') && (path.basename(from) === 'app' || failRestore)) throw new Error('rename failure');
    return fs.renameSync(from, to);
  }}}).checked;
  assert.throws(() => faulty.build(root), /rename failure/);
  assert.equal(fs.readFileSync(output, 'utf8'), 'previous');
  failRestore = true;
  assert.throws(() => faulty.build(root), /previous app preserved/);
  const retained = fs.readdirSync(path.join(root, '.thinkjs'));
  assert.equal(retained.length, 1);
  assert.equal(fs.readFileSync(path.join(root, '.thinkjs', retained[0], 'previous/demo.js'), 'utf8'), 'previous');
});

test('SIGTERM during the actual dev entrypoint initial synchronous build releases its lock', async t => {
  const {spawn} = require('node:child_process');
  const {once} = require('node:events');
  const root = temporary(t);
  const template = path.resolve(__dirname, '../../templates/typescript-checked/template');
  const program = `
    const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
    const root = ${JSON.stringify(root)};
    const template = ${JSON.stringify(template)};
    const lock = path.join(root, 'locked');
    const checked = {
      lock() { fs.writeFileSync(lock, 'locked'); return () => fs.rmSync(lock, {force: true}); },
      build() { process.send('building'); const until = Date.now() + 500; while (Date.now() < until) {} },
      Watcher: class {}
    };
    const load = name => name === 'thinkjs' ? class {run() { setInterval(() => {}, 1000); }} :
      name === './scripts/checked.cjs' ? checked :
      name === './scripts/lifecycle.cjs' ? require(path.join(template, 'scripts/lifecycle.cjs')) : require(name);
    vm.runInNewContext(fs.readFileSync(path.join(template, 'dev.cjs'), 'utf8'),
      {require: load, process, __dirname: root, console});
  `;
  const child = spawn(process.execPath, ['-e', program], {stdio: ['ignore', 'pipe', 'pipe', 'ipc']});
  t.after(() => { if (child.exitCode === null) child.kill('SIGKILL'); });
  const exited = once(child, 'exit', {signal: AbortSignal.timeout(5000)});
  await once(child, 'message', {signal: AbortSignal.timeout(5000)});
  child.kill('SIGTERM');
  const [code, signal] = await exited;
  assert.equal(signal, null);
  assert.ok(code === 0 || code === 143);
  assert.equal(fs.existsSync(path.join(root, 'locked')), false);
});
