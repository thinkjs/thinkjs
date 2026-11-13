'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Watcher = require('./index');

function failure(code, message) {
  return Object.assign(new Error(message), {code});
}

function relativeFile(file) {
  if (typeof file !== 'string' || !file || path.isAbsolute(file) ||
      file.split(/[\\/]/).some(part => !part || part === '.' || part === '..')) {
    throw failure('INVALID_OUTPUT_PATH', `Expected a relative file path: ${file}`);
  }
  return file;
}

// Check each component, not just realpath containment: a replaced symlink or
// directory must never redirect cleanup into a different tree.
function inspect(file, missing = false) {
  const absolute = path.resolve(file);
  const parsed = path.parse(absolute);
  let current = parsed.root;
  let stat;
  for (const part of absolute.slice(parsed.root.length).split(path.sep)) {
    current = path.join(current, part);
    try { stat = fs.lstatSync(current); } catch (error) {
      if (missing && error.code === 'ENOENT') return null;
      throw error;
    }
    if (stat.isSymbolicLink()) throw failure('UNSAFE_OUTPUT_PATH', `Symlink in tracked path: ${current}`);
    if (current !== absolute && !stat.isDirectory()) throw failure('UNSAFE_OUTPUT_PATH', `Not a directory: ${current}`);
  }
  return stat;
}

function fingerprint(file) {
  const stat = inspect(file);
  if (!stat.isFile()) throw failure('UNSAFE_OUTPUT_PATH', `Not a regular file: ${file}`);
  return {dev: stat.dev, ino: stat.ino, hash: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')};
}

function canonical(file) {
  if (fs.existsSync(file)) return fs.realpathSync(file);
  return path.join(canonical(path.dirname(file)), path.basename(file));
}

function checkResult(result, source) {
  if (result && typeof result.then === 'function') {
    // A rejected unsupported async callback must not become an unhandled rejection.
    Promise.resolve(result).catch(() => {});
    throw failure('CALLBACK_FAILED', `Tracked watcher requires a synchronous callback: ${source}`);
  }
  if (result === false || result instanceof Error) {
    throw failure('CALLBACK_FAILED', `Tracked watcher callback failed: ${source}`);
  }
}

function contains(root, file) {
  const relative = path.relative(root, file);
  return !relative || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep));
}

/**
 * Opt-in, session-scoped output cleanup. The legacy watcher remains unchanged.
 * Only synchronous callbacks are supported. Emit reports claim files for
 * deletion, not for writing; the transpiler still owns its write policy.
 */
class TrackedWatcher {
  constructor(options, cb) {
    // Reuse option normalization only, never inherit the legacy destructive
    // diff-directory cleanup methods on the tracked entry.
    this.options = new Watcher(options, cb).options;
    this.cb = cb;
    this.timer = null;
    this.closed = false;
    this.sources = new Map();
    this.outputs = new Map();
    this.pending = new Map();
    this.running = false;
    this.lastError = '';
    this.roots = this.options.srcPath.map((source, index) => {
      if (!path.isAbsolute(source)) throw failure('INVALID_SOURCE_PATH', 'srcPath must be an absolute path');
      const output = this.options.diffPath[index];
      if (!output || !path.isAbsolute(output)) throw failure('INVALID_OUTPUT_PATH', 'diffPath must be an absolute path');
      if (contains(source, output) || contains(output, source)) {
        throw failure('UNSAFE_OUTPUT_PATH', 'Tracked source and output directories must not overlap');
      }
      // Existing symlink components are refused even if the leaf is absent.
      inspect(source);
      inspect(output, true);
      return {source: canonical(source), output: canonical(output)};
    });
    for (const [index, root] of this.roots.entries()) {
      for (const [otherIndex, other] of this.roots.entries()) {
        if (contains(root.source, other.output) || contains(other.output, root.source) ||
            (index !== otherIndex && (contains(root.source, other.source) || contains(root.output, other.output)))) {
          throw failure('UNSAFE_OUTPUT_PATH', 'Tracked source/output roots must be distinct and non-overlapping');
        }
      }
    }
    const interval = this.options.interval;
    if (interval !== undefined && (!Number.isFinite(interval) || interval < 1)) {
      throw new TypeError('interval must be a positive finite number');
    }
  }

  scan() {
    const files = new Map();
    for (const {source} of this.roots) {
      // Missing root is a failure, not permission to delete an entire build.
      if (!inspect(source).isDirectory()) throw failure('INVALID_SOURCE_PATH', `Not a directory: ${source}`);
      const visit = directory => {
        for (const entry of fs.readdirSync(directory, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) {
          if (entry.name.startsWith('.')) continue;
          const absolute = path.join(directory, entry.name);
          if (entry.isSymbolicLink()) throw failure('UNSAFE_SOURCE_PATH', `Symlink in source tree: ${absolute}`);
          if (entry.isDirectory()) { visit(absolute); continue; }
          const info = {path: source, file: path.relative(source, absolute)};
          if (!entry.isFile() || /\.d\.ts$/i.test(info.file) || !this.options.filter(info, this.options)) continue;
          files.set(absolute, {info, hash: fingerprint(absolute).hash});
        }
      };
      visit(source);
    }
    return files;
  }

  removeOutputs(records) {
    // Validate the entire deletion set before removing any member.
    const existing = [];
    for (const [file, recorded] of records) {
      if (!inspect(file, true)) continue;
      const actual = fingerprint(file);
      if (actual.dev !== recorded.dev || actual.ino !== recorded.ino || actual.hash !== recorded.hash) {
        throw failure('OUTPUT_CHANGED', `Refusing to remove an output changed outside this watcher: ${file}`);
      }
      existing.push(file);
    }
    for (const file of existing) fs.unlinkSync(file);
  }

  trackOutputs(info, filenames) {
    const root = this.roots.find(item => item.source === path.resolve(info.path));
    if (!root) throw failure('INVALID_SOURCE_PATH', 'Emit report does not belong to a watched source root');
    const source = path.join(root.source, relativeFile(info.file));
    if (!Array.isArray(filenames)) throw new TypeError('Emit report must be an array of relative output files');
    const records = new Map();
    for (const filename of filenames) {
      const file = path.join(root.output, relativeFile(filename));
      const record = fingerprint(file);
      for (const [owner, owned] of this.outputs) {
        if (owner !== source && [...owned].some(([other, value]) =>
          other === file || (value.dev === record.dev && value.ino === record.ino))) {
          throw failure('OUTPUT_COLLISION', `Output already belongs to another source: ${file}`);
        }
      }
      records.set(file, record);
    }
    const previous = this.outputs.get(source) || new Map();
    this.removeOutputs([...previous].filter(([file]) => !records.has(file)));
    this.outputs.set(source, records);
  }

  poll() {
    const current = this.scan();
    for (const [source, previous] of new Map([...this.sources, ...this.pending])) {
      if (current.has(source)) continue;
      this.removeOutputs(this.outputs.get(source) || []);
      checkResult(this.cb({...previous.info, event: 'unlink'}), source);
      this.outputs.delete(source);
      this.sources.delete(source);
      this.pending.delete(source);
      if (this.closed) return;
    }
    for (const [source, entry] of current) {
      if (!this.pending.has(source) && this.sources.get(source)?.hash === entry.hash) continue;
      this.pending.set(source, entry);
      let active = true;
      const info = {...entry.info, event: 'change', onEmit: files => {
        if (!active || this.closed) throw failure('LATE_EMIT', 'Emit reports must be synchronous and precede close');
        this.trackOutputs(entry.info, files);
      }};
      let result;
      try { result = this.cb(info); } finally { active = false; }
      checkResult(result, source);
      this.sources.set(source, entry);
      this.pending.delete(source);
      if (this.closed) return;
    }
  }

  watch() {
    if (this.running) return;
    this.closed = false;
    this.running = true;
    try { this.poll(); } catch (error) { this.close(); throw error; }
    const tick = () => {
      if (this.closed) return;
      try {
        this.poll();
        this.lastError = '';
      } catch (error) {
        const key = `${error.code}:${error.message}`;
        if (key !== this.lastError) {
          this.lastError = key;
          if (this.options.onError) this.options.onError(error);
          else console.error(error.stack);
        }
      }
      if (!this.closed) this.timer = setTimeout(tick, this.options.interval || 100);
    };
    if (!this.closed) this.timer = setTimeout(tick, this.options.interval || 100);
  }

  close() {
    this.closed = true;
    clearTimeout(this.timer);
    this.timer = null;
    this.running = false;
  }
}

module.exports = TrackedWatcher;
