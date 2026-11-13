'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const TrackedWatcher = require('../tracked');

function fixture(t, options = {}, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-tracked-watch-'));
  const srcPath = path.join(root, 'src');
  const diffPath = path.join(root, 'app');
  fs.mkdirSync(srcPath); fs.mkdirSync(diffPath);
  const events = [];
  const write = (file, content = 'source') => {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
  };
  const watcher = new TrackedWatcher({srcPath, diffPath, ...options}, info => {
    events.push(info);
    if (callback) return callback(info, {srcPath, diffPath, write});
    if (info.event === 'unlink') return;
    const output = info.file.replace(/\.[^.]+$/, '.js');
    write(path.join(diffPath, output), fs.readFileSync(path.join(info.path, info.file)));
    write(path.join(diffPath, output + '.map'), '{}');
    info.onEmit([output, output + '.map']);
  });
  t.after(() => { watcher.close(); fs.rmSync(root, {recursive: true, force: true}); });
  return {root, srcPath, diffPath, events, watcher, write};
}

const waitFor = async predicate => {
  for (let count = 0; count < 200; count++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error('Timed out waiting for watcher');
};

test('tracks emitted JS and maps, removes before unlink, preserves unknown files', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'nested/service.ts'));
  f.write(path.join(f.diffPath, 'unowned.js'), 'keep');
  f.watcher.poll();
  assert.equal(f.events.length, 1);
  f.watcher.poll();
  assert.equal(f.events.length, 1);
  fs.rmSync(path.join(f.srcPath, 'nested'), {recursive: true});
  f.watcher.cb = info => {
    assert.equal(info.event, 'unlink');
    assert.equal(fs.existsSync(path.join(f.diffPath, 'nested/service.js')), false);
    assert.equal(fs.existsSync(path.join(f.diffPath, 'nested/service.js.map')), false);
  };
  f.watcher.poll();
  assert.equal(fs.readFileSync(path.join(f.diffPath, 'unowned.js'), 'utf8'), 'keep');
  assert.equal(f.watcher.outputs.size, 0);
});

test('rename removes previous output and reports old deletion before new change', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'old.ts'));
  f.watcher.poll();
  fs.renameSync(path.join(f.srcPath, 'old.ts'), path.join(f.srcPath, 'new.ts'));
  f.watcher.poll();
  assert.deepEqual(f.events.map(info => [info.event, info.file]), [['change', 'old.ts'], ['unlink', 'old.ts'], ['change', 'new.ts']]);
  assert.equal(fs.existsSync(path.join(f.diffPath, 'old.js.map')), false);
  assert.equal(fs.existsSync(path.join(f.diffPath, 'new.js')), true);
});

test('content scanning notices preserved and decreased mtimes, ignores declaration inputs', t => {
  const f = fixture(t);
  const source = path.join(f.srcPath, 'service.ts');
  f.write(source, 'one'); f.write(path.join(f.srcPath, 'types.d.ts'), 'declaration');
  f.watcher.poll();
  f.write(source, 'two'); fs.utimesSync(source, new Date(0), new Date(0));
  f.watcher.poll();
  assert.equal(f.events.length, 2);
  assert.equal(fs.readFileSync(path.join(f.diffPath, 'service.js'), 'utf8'), 'two');
});

test('preflights whole deletion group and recovers after externally modified output is removed', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts')); f.watcher.poll();
  fs.unlinkSync(path.join(f.srcPath, 'a.ts'));
  f.write(path.join(f.diffPath, 'a.js.map'), 'user map');
  assert.throws(() => f.watcher.poll(), {code: 'OUTPUT_CHANGED'});
  assert.equal(fs.existsSync(path.join(f.diffPath, 'a.js')), true);
  assert.equal(f.events.length, 1);
  fs.unlinkSync(path.join(f.diffPath, 'a.js.map'));
  f.watcher.poll();
  assert.equal(f.events.at(-1).event, 'unlink');
  assert.equal(fs.existsSync(path.join(f.diffPath, 'a.js')), false);
});

test('same-byte output replacement is not silently deleted', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts')); f.watcher.poll();
  const output = path.join(f.diffPath, 'a.js');
  f.write(output + '.tmp', fs.readFileSync(output));
  fs.renameSync(output + '.tmp', output);
  fs.unlinkSync(path.join(f.srcPath, 'a.ts'));
  assert.throws(() => f.watcher.poll(), {code: 'OUTPUT_CHANGED'});
});

test('symlinked output directory and output file cannot redirect cleanup', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'nested/a.ts')); f.watcher.poll();
  fs.unlinkSync(path.join(f.srcPath, 'nested/a.ts'));
  const nested = path.join(f.diffPath, 'nested');
  const outside = path.join(f.root, 'outside');
  fs.renameSync(nested, outside);
  fs.symlinkSync(outside, nested, 'dir');
  assert.throws(() => f.watcher.poll(), {code: 'UNSAFE_OUTPUT_PATH'});
  assert.ok(fs.existsSync(path.join(outside, 'a.js')));
  fs.unlinkSync(nested); fs.renameSync(outside, nested);
  fs.renameSync(path.join(nested, 'a.js'), path.join(f.root, 'outside.js'));
  fs.symlinkSync(path.join(f.root, 'outside.js'), path.join(nested, 'a.js'));
  assert.throws(() => f.watcher.poll(), {code: 'UNSAFE_OUTPUT_PATH'});
  assert.ok(fs.existsSync(path.join(f.root, 'outside.js')));
});

test('missing or symlinked source root is a failure rather than mass cleanup', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts')); f.watcher.poll();
  const moved = path.join(f.root, 'moved');
  fs.renameSync(f.srcPath, moved);
  assert.throws(() => f.watcher.poll(), {code: 'ENOENT'});
  fs.symlinkSync(moved, f.srcPath, 'dir');
  assert.throws(() => f.watcher.poll(), {code: 'UNSAFE_OUTPUT_PATH'});
  assert.ok(fs.existsSync(path.join(f.diffPath, 'a.js')));
});

test('reports cannot traverse, target directories, or claim another source output', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts')); f.watcher.poll();
  const info = {path: f.srcPath, file: 'b.ts'};
  assert.throws(() => f.watcher.trackOutputs(info, ['../outside.js']), {code: 'INVALID_OUTPUT_PATH'});
  assert.throws(() => f.watcher.trackOutputs(info, [path.join(f.root, 'outside.js')]), {code: 'INVALID_OUTPUT_PATH'});
  assert.throws(() => f.watcher.trackOutputs(info, ['a.js']), {code: 'OUTPUT_COLLISION'});
  fs.mkdirSync(path.join(f.diffPath, 'directory.js'));
  assert.throws(() => f.watcher.trackOutputs(info, ['directory.js']), {code: 'UNSAFE_OUTPUT_PATH'});
  assert.throws(() => f.watcher.trackOutputs({path: f.srcPath, file: '../a.ts'}, []), {code: 'INVALID_OUTPUT_PATH'});
});

test('updated emit report removes previous map but only if it is still owned', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts')); f.watcher.poll();
  const info = {path: f.srcPath, file: 'a.ts'};
  f.write(path.join(f.diffPath, 'a.js.map'), 'edited');
  assert.throws(() => f.watcher.trackOutputs(info, ['a.js']), {code: 'OUTPUT_CHANGED'});
  f.write(path.join(f.diffPath, 'a.js.map'), '{}');
  f.watcher.trackOutputs(info, ['a.js']);
  assert.equal(fs.existsSync(path.join(f.diffPath, 'a.js.map')), false);
});

test('new watcher does not adopt or delete an old session output', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts')); f.watcher.poll();
  fs.unlinkSync(path.join(f.srcPath, 'a.ts'));
  f.watcher.close();
  const second = new TrackedWatcher({srcPath: f.srcPath, diffPath: f.diffPath}, () => {});
  second.poll(); second.close();
  assert.ok(fs.existsSync(path.join(f.diffPath, 'a.js')));
});

test('failed synchronous callback is retried without source edits', t => {
  let fails = true;
  const f = fixture(t, {}, () => fails ? false : undefined);
  f.write(path.join(f.srcPath, 'a.ts'));
  assert.throws(() => f.watcher.poll(), {code: 'CALLBACK_FAILED'});
  fails = false; f.watcher.poll();
  assert.equal(f.events.length, 2);
  f.watcher.poll(); assert.equal(f.events.length, 2);
});

test('initial failure leaves no timer; promise callbacks are rejected', t => {
  const f = fixture(t, {}, () => Promise.resolve());
  f.write(path.join(f.srcPath, 'a.ts'));
  assert.throws(() => f.watcher.watch(), {code: 'CALLBACK_FAILED'});
  assert.equal(f.watcher.running, false);
  assert.equal(f.watcher.timer, null);
});

test('watch is idempotent, later failures recover, and close cancels polling', async t => {
  const diagnostics = [];
  const f = fixture(t, {interval: 10, onError: error => diagnostics.push(error)});
  f.write(path.join(f.srcPath, 'a.ts'));
  f.watcher.watch(); const timer = f.watcher.timer;
  f.watcher.watch(); assert.equal(f.watcher.timer, timer);
  f.write(path.join(f.diffPath, 'a.js.map'), 'edited');
  fs.unlinkSync(path.join(f.srcPath, 'a.ts'));
  await waitFor(() => diagnostics.length === 1);
  await new Promise(resolve => setTimeout(resolve, 40));
  assert.equal(diagnostics.length, 1);
  fs.unlinkSync(path.join(f.diffPath, 'a.js.map'));
  await waitFor(() => f.events.length === 2);
  f.watcher.close(); f.watcher.close();
  f.write(path.join(f.srcPath, 'b.ts'));
  await new Promise(resolve => setTimeout(resolve, 40));
  assert.equal(f.events.length, 2);
  assert.equal(f.watcher.timer, null);
});

test('close from initial callback does not leave a timer', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts'));
  f.watcher.cb = () => f.watcher.close();
  f.watcher.watch();
  assert.equal(f.watcher.timer, null);
  assert.equal(f.watcher.running, false);
});

test('overlapping source/output directories and invalid intervals are refused', t => {
  const f = fixture(t);
  assert.throws(() => new TrackedWatcher({srcPath: f.srcPath, diffPath: path.join(f.srcPath, 'app')}, () => {}), {code: 'UNSAFE_OUTPUT_PATH'});
  assert.throws(() => new TrackedWatcher({srcPath: f.srcPath, diffPath: f.root}, () => {}), {code: 'UNSAFE_OUTPUT_PATH'});
  assert.throws(() => new TrackedWatcher({srcPath: f.srcPath, diffPath: f.diffPath, interval: -1}, () => {}), /interval/);
});

test('rejects cross-root overlap and nested source roots', t => {
  const f = fixture(t);
  const other = path.join(f.root, 'other'); fs.mkdirSync(other);
  assert.throws(() => new TrackedWatcher({srcPath: [f.srcPath, f.diffPath], diffPath: [f.diffPath, other]}, () => {}), {code: 'UNSAFE_OUTPUT_PATH'});
  const child = path.join(f.srcPath, 'child'); fs.mkdirSync(child);
  assert.throws(() => new TrackedWatcher({srcPath: [f.srcPath, child], diffPath: [f.diffPath, other]}, () => {}), {code: 'UNSAFE_OUTPUT_PATH'});
});

test('failed first emit remains owned if its source disappears before retry', t => {
  const f = fixture(t, {}, (info, {write, diffPath}) => {
    if (info.event === 'unlink') return;
    write(path.join(diffPath, 'a.js'));
    info.onEmit(['a.js']);
    return false;
  });
  f.write(path.join(f.srcPath, 'a.ts'));
  assert.throws(() => f.watcher.poll(), {code: 'CALLBACK_FAILED'});
  fs.unlinkSync(path.join(f.srcPath, 'a.ts'));
  f.watcher.poll();
  assert.equal(fs.existsSync(path.join(f.diffPath, 'a.js')), false);
  assert.equal(f.watcher.outputs.size, 0);
});

test('unlink error and promise callback results retain pending deletion for retry', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts')); f.watcher.poll();
  fs.unlinkSync(path.join(f.srcPath, 'a.ts'));
  f.watcher.cb = () => new Error('failed');
  assert.throws(() => f.watcher.poll(), {code: 'CALLBACK_FAILED'});
  f.watcher.cb = () => Promise.reject(new Error('async is unsupported'));
  assert.throws(() => f.watcher.poll(), {code: 'CALLBACK_FAILED'});
  f.watcher.cb = () => {};
  f.watcher.poll();
  assert.equal(f.watcher.sources.size, 0);
});

test('late emit reports fail and restarting the same watcher retains ownership', t => {
  const f = fixture(t);
  f.write(path.join(f.srcPath, 'a.ts')); f.watcher.watch();
  const onEmit = f.events[0].onEmit;
  assert.throws(() => onEmit(['a.js']), {code: 'LATE_EMIT'});
  f.watcher.close();
  fs.unlinkSync(path.join(f.srcPath, 'a.ts'));
  f.watcher.watch();
  assert.equal(fs.existsSync(path.join(f.diffPath, 'a.js')), false);
  assert.equal(f.events.at(-1).event, 'unlink');
});

test('reverting to last successful source still retries a pending failed emit', t => {
  let fail = false;
  const f = fixture(t, {}, (info, {write, diffPath}) => {
    if (info.event === 'unlink') return;
    write(path.join(diffPath, 'a.js'), fs.readFileSync(path.join(info.path, info.file)));
    info.onEmit(['a.js']);
    return !fail;
  });
  const source = path.join(f.srcPath, 'a.ts');
  f.write(source, 'A'); f.watcher.poll();
  fail = true; f.write(source, 'B');
  assert.throws(() => f.watcher.poll(), {code: 'CALLBACK_FAILED'});
  fail = false; f.write(source, 'A'); f.watcher.poll();
  assert.equal(fs.readFileSync(path.join(f.diffPath, 'a.js'), 'utf8'), 'A');
  assert.equal(f.watcher.pending.size, 0);
});

test('tracked entry does not expose legacy unowned output cleanup methods', t => {
  const f = fixture(t);
  assert.equal(f.watcher.removeDeletedFiles, undefined);
  assert.equal(f.watcher.getChangedFiles, undefined);
});
