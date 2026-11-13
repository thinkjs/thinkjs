'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawn, spawnSync} = require('node:child_process');
const {setTimeout: delay} = require('node:timers/promises');
const vm = require('node:vm');
const {generate, watch} = require('..');
const cli = path.resolve(__dirname, '../cli.js');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-ts-watch-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const write = (file, value = 'export default class Service {}\n') => {
    fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    fs.writeFileSync(path.join(root, file), value);
  };
  write('src/service/first.ts');
  return {root, write, read: file => fs.readFileSync(path.join(root, file), 'utf8')};
}

async function until(condition) {
  const deadline = Date.now() + 8000;
  while (!condition()) {
    if (Date.now() >= deadline) assert.fail('Timed out waiting for watch result');
    await delay(10);
  }
}

function start(t, options) {
  const watcher = watch({interval: 20, ...options});
  const updates = [];
  const diagnostics = [];
  watcher.on('update', result => updates.push(result));
  watcher.on('diagnostic', diagnostic => diagnostics.push(diagnostic));
  t.after(() => watcher.close());
  return {watcher, updates, diagnostics};
}

test('ready is asynchronous and stable polls do not rewrite or emit updates', async t => {
  const {root, write, read} = fixture(t);
  write('src/service/first.ts', 'export default class Service {}\n'.padEnd(100, ' '));
  const {watcher, updates} = start(t, {root});
  let readyCount = 0;
  watcher.on('ready', () => readyCount++);
  assert.equal(readyCount, 0);
  const first = await watcher.ready;
  assert.equal(readyCount, 1);
  assert.deepEqual(first.changed, ['service.d.ts', 'index.d.ts', 'manifest.json']);
  const output = path.join(root, '.thinkjs/types/service.d.ts');
  const mtime = fs.statSync(output).mtimeMs;
  await delay(100);
  assert.equal(fs.statSync(output).mtimeMs, mtime);
  assert.equal(updates.length, 0);
  // Same-size content and restored timestamp still invalidate parsing.
  const source = path.join(root, 'src/service/first.ts');
  const stat = fs.statSync(source);
  write('src/service/first.ts', 'class Service {} export = Service;\n'.padEnd(100, ' '));
  fs.utimesSync(source, stat.atime, stat.mtime);
  await until(() => updates.length === 1);
  assert.doesNotMatch(read('.thinkjs/types/service.d.ts'), /\.default/);
  assert.equal(readyCount, 1);
});

test('coalesces bursts and tracks nested additions, directory rename and delete', async t => {
  const {root, write, read} = fixture(t);
  const {watcher, updates} = start(t, {root});
  await watcher.ready;
  write('.thinkjs/types/user.d.ts', '// user');
  write('app/service/first.js', '// build-owned JS is not the helper\'s output');
  write('src/service/nested/new.ts');
  write('src/service/temporary.ts');
  fs.unlinkSync(path.join(root, 'src/service/temporary.ts'));
  fs.renameSync(path.join(root, 'src/service/nested'), path.join(root, 'src/service/renamed'));
  fs.unlinkSync(path.join(root, 'src/service/first.ts'));
  await until(() => updates.length > 0);
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0].manifest.modules.__single__, {'renamed/new': 'src/service/renamed/new.ts'});
  fs.rmSync(path.join(root, 'src/service/renamed'), {recursive: true});
  await until(() => updates.length === 2);
  assert.deepEqual(updates[1].manifest.modules.__single__, {});
  assert.equal(read('.thinkjs/types/user.d.ts'), '// user');
  assert.match(read('app/service/first.js'), /build-owned JS/);
  assert.equal(fs.readdirSync(path.join(root, '.thinkjs/types')).some(name => name.endsWith('.tmp')), false);
});

test('later diagnostics are deduplicated, preserve output and recover even without byte changes', async t => {
  const {root, write, read} = fixture(t);
  const {watcher, updates, diagnostics} = start(t, {root});
  await watcher.ready;
  const before = read('.thinkjs/types/service.d.ts');
  write('src/service/first.js', 'module.exports = {};');
  await until(() => diagnostics.length > 0);
  await delay(100);
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].code, 'SERVICE_COLLISION');
  assert.equal(diagnostics[0].severity, 'error');
  assert.equal(updates.length, 0);
  assert.equal(read('.thinkjs/types/service.d.ts'), before);
  fs.unlinkSync(path.join(root, 'src/service/first.js'));
  await until(() => updates.length === 1);
  assert.equal(updates[0].recovered, true);
  assert.deepEqual(updates[0].changed, []);
  write('src/service/first.js', 'module.exports = {};');
  await until(() => diagnostics.length === 2);
});

test('source root removal recovers after recreation and updates layout', async t => {
  const {root, write} = fixture(t);
  const {watcher, updates, diagnostics} = start(t, {root});
  await watcher.ready;
  fs.rmSync(path.join(root, 'src'), {recursive: true});
  await until(() => diagnostics.length === 1);
  assert.equal(diagnostics[0].code, 'SOURCE_NOT_FOUND');
  write('src/common/config/config.ts', 'export = {};');
  write('src/common/service/shared.ts');
  write('src/home/service/local.ts');
  await until(() => updates.length === 1);
  assert.equal(updates[0].manifest.layout, 'multi');
  assert.deepEqual(Object.keys(updates[0].manifest.modules.home), ['local', 'shared']);
});

test('watch keeps Model, Config and Controller options and deduplicates override warnings', async t => {
  const {root, write, read} = fixture(t);
  fs.mkdirSync(path.join(root, 'node_modules'));
  fs.symlinkSync(path.resolve(__dirname, '../../thinkjs'), path.join(root, 'node_modules/thinkjs'), 'dir');
  write('src/model/item.ts');
  write('src/config/config.ts', 'export const label = "first";');
  write('src/config/extend.ts', 'export default {controller: {label: "base"}};');
  write('src/extend/controller.ts', 'export default {label: "own"};');
  const {watcher, updates, diagnostics} = start(t, {root, models: true, configs: true, controllerExtends: true});
  await watcher.ready;
  await delay(80);
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].code, 'CONTROLLER_EXTEND_OVERRIDE');
  assert.equal(diagnostics[0].severity, 'warning');
  fs.renameSync(path.join(root, 'src/model/item.ts'), path.join(root, 'src/model/renamed.ts'));
  write('src/config/config.ts', 'export const changed = "next";');
  write('src/extend/controller.ts', 'export default {label: "own", added: true};');
  await until(() => updates.length === 1);
  assert.deepEqual(Object.keys(updates[0].manifest.models.__single__), ['renamed']);
  assert.match(read('.thinkjs/types/config.d.ts'), /changed/);
  assert.doesNotMatch(read('.thinkjs/types/config.d.ts'), /"label"/);
  assert.deepEqual(updates[0].manifest.controllerExtends.members, ['added', 'label']);
  assert.equal(diagnostics.length, 1);
});

test('initial failure rejects readiness and closes without accepting stale output', async t => {
  const {root, write, read} = fixture(t);
  generate({root});
  const before = read('.thinkjs/types/service.d.ts');
  write('src/service/first.js', 'module.exports = {};');
  const {watcher, diagnostics} = start(t, {root});
  let ready = false;
  watcher.on('ready', () => { ready = true; });
  await assert.rejects(watcher.ready, {code: 'SERVICE_COLLISION'});
  assert.equal(watcher.closed, true);
  assert.equal(ready, false);
  assert.equal(diagnostics.length, 1);
  assert.equal(read('.thinkjs/types/service.d.ts'), before);
});

test('initial watch removes only previous opt-in declarations owned by the helper', async t => {
  const {root, write, read} = fixture(t);
  write('src/model/custom.ts');
  generate({root, models: true});
  write('.thinkjs/types/user.d.ts', '// user');
  const {watcher} = start(t, {root});
  const result = await watcher.ready;
  assert.deepEqual(result.removed, ['model.d.ts']);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/model.d.ts')), false);
  assert.equal(read('.thinkjs/types/user.d.ts'), '// user');
  watcher.close();
  generate({root, models: true});
  write('.thinkjs/types/model.d.ts', '// user replacement');
  const next = start(t, {root});
  await assert.rejects(next.watcher.ready, {code: 'UNOWNED_OUTPUT'});
  assert.equal(read('.thinkjs/types/model.d.ts'), '// user replacement');
});

test('a symlink introduced during watch is diagnosed without following it', async t => {
  const {root} = fixture(t);
  const {watcher, updates, diagnostics} = start(t, {root});
  await watcher.ready;
  const link = path.join(root, 'src/service/link.ts');
  fs.symlinkSync(path.join(root, 'src/service/first.ts'), link);
  await until(() => diagnostics.length === 1);
  assert.equal(diagnostics[0].code, 'UNSUPPORTED_SYMLINK');
  assert.equal(updates.length, 0);
  fs.unlinkSync(link);
  await until(() => updates.length === 1);
  assert.equal(updates[0].recovered, true);
});

test('close is idempotent, cancels first generation and releases the output reservation', async t => {
  const {root, write} = fixture(t);
  const {watcher} = start(t, {root});
  assert.throws(() => watch({root}), /WATCH_ACTIVE/);
  let closes = 0;
  watcher.on('close', () => closes++);
  watcher.close();
  watcher.close();
  await assert.rejects(watcher.ready, {code: 'WATCH_CLOSED'});
  assert.equal(closes, 1);
  await delay(50);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs')), false);
  const next = start(t, {root});
  await next.watcher.ready;
  next.watcher.on('update', () => next.watcher.close());
  write('src/service/second.ts');
  await until(() => next.watcher.closed);
  write('src/service/third.ts');
  await delay(100);
  assert.equal(next.updates.length, 1);
});

test('copies caller options and rejects invalid watch/check combinations', async t => {
  const {root} = fixture(t);
  const options = {root, interval: 20};
  const watcher = watch(options);
  t.after(() => watcher.close());
  options.root = path.join(root, 'missing');
  assert.equal((await watcher.ready).root, root);
  for (const interval of [0, -1, 1.5, 2147483648, '20', NaN]) {
    assert.throws(() => watch({root, interval}), /interval must/);
  }
  assert.throws(() => watch({root, check: true}), /combined with check/);
});

test('reserves aliases of an output on a case-insensitive filesystem', async t => {
  const {root} = fixture(t);
  const alternate = path.join(path.dirname(root), path.basename(root).toUpperCase());
  if (!fs.existsSync(alternate) || fs.statSync(root).ino !== fs.statSync(alternate).ino) {
    t.skip('The test volume is case-sensitive');
    return;
  }
  const {watcher} = start(t, {root});
  const duplicate = start(t, {root: alternate, outDir: '.THINKJS/TYPES'});
  await watcher.ready;
  await assert.rejects(duplicate.watcher.ready, {code: 'WATCH_ACTIVE'});
  assert.throws(() => watch({root: alternate, outDir: '.THINKJS/TYPES'}), /WATCH_ACTIVE/);
});

test('output reservation remains stable before and after creation across mount case policies', async () => {
  const canonical = '/mnt/Volume/.thinkjs/types';
  let exists = false;
  let writes = 0;
  const timers = [];
  const scope = {
    module: {exports: {}},
    setTimeout(fn) {
      const timer = {fn, cancelled: false};
      timers.push(timer);
      return timer;
    },
    clearTimeout(timer) { if (timer) timer.cancelled = true; },
    require(name) {
      if (name === 'node:path') return path.posix;
      if (name === 'node:fs') return {
        statSync(file) {
          if (exists && file.toLowerCase() === canonical.toLowerCase()) return {dev: 2, ino: 123};
          throw Object.assign(new Error(file), {code: 'ENOENT'});
        }
      };
      if (name === './index') return {
        generate() {
          exists = true;
          writes++;
          return {changed: ['service.d.ts'], diagnostics: []};
        }
      };
      return require(name);
    }
  };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../watch.js'), 'utf8'), scope);
  const first = scope.module.exports.watch({root: '/mnt/Volume'});
  const alias = {root: '/mnt/Volume', outDir: '.THINKJS/TYPES'};
  const second = scope.module.exports.watch(alias);
  timers.shift().fn();
  await first.ready;
  assert.throws(() => scope.module.exports.watch({root: '/mnt/Volume'}), {code: 'WATCH_ACTIVE'});
  timers.shift().fn();
  await assert.rejects(second.ready, {code: 'WATCH_ACTIVE'});
  assert.equal(second.closed, true);
  assert.equal(first.closed, false);
  assert.equal(writes, 1);
  assert.throws(() => scope.module.exports.watch(alias), {code: 'WATCH_ACTIVE'});
  first.close();
  const replacement = scope.module.exports.watch(alias);
  replacement.close();
  assert.ok(timers.every(timer => timer.cancelled));
});

function child(t, root, args = []) {
  const process = spawn(global.process.execPath, [cli, 'watch', root, '--interval', '20', ...args], {stdio: ['ignore', 'pipe', 'pipe']});
  const state = {stdout: '', stderr: '', exit: undefined};
  process.stdout.on('data', data => { state.stdout += data; });
  process.stderr.on('data', data => { state.stderr += data; });
  process.on('exit', (code, signal) => { state.exit = {code, signal}; });
  t.after(() => { if (state.exit === undefined) process.kill('SIGKILL'); });
  return {process, state};
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  test(`CLI watch reports readiness once, recovers and exits cleanly on ${signal}`, async t => {
    const {root, write} = fixture(t);
    const {process, state} = child(t, root);
    await until(() => state.stdout.includes('ready:'));
    write('src/service/first.js', 'module.exports = {};');
    await until(() => state.stderr.includes('SERVICE_COLLISION'));
    fs.unlinkSync(path.join(root, 'src/service/first.js'));
    await until(() => state.stdout.includes('update: up to date'));
    write('src/service/new.ts');
    await until(() => state.stdout.includes('update: service.d.ts'));
    assert.equal(state.stdout.match(/ready:/g).length, 1);
    process.kill(signal);
    await until(() => state.exit !== undefined);
    assert.deepEqual(state.exit, {code: 0, signal: null});
  });
}

test('CLI stops nonzero on initial failure, and on a signal while later errors remain', async t => {
  const {root, write} = fixture(t);
  write('src/service/first.js', 'module.exports = {};');
  const initial = child(t, root);
  await until(() => initial.state.exit !== undefined);
  assert.equal(initial.state.exit.code, 1);
  assert.equal(initial.state.stdout, '');
  assert.match(initial.state.stderr, /SERVICE_COLLISION/);
  fs.unlinkSync(path.join(root, 'src/service/first.js'));
  const later = child(t, root);
  await until(() => later.state.stdout.includes('ready:'));
  write('src/service/first.js', 'module.exports = {};');
  await until(() => later.state.stderr.includes('SERVICE_COLLISION'));
  later.process.kill('SIGTERM');
  await until(() => later.state.exit !== undefined);
  assert.equal(later.state.exit.code, 1);
});

test('CLI validates interval syntax and rejects the flag on other commands', t => {
  const {root} = fixture(t);
  for (const args of [['watch', '--interval'], ['watch', '--interval', '-1'], ['watch', '--interval', '1.5'], ['generate', '--interval', '20'], ['check', '--interval', '20']]) {
    const result = spawnSync(process.execPath, [cli, ...args, root], {encoding: 'utf8', timeout: 5000});
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /interval/);
  }
});
