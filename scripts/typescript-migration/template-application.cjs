#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const {createRequire} = require('node:module');
const {execFileSync, spawn} = require('node:child_process');
const {scaffold} = require('./scaffold.cjs');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-template-acceptance-'));
const project = path.join(temporary, 'moved-project');
const env = {...process.env, NODE_PATH: '', NODE_ENV: 'production', npm_config_manage_package_manager_versions: 'false'};
delete env.THINK_UNIT_TEST;
delete env.JEST_WORKER_ID;
const children = new Set();
const log = message => process.stdout.write(message + '\n');
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');

function run(args, cwd, expected = 0) {
  const executable = process.env.npm_execpath;
  const isPnpm = executable && /pnpm(?:\.[cm]?js)?$/.test(executable);
  try {
    const output = execFileSync(isPnpm ? process.execPath : process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
      isPnpm ? [executable, ...args] : args, {cwd, env, encoding: 'utf8', timeout: 300000,
        maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']});
    assert.equal(expected, 0, 'Command unexpectedly passed');
    return output;
  } catch (error) {
    if (expected && error.status) return String(error.stdout) + String(error.stderr);
    throw new Error(`pnpm ${args.join(' ')} failed:\n${error.stdout || ''}${error.stderr || ''}`, {cause: error});
  }
}

function install(directory, production = false) {
  const args = ['install', '--ignore-scripts', '--no-frozen-lockfile', '--config.manage-package-manager-versions=false'];
  if (production) args.push('--prod');
  if (process.env.THINKJS_APPLICATION_OFFLINE === '1') args.push('--offline');
  if (process.env.THINKJS_APPLICATION_STORE_DIR) args.push('--store-dir', process.env.THINKJS_APPLICATION_STORE_DIR);
  if (process.env.THINKJS_APPLICATION_CACHE_DIR) args.push('--cache-dir', process.env.THINKJS_APPLICATION_CACHE_DIR);
  log(run(args, directory).trim());
}

async function eventually(check, timeout = 30000) {
  const deadline = Date.now() + timeout;
  let last;
  do {
    try { return await check(); } catch (error) { last = error; }
    await new Promise(resolve => setTimeout(resolve, 100));
  } while (Date.now() < deadline);
  throw last;
}

function launch(directory, file) {
  const child = spawn(process.execPath, [file], {cwd: directory, env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe']});
  children.add(child);
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  const exited = new Promise(resolve => child.once('close', code => { children.delete(child); resolve(code); }));
  return {child, output: () => output, async stop() {
    child.kill('SIGTERM');
    const code = await Promise.race([exited, new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Shutdown timed out: ' + output)), 10000); timer.unref();
    })]);
    assert.equal(code, 0, output);
  }};
}

function cleanup() {
  for (const child of children) {
    try { process.platform === 'win32' ? child.kill('SIGKILL') : process.kill(-child.pid, 'SIGKILL'); } catch (_) {}
  }
  fs.rmSync(temporary, {recursive: true, force: true});
}
process.once('exit', cleanup);
process.once('SIGINT', () => process.exit(130));
process.once('SIGTERM', () => process.exit(143));

async function main() {
  const original = path.join(temporary, 'original-project');
  const generated = await scaffold(original);
  fs.renameSync(original, project);
  const manifest = json(path.join(project, 'package.json'));
  manifest.devDependencies.typescript = process.env.THINKJS_APPLICATION_TYPESCRIPT || '3.9.10';
  writeJson(path.join(project, 'package.json'), manifest);
  assert.equal(fs.existsSync(path.join(project, '.thinkjs/types')), false);
  assert.equal(fs.existsSync(path.join(project, 'app')), false);
  install(project);
  const local = createRequire(path.join(project, 'package.json'));
  const visited = new Set();
  const visit = (name, parent) => {
    if (!generated.packages.includes(name)) return;
    const file = fs.realpathSync(createRequire(path.join(parent, 'package.json')).resolve(name + '/package.json'));
    assert.ok(file.startsWith(project + path.sep), `Package escaped generated installation: ${file}`);
    if (visited.has(file)) return;
    visited.add(file);
    for (const dep of Object.keys(json(file).dependencies || {})) visit(dep, path.dirname(file));
  };
  Object.keys({...manifest.dependencies, ...manifest.devDependencies}).forEach(name => visit(name, project));
  assert.equal(local('typescript').version, manifest.devDependencies.typescript);
  run(['run', 'typecheck'], project);
  const service = path.join(project, 'src/service/greeting.ts');
  const source = fs.readFileSync(service, 'utf8');
  const compiled = path.join(project, 'app/service/greeting.js');
  const resource = path.join(project, 'src/assets/message.txt');
  const resourceSource = fs.readFileSync(resource, 'utf8');
  const resourceOutput = path.join(project, 'app/assets/message.txt');
  const binary = Buffer.from([0, 255, 128, 13, 10]);
  fs.writeFileSync(path.join(project, 'src/assets/data.bin'), binary);
  fs.writeFileSync(path.join(project, 'src/assets/settings.json'), '{"raw":true}\r\n');
  run(['run', 'build'], project);
  const built = fs.readFileSync(compiled, 'utf8');
  assert.equal(fs.readFileSync(resourceOutput, 'utf8'), resourceSource);
  assert.deepEqual(fs.readFileSync(path.join(project, 'app/assets/data.bin')), binary);
  assert.equal(fs.readFileSync(path.join(project, 'app/assets/settings.json'), 'utf8'), '{"raw":true}\r\n');
  const tsconfigFile = path.join(project, 'tsconfig.json');
  const tsconfig = json(tsconfigFile);
  writeJson(tsconfigFile, {...tsconfig, compilerOptions: {...tsconfig.compilerOptions, sourceMap: false, inlineSourceMap: true}});
  run(['run', 'build'], project);
  const inline = fs.readFileSync(compiled, 'utf8').match(/sourceMappingURL=data:application\/json;base64,(\S+)/)[1];
  const inlineMap = JSON.parse(Buffer.from(inline, 'base64').toString('utf8'));
  assert.equal(path.resolve(path.dirname(compiled), inlineMap.sources[0]), service);
  writeJson(tsconfigFile, tsconfig);
  run(['run', 'build'], project);
  const map = json(compiled + '.map');
  assert.equal(path.resolve(path.dirname(compiled), map.sources[0]), service);
  fs.writeFileSync(service, source.replace('return this.text;', 'return 123;'));
  fs.writeFileSync(resource, 'Must not publish\n');
  fs.unlinkSync(path.join(project, 'src/assets/data.bin'));
  assert.match(run(['run', 'typecheck'], project, 1), /not assignable/);
  assert.match(run(['run', 'build'], project, 1), /DEVELOPMENT_TYPECHECK/);
  assert.equal(fs.readFileSync(compiled, 'utf8'), built);
  assert.equal(fs.readFileSync(resourceOutput, 'utf8'), resourceSource);
  assert.deepEqual(fs.readFileSync(path.join(project, 'app/assets/data.bin')), binary);
  fs.writeFileSync(service, source);
  fs.writeFileSync(resource, resourceSource);
  const obsolete = path.join(project, 'src/service/obsolete.ts');
  fs.writeFileSync(obsolete, 'export default {value: 1};\n');
  run(['run', 'build'], project);
  fs.unlinkSync(obsolete);
  run(['run', 'build'], project);
  assert.equal(fs.existsSync(path.join(project, 'app/service/obsolete.js')), false);
  assert.equal(fs.existsSync(path.join(project, 'app/assets/data.bin')), false);
  // Refuse unowned output instead of deleting a user's directory.
  const marker = path.join(project, 'app/.thinkjs-checked-output');
  const owner = fs.readFileSync(marker);
  fs.unlinkSync(marker);
  assert.match(run(['run', 'build'], project, 1), /ownership marker/);
  assert.equal(fs.readFileSync(compiled, 'utf8'), built);
  fs.writeFileSync(marker, owner);
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  const config = path.join(project, 'src/config/config.ts');
  fs.writeFileSync(config, fs.readFileSync(config, 'utf8').replace('8360', String(port)));
  const request = async (expected, action = 'index') => {
    const response = await fetch(`http://127.0.0.1:${port}/index/${action}`, {signal: AbortSignal.timeout(3000)});
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {errno: 0, errmsg: '', data: expected});
  };
  // No generated declarations or runtime output: first dev boot must build both.
  fs.rmSync(path.join(project, 'app'), {recursive: true});
  fs.rmSync(path.join(project, '.thinkjs/types'), {recursive: true});
  const dev = launch(project, 'dev.cjs');
  try {
    await eventually(() => request('Hello, ThinkJS'));
    await request(resourceSource.trim(), 'resource');
    const previous = fs.readFileSync(compiled, 'utf8');
    assert.match(run(['run', 'build'], project, 1), /build\/dev lock already exists/);
    fs.writeFileSync(service, source.replace('return this.text;', 'return 123;'));
    fs.writeFileSync(resource, 'Updated resource\n');
    await eventually(() => assert.match(dev.output(), /DEVELOPMENT_TYPECHECK/));
    assert.equal(fs.readFileSync(compiled, 'utf8'), previous);
    await request('Hello, ThinkJS');
    await request(resourceSource.trim(), 'resource');
    assert.equal(fs.readFileSync(resourceOutput, 'utf8'), resourceSource);
    fs.writeFileSync(service, source.replace('return this.text;', "return this.text + '!';"));
    await eventually(() => request('Hello, ThinkJS!'));
    await eventually(() => request('Updated resource', 'resource'));
    // An asset-only edit must reload a worker that read its value once at boot.
    fs.writeFileSync(resource, 'Resource-only reload\n');
    await eventually(() => request('Resource-only reload', 'resource'));
    fs.writeFileSync(path.join(project, 'src/assets/live.bin'), binary);
    await eventually(() => assert.deepEqual(fs.readFileSync(path.join(project, 'app/assets/live.bin')), binary));
    fs.renameSync(path.join(project, 'src/assets/live.bin'), path.join(project, 'src/assets/renamed.bin'));
    await eventually(() => {
      assert.equal(fs.existsSync(path.join(project, 'app/assets/live.bin')), false);
      assert.deepEqual(fs.readFileSync(path.join(project, 'app/assets/renamed.bin')), binary);
    });
    fs.unlinkSync(path.join(project, 'src/assets/renamed.bin'));
    await eventually(() => assert.equal(fs.existsSync(path.join(project, 'app/assets/renamed.bin')), false));
  } finally { await dev.stop(); }
  assert.equal(fs.existsSync(path.join(project, '.thinkjs/checked.lock')), false);
  fs.writeFileSync(service, source);
  run(['run', 'build'], project);
  const production = path.join(temporary, 'production');
  fs.mkdirSync(production);
  writeJson(path.join(production, 'package.json'), {name: 'checked-production', version: '0.0.0', private: true, dependencies: manifest.dependencies});
  for (const file of ['pnpm-workspace.yaml', 'start.cjs']) fs.copyFileSync(path.join(project, file), path.join(production, file));
  for (const dir of ['app', '.thinkjs/packages']) fs.cpSync(path.join(project, dir), path.join(production, dir), {recursive: true});
  fs.mkdirSync(path.join(production, 'scripts'));
  fs.copyFileSync(path.join(project, 'scripts/lifecycle.cjs'), path.join(production, 'scripts/lifecycle.cjs'));
  install(production, true);
  const prodRequire = createRequire(path.join(production, 'package.json'));
  for (const name of ['think-ts-helper', 'typescript', 'think-watcher']) assert.throws(() => prodRequire.resolve(name), {code: 'MODULE_NOT_FOUND'});
  for (const dir of ['src', '.thinkjs/types']) assert.equal(fs.existsSync(path.join(production, dir)), false);
  const prod = launch(production, 'start.cjs');
  try {
    await eventually(() => request('Hello, ThinkJS'));
    await request('Resource-only reload', 'resource');
  } finally { await prod.stop(); }
  log(`Generated template acceptance passed (TypeScript ${manifest.devDependencies.typescript}): portable tarballs, cold typecheck/dev, semantic recovery, binary/resource copy/reload/cleanup, production HTTP and shutdown.`);
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; }).finally(cleanup);
