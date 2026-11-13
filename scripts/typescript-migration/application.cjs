#!/usr/bin/env node
'use strict';

// A real package-manager consumer, deliberately outside the workspace. No TS
// paths, NODE_PATH, workspace links or copied node_modules can satisfy this gate.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {once} = require('node:events');
const {execFileSync, fork} = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const fixture = path.join(root, 'test/typescript-migration/application-fixture');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-installed-application-'));
const consumer = path.join(temporary, 'development');
const production = path.join(temporary, 'production');
const tarballs = path.join(temporary, 'tarballs');
const env = {...process.env, NODE_PATH: '', npm_config_cache: path.join(temporary, 'npm-cache')};
const log = message => process.stdout.write(message + '\n');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const activeChildren = new Set();

function killChild(child) {
  if (process.platform !== 'win32' && child.pid) {
    try { process.kill(-child.pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') process.stderr.write(error.message + '\n'); }
  } else if (child.exitCode === null) child.kill();
}

function cleanup() {
  for (const child of activeChildren) killChild(child);
  fs.rmSync(temporary, {recursive: true, force: true});
}

process.once('exit', cleanup);
process.once('SIGINT', () => process.exit(130));
process.once('SIGTERM', () => process.exit(143));

function run(command, args, cwd, expected = 0) {
  try {
    const output = execFileSync(command, args, {cwd, env, encoding: 'utf8', timeout: 300000,
      maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']});
    assert.equal(expected, 0, `${command} unexpectedly passed`);
    return output;
  } catch (error) {
    if (expected && [].concat(expected).includes(error.status)) return String(error.stdout) + String(error.stderr);
    throw new Error(`${command} ${args.join(' ')} failed in ${cwd}\n${error.stdout || ''}${error.stderr || ''}`, {cause: error});
  }
}

function pnpm(args, cwd) {
  // pnpm run supplies the exact selected CLI. Direct node invocation uses PATH.
  const executable = process.env.npm_execpath;
  return executable && /pnpm(?:\.[cm]?js)?$/.test(executable)
    ? run(process.execPath, [executable, ...args], cwd)
    : run(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, cwd);
}

function collectPackages(manifest) {
  const packages = new Map();
  for (const directory of fs.readdirSync(path.join(root, 'packages'))) {
    const file = path.join(root, 'packages', directory, 'package.json');
    if (!fs.existsSync(file)) continue;
    const pkg = json(file);
    const candidates = packages.get(pkg.name) || [];
    candidates.push({directory: path.dirname(file), manifest: pkg});
    packages.set(pkg.name, candidates);
  }
  const selected = new Map();
  function visit(name) {
    if (selected.has(name) || !packages.has(name)) return;
    // P0 records the legacy think-logger/think-logger3 duplicate. Match the
    // workspace lockfile's active think-logger3 path; fail for new ambiguity.
    const candidates = name === 'think-logger3'
      ? packages.get(name).filter(pkg => path.basename(pkg.directory) === 'think-logger3')
      : packages.get(name);
    assert.equal(candidates.length, 1, `Ambiguous workspace package: ${name}`);
    const pkg = candidates[0];
    selected.set(name, pkg);
    for (const dependency of Object.keys({...pkg.manifest.dependencies, ...pkg.manifest.optionalDependencies})) visit(dependency);
  }
  for (const name of Object.keys({...manifest.dependencies, ...manifest.devDependencies})) visit(name);
  return new Map([...selected].sort(([a], [b]) => a.localeCompare(b)));
}

function install(directory, manifest, overrides) {
  fs.mkdirSync(directory, {recursive: true});
  writeJson(path.join(directory, 'package.json'), manifest);
  // pnpm 11 settings belong here, not package.json#pnpm. Local overrides also
  // cover the thinkjs/think-loader cycle, so no first-party registry copy wins.
  fs.writeFileSync(path.join(directory, 'pnpm-workspace.yaml'),
    'packages: []\n' + 'overrides: ' + JSON.stringify(overrides) + '\n');
  const args = ['install', '--ignore-scripts', '--no-frozen-lockfile', '--config.manage-package-manager-versions=false'];
  if (process.env.THINKJS_APPLICATION_OFFLINE === '1') args.push('--offline');
  if (process.env.THINKJS_APPLICATION_STORE_DIR) args.push('--store-dir', process.env.THINKJS_APPLICATION_STORE_DIR);
  if (process.env.THINKJS_APPLICATION_CACHE_DIR) args.push('--cache-dir', process.env.THINKJS_APPLICATION_CACHE_DIR);
  log(pnpm(args, directory).trim());
}

function verifyInstalled(directory, packages, directNames) {
  const visited = new Set();
  function visit(name, parent) {
    if (!packages.has(name)) return;
    const local = createRequire(path.join(parent, 'package.json'));
    const file = fs.realpathSync(local.resolve(name + '/package.json'));
    assert.ok(file.startsWith(directory + path.sep), `${name} escaped the isolated installation: ${file}`);
    if (visited.has(file)) return;
    visited.add(file);
    const actual = json(file);
    assert.equal(actual.version, packages.get(name).manifest.version);
    for (const dependency of Object.keys(actual.dependencies || {})) visit(dependency, path.dirname(file));
  }
  directNames.forEach(name => visit(name, directory));
  const local = createRequire(path.join(directory, 'package.json'));
  assert.equal(typeof local('thinkjs'), 'function', 'CommonJS bootstrap stays constructible');
  assert.equal(typeof local('thinkjs/lib/extend/controller.js').service, 'function', 'legacy deep paths stay present');
}

async function request(port, route) {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, {signal: AbortSignal.timeout(10000)});
  return {status: response.status, headers: response.headers, body: await response.text()};
}

async function exerciseDeclarationWatch(directory, local) {
  const watcher = local('think-ts-helper').watch({root: directory, models: true, configs: true, interval: 20});
  const original = path.join(directory, 'src/common/service/watch-added.ts');
  const renamed = path.join(directory, 'src/common/service/watch-renamed.ts');
  try {
    await watcher.ready;
    async function change(action) {
      const updated = once(watcher, 'update', {signal: AbortSignal.timeout(10000)});
      action();
      return (await updated)[0];
    }
    const added = await change(() => fs.writeFileSync(original, 'export default {value: 1};\n'));
    assert.ok(added.manifest.modules.admin['watch-added']);
    const moved = await change(() => fs.renameSync(original, renamed));
    assert.equal(moved.manifest.modules.admin['watch-added'], undefined);
    assert.ok(moved.manifest.modules.admin['watch-renamed']);
    const deleted = await change(() => fs.unlinkSync(renamed));
    assert.equal(deleted.manifest.modules.admin['watch-renamed'], undefined);
  } finally {
    watcher.close();
    fs.rmSync(original, {force: true});
    fs.rmSync(renamed, {force: true});
  }
}

async function exercise(directory) {
  const childEnv = {...env, NODE_ENV: 'production'};
  delete childEnv.THINK_UNIT_TEST;
  delete childEnv.JEST_WORKER_ID;
  const child = fork(path.join(directory, 'start.cjs'), [], {cwd: directory, env: childEnv,
    silent: true, execArgv: [], detached: process.platform !== 'win32'});
  activeChildren.add(child);
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  const exited = new Promise(resolve => child.once('close', (code, signal) => resolve({code, signal})));
  try {
    let startupTimer;
    const ready = await new Promise((resolve, reject) => {
      startupTimer = setTimeout(() => reject(new Error('Application startup timed out')), 15000);
      child.once('error', reject);
      child.on('message', message => {
        if (message && message.type === 'fixture-ready') { resolve(message); }
      });
      exited.then(result => { reject(new Error(`Application exited before ready: ${JSON.stringify(result)}`)); });
    }).finally(() => clearTimeout(startupTimer));
    const response = await request(ready.port, '/admin/index/index');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-logic-label'), '42', 'Logic executes before Controller');
    assert.deepEqual(JSON.parse(response.body), {errno: 0, errmsg: '', data: {
      item: 7, commonItem: 'common-item', title: 'item:7', localService: 9,
      commonService: 'common-service', label: 42, commonLabel: 'common', table: 'unregistered_table'
    }});
    const blocked = await request(ready.port, '/admin/index/blocked');
    assert.equal(blocked.status, 200);
    assert.deepEqual(JSON.parse(blocked.body), {errno: 1001, errmsg: 'blocked-by-logic'});
    assert.equal((await request(ready.port, '/admin/missing/index')).status, 404);
    child.send('fixture-stop');
    const result = await Promise.race([exited, new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Application shutdown timed out')), 5000);
      exited.then(() => clearTimeout(timer));
    })]);
    assert.deepEqual(result, {code: 0, signal: null});
  } catch (error) {
    throw new Error(`${error.message}\n${output}`, {cause: error});
  } finally {
    // Kill the entire test-owned group on failure, including an unready worker.
    // POSIX is the CI target; the Windows child handles normal shutdown via IPC.
    killChild(child);
    await exited;
    activeChildren.delete(child);
  }
}

async function main() {
  fs.mkdirSync(tarballs);
  fs.cpSync(fixture, consumer, {recursive: true});
  const manifest = json(path.join(consumer, 'package.json'));
  manifest.devDependencies.typescript = process.env.THINKJS_APPLICATION_TYPESCRIPT || '3.9.10';
  const packages = collectPackages(manifest);
  log(`Packing ${packages.size} first-party packages from the current checkout`);
  const packed = JSON.parse(run(process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['pack', ...[...packages.values()].map(pkg => pkg.directory), '--ignore-scripts', '--json', '--pack-destination', tarballs], root));
  assert.equal(packed.length, packages.size);
  const overrides = {};
  for (const pkg of packed) {
    assert.ok(packages.has(pkg.name));
    overrides[pkg.name] = 'file:' + path.join(tarballs, pkg.filename);
  }
  install(consumer, manifest, overrides);
  verifyInstalled(consumer, packages, Object.keys({...manifest.dependencies, ...manifest.devDependencies}));
  const local = createRequire(path.join(consumer, 'package.json'));
  for (const file of ['thinkjs/service-types.d.ts', 'think-model/model-types.d.ts', 'think-config/config-types.d.ts']) {
    assert.ok(local.resolve(file).startsWith(consumer + path.sep), `Missing packed public declaration ${file}`);
  }
  const cli = local.resolve('think-ts-helper/cli.js');
  const compiler = local.resolve('typescript/bin/tsc');
  assert.equal(local('typescript').version, manifest.devDependencies.typescript);
  log('Checking missing/stale generation, real tsc, clean build and negative contracts');
  const flags = ['.', '--models', '--configs'];
  assert.match(run(process.execPath, [cli, 'check', ...flags], consumer, 1), /service\.d\.ts/);
  run(process.execPath, ['build.cjs'], consumer);
  run(process.execPath, [cli, 'check', ...flags], consumer);
  assert.ok(fs.existsSync(path.join(consumer, 'app/admin/model/records.json')), 'JSON resource must be emitted');
  const generated = path.join(consumer, '.thinkjs/types/service.d.ts');
  const clean = fs.readFileSync(generated, 'utf8');
  fs.appendFileSync(generated, '\n// stale\n');
  run(process.execPath, [cli, 'check', ...flags], consumer, 1);
  assert.match(fs.readFileSync(generated, 'utf8'), /stale/, 'check must not write');
  run(process.execPath, [cli, 'generate', ...flags], consumer);
  assert.equal(fs.readFileSync(generated, 'utf8'), clean);
  // Actual compiler failures, not transpileModule success or skipLibCheck-only
  // declarations: remove all negative directives and assert five source errors.
  const negative = path.join(consumer, 'src/type-errors.ts');
  const negatives = fs.readFileSync(negative, 'utf8');
  fs.writeFileSync(negative, negatives.replace(/@ts-expect-error/g, 'expected error'));
  const errors = run(process.execPath, [compiler, '--noEmit', '--pretty', 'false'], consumer, [1, 2]);
  assert.equal((errors.match(/src\/type-errors\.ts\(/g) || []).length, 5, errors);
  assert.match(run(process.execPath, ['build.cjs'], consumer, 1), /type-errors/);
  fs.writeFileSync(negative, negatives);
  // Explicitly retain the unsupported real-plugin boundary of the preceding PR.
  assert.match(run(process.execPath, [cli, 'generate', ...flags, '--controller-extends'], consumer, 1), /UNSUPPORTED_CONTROLLER_EXTEND/);
  run(process.execPath, [cli, 'check', ...flags], consumer);
  const transient = path.join(consumer, 'src/common/service/temporary.ts');
  const renamed = path.join(consumer, 'src/common/service/renamed.ts');
  fs.writeFileSync(transient, 'export default {value: 1};\n');
  run(process.execPath, ['build.cjs'], consumer);
  assert.ok(fs.existsSync(path.join(consumer, 'app/common/service/temporary.js')));
  assert.match(fs.readFileSync(generated, 'utf8'), /temporary/);
  fs.renameSync(transient, renamed);
  run(process.execPath, ['build.cjs'], consumer);
  assert.equal(fs.existsSync(path.join(consumer, 'app/common/service/temporary.js')), false);
  assert.ok(fs.existsSync(path.join(consumer, 'app/common/service/renamed.js')));
  assert.doesNotMatch(fs.readFileSync(generated, 'utf8'), /temporary/);
  assert.match(fs.readFileSync(generated, 'utf8'), /renamed/);
  fs.unlinkSync(renamed);
  run(process.execPath, ['build.cjs'], consumer);
  assert.equal(fs.existsSync(path.join(consumer, 'app/common/service/renamed.js')), false);
  assert.equal(fs.readFileSync(generated, 'utf8'), clean);
  await exerciseDeclarationWatch(consumer, local);
  assert.equal(fs.readFileSync(generated, 'utf8'), clean);
  run(process.execPath, [compiler, '--noEmit', '--pretty', 'false'], consumer);
  log('Installed helper watch: Service add/rename/delete updated declarations');
  await exercise(consumer);
  log('Development install: real master/worker startup and three HTTP routes passed');

  // A second real install gets runtime dependencies only. Copying node_modules,
  // source files, generated types or the helper would defeat this acceptance.
  install(production, {name: manifest.name + '-production', version: '0.0.0', private: true,
    dependencies: manifest.dependencies}, overrides);
  fs.cpSync(path.join(consumer, 'app'), path.join(production, 'app'), {recursive: true});
  fs.copyFileSync(path.join(consumer, 'start.cjs'), path.join(production, 'start.cjs'));
  verifyInstalled(production, packages, Object.keys(manifest.dependencies));
  const productionRequire = createRequire(path.join(production, 'package.json'));
  for (const name of ['think-ts-helper', 'typescript']) assert.throws(() => productionRequire.resolve(name), {code: 'MODULE_NOT_FOUND'});
  for (const name of ['src', '.thinkjs']) assert.equal(fs.existsSync(path.join(production, name)), false);
  await exercise(production);
  log(`Production-only install: same HTTP results without source/helper/compiler/generated types (TypeScript ${manifest.devDependencies.typescript})`);
}

main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; }).finally(cleanup);
