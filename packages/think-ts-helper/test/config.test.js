'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {generate} = require('..');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-ts-config-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const write = (name, content) => {
    const file = path.join(root, name);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
  };
  fs.mkdirSync(path.join(root, 'src'));
  fs.mkdirSync(path.join(root, 'node_modules'));
  fs.symlinkSync(path.resolve(__dirname, '../../thinkjs'), path.join(root, 'node_modules/thinkjs'), 'dir');
  return {root, write};
}

test('Config generation is opt-in, deterministic, retains source references and never runs functions', t => {
  const {root, write} = fixture(t);
  write('src/config/config.ts', 'const config = {nested: {value: 1}, callback: () => { throw new Error("never call"); }}; export = config;');
  const plain = generate({root});
  assert.equal(plain.files['config.d.ts'], undefined);
  const first = generate({root, configs: true});
  assert.match(first.files['config.d.ts'], /"nested.value": typeof import\("..\/..\/src\/config\/config"\)\["nested"\]\["value"\]/);
  assert.match(first.files['config.d.ts'], /"port": number/);
  assert.match(first.files['config.d.ts'], /"callback": typeof import/);
  assert.match(first.files['index.d.ts'], /AppContext<T extends ConfigHost, M extends string = string>/);
  assert.deepEqual(generate({root, configs: true}).changed, []);
  write('.thinkjs/types/user.d.ts', '// keep');
  assert.deepEqual(generate({root, check: true}).removed, ['config.d.ts']);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/config.d.ts')), true);
  assert.deepEqual(generate({root}).files, plain.files);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/config.d.ts')), false);
  assert.equal(fs.readFileSync(path.join(root, '.thinkjs/types/user.d.ts'), 'utf8'), '// keep');
});

test('Config manifest tracks all runtime modules, base and environment precedence', t => {
  const {root, write} = fixture(t);
  write('src/common/config/config.ts', 'export const shared = 1;');
  write('src/home/config/config.ts', 'export const shared = "local";');
  write('src/common/config/config.production.js', 'exports.shared = true;');
  write('src/home/config/config.production.ts', 'export const shared = null;');
  write('src/home/config/config.staging.ts', 'export const optional = 1;');
  fs.mkdirSync(path.join(root, 'src/empty'));
  const result = generate({root, configs: true});
  assert.deepEqual(result.manifest.configs.environments, ['production', 'staging']);
  assert.deepEqual(result.manifest.configs.modules.home, {
    base: ['src/common/config/config.ts', 'src/home/config/config.ts'],
    environments: {
      production: ['src/common/config/config.production.js', 'src/home/config/config.production.ts'],
      staging: ['src/home/config/config.staging.ts']
    }
  });
  assert.deepEqual(result.manifest.configs.modules.empty, result.manifest.configs.modules.common);
  assert.match(result.files['config.d.ts'], /"optional": typeof import\([^\n]+\)\["optional"\] \| undefined/);
  fs.renameSync(path.join(root, 'src/home/config/config.staging.ts'), path.join(root, 'src/home/config/config.preview.ts'));
  assert.ok(generate({root, configs: true, check: true}).changed.includes('manifest.json'));
  assert.deepEqual(generate({root, configs: true}).manifest.configs.environments, ['preview', 'production']);
  fs.unlinkSync(path.join(root, 'src/home/config/config.preview.ts'));
  assert.doesNotMatch(generate({root, configs: true}).files['config.d.ts'], /"optional"/);
});

test('Config preserves raw ES namespace defaults rather than applying Service interop', t => {
  const {root, write} = fixture(t);
  write('src/config/config.ts', 'export const named = 1; export default {nested: {value: "default"}};');
  const result = generate({root, configs: true});
  assert.match(result.files['config.d.ts'], /"default.nested.value": typeof import\([^\n]+\)\["default"\]\["nested"\]\["value"\]/);
  assert.doesNotMatch(result.files['config.d.ts'], /^\s+"nested.value"/m);
  assert.match(result.files['config.d.ts'], /"named": typeof import/);
});

for (const code of [
  'module.exports = {value: 1};',
  'exports.value = 1;',
  'module.exports.value = 1;',
  'module.exports = () => ({invented: 1});',
  'module.exports = {list: [1, 2]};',
  'module.exports = {value: process.env.VALUE};',
  '/** @type {{value: string}} */ const config = {value: 1}; module.exports = config;',
  'const config = /** @type {{value: string}} */ ({value: 1}); module.exports = config;',
  'module.exports = {/** @type {string} */ value: 1};',
  'module.exports = {get value() { return 1; }};',
  'module.exports = {...other};',
  'module.exports = {["computed"]: 1};',
  'module.exports = {"dotted.key": 1};',
  'module.exports = {__proto__: {value: 1}};',
  'module.exports = {toString: undefined};',
  'module.exports = {nested: {customprototype: 1}};',
  'const config = {}; config.value = 1; export = config;',
  'const config = {}; Object.assign(config, {value: 1}); export = config;',
  'const config = {}; const sideEffect = mutate(config); export = config;',
  'let config = {}; export = config;',
  'const config = {} as any; export = config;',
  'if (true) module.exports = {value: 1};',
  'exports.value = 1; module.exports = {};'
]) {
  test(`Config diagnoses unsupported syntax before writing: ${code}`, t => {
    const {root, write} = fixture(t);
    write('src/config/config.ts', code);
    assert.throws(() => generate({root, configs: true}), {code: 'UNSUPPORTED_CONFIG'});
    if (code !== 'module.exports = {value: 1};' && code !== 'exports.value = 1;' && code !== 'module.exports.value = 1;') {
      fs.renameSync(path.join(root, 'src/config/config.ts'), path.join(root, 'src/config/config.js'));
      assert.throws(() => generate({root, configs: true}), {code: 'UNSUPPORTED_CONFIG'});
    }
    assert.equal(fs.existsSync(path.join(root, '.thinkjs')), false);
    assert.doesNotThrow(() => generate({root}), 'non-opted-in applications retain Service behavior');
  });
}

test('Config diagnoses adapters, source collisions, unsafe modules and symlinks', t => {
  const {root, write} = fixture(t);
  write('src/config/adapter.production.ts', 'export const cache = {};');
  assert.throws(() => generate({root, configs: true}), {code: 'UNSUPPORTED_CONFIG_ADAPTER'});
  fs.unlinkSync(path.join(root, 'src/config/adapter.production.ts'));
  write('src/config/config.ts', 'export const value = 1;');
  write('src/config/config.js', 'exports.value = 1;');
  assert.throws(() => generate({root, configs: true}), {code: 'CONFIG_COLLISION'});
  fs.unlinkSync(path.join(root, 'src/config/config.js'));
  fs.symlinkSync(path.join(root, 'src/config/config.ts'), path.join(root, 'src/config/config.production.ts'));
  assert.throws(() => generate({root, configs: true}), {code: 'UNSUPPORTED_SYMLINK'});
  fs.unlinkSync(path.join(root, 'src/config/config.production.ts'));
  write('src/common/config/config.ts', 'export const value = 1;');
  fs.mkdirSync(path.join(root, 'src/home,admin'));
  assert.throws(() => generate({root, configs: true}), {code: 'CONFIG_RESERVED_MODULE'});
  assert.equal(fs.existsSync(path.join(root, '.thinkjs')), false);
});

test('Config source diagnostics preserve existing outputs and check never writes', t => {
  const {root, write} = fixture(t);
  write('src/config/config.ts', 'export const value = 1;');
  const first = generate({root, configs: true});
  const before = fs.readFileSync(path.join(first.output, 'config.d.ts'), 'utf8');
  write('src/config/config.ts', 'export const added = 1;');
  assert.ok(generate({root, configs: true, check: true}).changed.includes('config.d.ts'));
  assert.equal(fs.readFileSync(path.join(first.output, 'config.d.ts'), 'utf8'), before);
  write('src/config/config.ts', 'export const unsupported = [];');
  assert.throws(() => generate({root, configs: true}), {code: 'UNSUPPORTED_CONFIG'});
  assert.equal(fs.readFileSync(path.join(first.output, 'config.d.ts'), 'utf8'), before);
});

test('Config output cleanup validates ownership before changing any generated files', t => {
  const {root, write} = fixture(t);
  write('src/config/config.ts', 'export const value = 1;');
  generate({root, configs: true});
  const before = fs.readFileSync(path.join(root, '.thinkjs/types/index.d.ts'), 'utf8');
  write('.thinkjs/types/config.d.ts', '// user replacement');
  assert.throws(() => generate({root}), {code: 'UNOWNED_OUTPUT'});
  assert.equal(fs.readFileSync(path.join(root, '.thinkjs/types/index.d.ts'), 'utf8'), before);
  fs.unlinkSync(path.join(root, '.thinkjs/types/config.d.ts'));
  fs.symlinkSync(path.join(root, 'src/config/config.ts'), path.join(root, '.thinkjs/types/config.d.ts'));
  assert.throws(() => generate({root}), {code: 'UNSAFE_OUTPUT'});
});

test('CLI --configs composes with --models and maintains independent cleanup', t => {
  const {root, write} = fixture(t);
  const cli = (...args) => spawnSync(process.execPath, [path.resolve(__dirname, '../cli.js'), ...args], {encoding: 'utf8'});
  write('src/config/config.ts', 'export const value = 1;');
  write('src/model/user.ts', 'export default class User {}');
  assert.equal(cli('check', root, '--configs', '--models').status, 1);
  assert.equal(cli('generate', root, '--models', '--configs').status, 0);
  assert.equal(cli('check', root, '--configs', '--models').status, 0);
  assert.match(fs.readFileSync(path.join(root, '.thinkjs/types/index.d.ts'), 'utf8'), /T extends ModelHost & ConfigHost/);
  assert.equal(cli('generate', root, '--models').status, 0);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/config.d.ts')), false);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/model.d.ts')), true);
});
