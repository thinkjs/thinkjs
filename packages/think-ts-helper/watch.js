'use strict';

const {EventEmitter} = require('node:events');
const fs = require('node:fs');
const path = require('node:path');

// One writer per output within this process. Other processes must still be
// coordinated by the caller, just as with standalone generate().
const active = new Map();

function assertAvailable(output, owner) {
  let current;
  try { current = fs.statSync(output); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const [target, session] of active) {
    if (session === owner) continue;
    let other;
    if (current) {
      try { other = fs.statSync(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    // The lexical reservation is stable across creation/deletion. Physical
    // identity catches case aliases without guessing a volume's case policy.
    if (target === output || (current && other && current.dev === other.dev && current.ino === other.ino)) {
      throw Object.assign(new Error(`WATCH_ACTIVE: already watching ${output}`), {code: 'WATCH_ACTIVE'});
    }
  }
}

function watch(options = {}) {
  if (options.check) throw new Error('watch cannot be combined with check');
  const interval = options.interval === undefined ? 500 : options.interval;
  if (!Number.isInteger(interval) || interval < 10 || interval > 2147483647) {
    throw new Error('watch interval must be an integer from 10 to 2147483647 milliseconds');
  }
  // Resolve once: process.chdir() or later caller mutation must not retarget a
  // running watcher. Generator flags remain fixed for this watch session.
  options = {...options, root: path.resolve(options.root || process.cwd())};
  const output = path.resolve(options.root, options.outDir || '.thinkjs/types');
  const owner = {};
  assertAvailable(output);
  active.set(output, owner);

  const watcher = new EventEmitter();
  let timer;
  let closed = false;
  let initialized = false;
  let failure;
  let warnings = '';
  let resolveReady;
  let rejectReady;
  watcher.ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  // Event-only consumers may listen to ready/diagnostic instead. Awaiting the
  // original promise still rejects on initial failure or early close.
  watcher.ready.catch(() => {});
  Object.defineProperty(watcher, 'closed', {get: () => closed});
  watcher.close = () => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    active.delete(output);
    if (!initialized) rejectReady(Object.assign(new Error('Watch closed before ready'), {code: 'WATCH_CLOSED'}));
    watcher.emit('close');
  };

  function tick() {
    if (closed) return;
    let result;
    let error;
    try {
      // Deliberately reuse the full generator: no mtime-only cache, missed
      // directory deletes, or stale parser/config dependencies. Synchronous
      // generation plus a single completion-scheduled timer serializes work.
      // An alias may have had no output directory when it was registered.
      // Recheck before writing now that another session may have created it.
      assertAvailable(output, owner);
      result = require('./index').generate(options);
    } catch (caught) {
      error = caught;
    }
    if (error) {
      const key = `${error.code || 'GENERATION_FAILED'}: ${error.message}`;
      if (!initialized) rejectReady(error);
      if (failure !== key) {
        failure = key;
        watcher.emit('diagnostic', {severity: 'error', code: error.code || 'GENERATION_FAILED', message: error.message});
      }
      // A failed initial generation must not start the app on old types.
      if (!initialized) watcher.close();
    } else {
      const recovered = failure !== undefined;
      failure = undefined;
      const nextWarnings = JSON.stringify(result.diagnostics);
      if (nextWarnings !== warnings) {
        warnings = nextWarnings;
        for (const diagnostic of result.diagnostics) {
          if (closed) break;
          watcher.emit('diagnostic', {...diagnostic, severity: 'warning'});
        }
      }
      if (!closed && !initialized) {
        initialized = true;
        resolveReady(result);
        watcher.emit('ready', result);
      } else if (!closed && (result.changed.length || recovered)) {
        watcher.emit('update', {...result, recovered});
      }
    }
    if (!closed) timer = setTimeout(tick, interval);
  }
  // Give callers time to attach listeners and await readiness before work.
  timer = setTimeout(tick, 0);
  return watcher;
}

module.exports = {watch};
