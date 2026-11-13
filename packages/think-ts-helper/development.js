'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {generate} = require('./index');

const fail = (code, message) => { throw Object.assign(new Error(message), {code}); };
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function inside(root, file) {
  const relative = path.relative(root, file);
  return relative && !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep);
}

function safeDestination(file) {
  let current = path.resolve(file);
  while (true) {
    try {
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink() || (current === file ? !stat.isFile() : !stat.isDirectory())) {
        fail('DEVELOPMENT_OUTPUT', `Unsafe compiler destination: ${current}`);
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

// Explicit injection keeps this private prototype from adding a runtime package
// dependency or silently checking with a different compiler than it emits with.
function createWatcher(TrackedWatcher, ts) {
  if (typeof TrackedWatcher !== 'function' || !ts || typeof ts.createProgram !== 'function') {
    throw new TypeError('createWatcher requires think-watcher/tracked and the application TypeScript compiler');
  }
  return class DevelopmentWatcher extends TrackedWatcher {
    constructor(options, callback) {
      super({...options, interval: options.interval === undefined ? 500 : options.interval,
        allowExts: ['ts', 'json', 'js', 'es', 'tsx', 'mts', 'cts'], filter: undefined}, info => this.emitSource(info));
      if (this.roots.length !== 1) fail('DEVELOPMENT_CONFIG', 'Development watch supports exactly one source/output pair');
      this.root = path.resolve(options.root || path.dirname(this.roots[0].source));
      this.project = path.resolve(this.root, options.project || 'tsconfig.json');
      this.declarations = {...options.declarations};
      this.callback = callback;
      this.buildSignature = undefined;
      this.dirty = false;
      this.staged = undefined;
    }

    // The tracked ledger must record the same source snapshot the compiler
    // checked, not a second scan of potentially newer files during emission.
    scan() { return this.staged ? this.staged.sources : super.scan(); }

    emitSource(info) {
      if (info.event === 'unlink') return;
      const source = path.resolve(info.path, info.file);
      const outputs = this.staged.outputs.get(source);
      if (!outputs || !outputs.length) fail('DEVELOPMENT_EMIT', `Compiler did not emit ${source}`);
      for (const output of outputs) {
        fs.mkdirSync(path.dirname(output.file), {recursive: true});
        fs.writeFileSync(output.file, output.text);
      }
      info.onEmit(outputs.map(output => path.relative(this.roots[0].output, output.file)));
    }

    diagnostics(phase, diagnostics) {
      if (!diagnostics.length) return;
      const message = ts.formatDiagnostics(diagnostics, {
        getCanonicalFileName: file => file,
        getCurrentDirectory: () => this.root,
        getNewLine: () => '\n'
      });
      fail(phase, message);
    }

    poll() {
      const started = Date.now();
      const {source, output} = this.roots[0];
      const sources = super.scan();
      for (const file of sources.keys()) {
        if (!/\.(ts|json)$/.test(file)) fail('DEVELOPMENT_CONFIG', `Only TypeScript and imported JSON sources are supported: ${file}`);
      }
      const declarationOutput = path.resolve(this.root, this.declarations.outDir || '.thinkjs/types');
      if (declarationOutput === output || inside(output, declarationOutput) || inside(declarationOutput, output)) {
        fail('DEVELOPMENT_CONFIG', 'Generated declarations and runtime output must not overlap');
      }
      const declarations = generate({...this.declarations, root: this.root,
        sourceDir: path.relative(this.root, source), check: false});
      const config = ts.readConfigFile(this.project, ts.sys.readFile);
      this.diagnostics('DEVELOPMENT_CONFIG', config.error ? [config.error] : []);
      const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(this.project), undefined, this.project);
      this.diagnostics('DEVELOPMENT_CONFIG', parsed.errors);
      const options = parsed.options;
      if (options.module !== ts.ModuleKind.CommonJS || path.resolve(options.rootDir || '') !== source ||
          path.resolve(options.outDir || '') !== output || options.allowJs || options.outFile ||
          options.noCheck || options.declaration || options.emitDeclarationOnly || options.incremental || options.composite ||
          (parsed.projectReferences && parsed.projectReferences.length)) {
        fail('DEVELOPMENT_CONFIG', 'Require CommonJS, matching explicit rootDir/outDir, and a non-incremental TypeScript application (no noCheck, declarations, JS or project references)');
      }
      // noEmit is a convenient standalone typecheck setting. This explicitly
      // opted-in development pipeline checks first and then emits the project.
      const program = ts.createProgram(parsed.fileNames, {...options, noEmit: false, noEmitOnError: true});
      this.diagnostics('DEVELOPMENT_TYPECHECK', ts.getPreEmitDiagnostics(program));
      if (!program.getSourceFile(path.join(declarations.output, 'index.d.ts'))) {
        fail('DEVELOPMENT_CONFIG', 'tsconfig must include the generated declaration index.d.ts');
      }
      for (const file of sources.keys()) {
        if (!program.getSourceFile(file)) fail('DEVELOPMENT_CONFIG', `Runtime source is not in the checked project: ${file}`);
      }
      const outputs = new Map();
      const destinations = new Set();
      const emitted = program.emit(undefined, (file, text, bom, onError, owners) => {
        file = path.resolve(file);
        if (!inside(output, file) || !owners || owners.length !== 1 || !sources.has(path.resolve(owners[0].fileName))) {
          fail('DEVELOPMENT_EMIT', `Unowned or out-of-root compiler output: ${file}`);
        }
        if (destinations.has(file)) fail('DEVELOPMENT_EMIT', `Duplicate compiler output: ${file}`);
        destinations.add(file);
        const owner = path.resolve(owners[0].fileName);
        const list = outputs.get(owner) || [];
        list.push({file, text: (bom ? '\uFEFF' : '') + text});
        outputs.set(owner, list);
      });
      this.diagnostics('DEVELOPMENT_EMIT', emitted.diagnostics);
      if (emitted.emitSkipped) fail('DEVELOPMENT_EMIT', 'TypeScript skipped project emission');
      for (const file of sources.keys()) {
        if (!outputs.has(file)) fail('DEVELOPMENT_EMIT', `No compiler output for ${file}; non-imported resources are not supported`);
      }
      // A whole-project fingerprint also invalidates unchanged importers of const
      // enums, compiler option changes, declarations and imported JSON resources.
      const signature = hash(JSON.stringify([options, [...outputs], program.getSourceFiles().map(file => [file.fileName, file.text])]));
      const current = super.scan();
      if (sources.size !== current.size || [...sources].some(([file, value]) => current.get(file)?.hash !== value.hash)) {
        fail('DEVELOPMENT_CHANGED', 'Source changed during checking; retrying before emission');
      }
      this.lastCheckDurationMs = Date.now() - started;
      if (signature === this.buildSignature && !this.dirty) return;
      for (const file of destinations) safeDestination(file);
      this.dirty = true;
      for (const [file, value] of sources) this.pending.set(file, value);
      this.staged = {sources, outputs};
      try { super.poll(); } finally { this.staged = undefined; }
      if (this.closed) return;
      const result = {event: 'build', files: [...destinations], compilerVersion: ts.version,
        durationMs: Date.now() - started, diagnostics: declarations.diagnostics};
      const returned = this.callback(result);
      if (returned && typeof returned.then === 'function') {
        Promise.resolve(returned).catch(() => {});
        fail('DEVELOPMENT_CALLBACK', 'Development build callback must be synchronous');
      }
      if (returned === false || returned instanceof Error) fail('DEVELOPMENT_CALLBACK', 'Development build callback failed');
      this.buildSignature = signature;
      this.dirty = false;
      this.lastBuild = result;
    }
  };
}

module.exports = {createWatcher};
