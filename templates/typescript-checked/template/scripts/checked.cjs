'use strict';
const fs = require('node:fs');
const path = require('node:path');
const Watcher = require('think-ts-helper/development').createWatcher(require('think-watcher/tracked'), require('typescript'));
const marker = '.thinkjs-checked-output';
const owner = 'thinkjs-checked-template-v1\n';
// One explicit source-relative resource policy for staged build and live dev.
// Add lowercase extensions without dots here, then restart dev.
const resourceExtensions = Object.freeze(['json', 'txt', 'html', 'bin']);

function stateDirectory(root) {
  const state = path.join(root, '.thinkjs');
  try { fs.mkdirSync(state); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  if (!fs.lstatSync(state).isDirectory() || fs.lstatSync(state).isSymbolicLink()) throw new Error('.thinkjs must be a directory, not a symlink');
  return state;
}

function lock(root) {
  const file = path.join(stateDirectory(root), 'checked.lock');
  let fd;
  try { fd = fs.openSync(file, 'wx'); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    throw new Error(`A build/dev lock already exists at ${file}. Stop any active build/dev processes; only if all are stopped, remove this stale lock and retry.`, {cause: error});
  }
  fs.writeFileSync(fd, String(process.pid) + '\n');
  let released = false;
  return () => {
    if (released) return;
    released = true;
    fs.closeSync(fd);
    fs.unlinkSync(file);
  };
}

function validateOutput(output) {
  if (!fs.existsSync(output)) {
    // existsSync follows symlinks; dangling links still must not be replaced.
    try { fs.lstatSync(output); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  }
  if (!fs.lstatSync(output).isDirectory() || fs.lstatSync(output).isSymbolicLink()) {
    throw new Error('app must be a generated directory, not a file or symlink');
  }
  const file = path.join(output, marker);
  if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || fs.readFileSync(file, 'utf8') !== owner) {
    throw new Error('Refusing to replace app without the checked-template ownership marker');
  }
}

function relocateMaps(directory, published) {
  const relocate = (text, from, to) => {
    const map = JSON.parse(text);
    // TypeScript calculated relative sources from the temporary outDir.
    // Keep explicit sourceRoot semantics, otherwise adjust to the final map.
    if (!map.sourceRoot) map.sources = map.sources.map(source =>
      path.relative(path.dirname(to), path.resolve(path.dirname(from), source)).split(path.sep).join('/'));
    return JSON.stringify(map);
  };
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    const destination = path.join(published, entry.name);
    if (entry.isDirectory()) relocateMaps(file, destination);
    else if (entry.name.endsWith('.js.map')) {
      fs.writeFileSync(file, relocate(fs.readFileSync(file, 'utf8'), file, destination));
    } else if (entry.name.endsWith('.js')) {
      const text = fs.readFileSync(file, 'utf8');
      const updated = text.replace(/(\/\/# sourceMappingURL=data:application\/json;base64,)([A-Za-z0-9+/=]+)\s*$/, (_, prefix, encoded) =>
        prefix + Buffer.from(relocate(Buffer.from(encoded, 'base64').toString('utf8'), file, destination)).toString('base64') + '\n');
      if (updated !== text) fs.writeFileSync(file, updated);
    }
  }
}

function build(root) {
  const output = path.join(root, 'app');
  validateOutput(output);
  const stage = fs.mkdtempSync(path.join(stateDirectory(root), 'build-'));
  let watcher;
  let preserveStage = false;
  try {
    const project = path.join(stage, 'tsconfig.json');
    const stagedOutput = path.join(stage, 'app');
    fs.writeFileSync(project, JSON.stringify({extends: path.join(root, 'tsconfig.json'),
      compilerOptions: {outDir: stagedOutput}}));
    watcher = new Watcher({root, project, srcPath: path.join(root, 'src'), diffPath: stagedOutput,
      declarations: {configs: true}, resourceExtensions}, () => {});
    // Checking and emitting use the same program, with no runtime writes until
    // diagnostics pass. A failed staging build leaves the published app alone.
    watcher.poll();
    relocateMaps(stagedOutput, output);
    fs.writeFileSync(path.join(stagedOutput, marker), owner);
    validateOutput(output);
    const backup = path.join(stage, 'previous');
    const exists = fs.existsSync(output);
    if (exists) fs.renameSync(output, backup);
    try { fs.renameSync(stagedOutput, output); }
    catch (error) {
      if (exists) {
        try { fs.renameSync(backup, output); }
        catch (restoreError) {
          preserveStage = true;
          throw new AggregateError([error, restoreError], `Restore failed; previous app preserved in ${backup}`, {cause: restoreError});
        }
      }
      throw error;
    }
  } finally {
    if (watcher) watcher.close();
    if (!preserveStage) fs.rmSync(stage, {recursive: true, force: true});
  }
}
module.exports = {Watcher, lock, build, resourceExtensions};
