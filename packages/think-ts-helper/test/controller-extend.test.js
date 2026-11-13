'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {generate} = require('..');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-ts-extend-'));
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

test('Controller extension generation is opt-in, deterministic and preserves exact source types', t => {
  const {root, write} = fixture(t);
  write('src/config/extend.ts', 'export default [{controller: {shared() { return 1; }, before: true}}, {controller: {shared() { return "plugin"; }}}] as const;');
  write('src/extend/controller.ts', 'const ctl = {get shared() { return false; }, after() { throw new Error("not executed"); }}; export = ctl;');
  const plain = generate({root});
  const first = generate({root, controllerExtends: true});
  assert.match(first.files['controller-extend.d.ts'], /Pick<typeof import\("..\/..\/src\/config\/extend"\).default\[0\]\["controller"\], "before">/);
  assert.doesNotMatch(first.files['controller-extend.d.ts'], /\.default\[1\]/);
  assert.match(first.files['controller-extend.d.ts'], /Pick<typeof import\("..\/..\/src\/extend\/controller"\), "after" \| "shared">/);
  assert.equal(first.diagnostics.length, 2);
  assert.equal(first.diagnostics[0].code, 'CONTROLLER_EXTEND_OVERRIDE');
  assert.deepEqual(first.manifest.controllerExtends.members, ['after', 'before', 'shared']);
  assert.deepEqual(generate({root, controllerExtends: true}).changed, []);
  write('.thinkjs/types/user.d.ts', '// retained');
  assert.deepEqual(generate({root, check: true}).removed, ['controller-extend.d.ts']);
  assert.equal(fs.existsSync(path.join(first.output, 'controller-extend.d.ts')), true);
  assert.deepEqual(generate({root}).files, plain.files);
  assert.equal(fs.existsSync(path.join(first.output, 'controller-extend.d.ts')), false);
  assert.equal(fs.readFileSync(path.join(first.output, 'user.d.ts'), 'utf8'), '// retained');
});

test('Multi-module Controller extensions come only from common, not per-module overrides', t => {
  const {root, write} = fixture(t);
  write('src/common/config/extend.ts', 'const config = {controller: {shared: 1}}; export = config;');
  write('src/common/extend/controller.ts', 'export default {shared: "common"};');
  write('src/home/extend/controller.ts', 'throw new Error("runtime ignores this file");');
  write('src/home/config/extend.ts', 'throw new Error("runtime ignores this file too");');
  const result = generate({root, controllerExtends: true});
  assert.deepEqual(result.manifest.controllerExtends.files, ['src/common/config/extend.ts', 'src/common/extend/controller.ts']);
  assert.doesNotMatch(result.files['controller-extend.d.ts'], /home/);
  fs.unlinkSync(path.join(root, 'src/common/extend/controller.ts'));
  assert.ok(generate({root, controllerExtends: true, check: true}).changed.includes('controller-extend.d.ts'));
  assert.doesNotMatch(generate({root, controllerExtends: true}).files['controller-extend.d.ts'], /src\/common\/extend\/controller/);
});

for (const content of [
  'export default {["computed"]: 1};',
  'export default {1: 1};',
  'export default {set value(next: string) {}};',
  'export default {...other};',
  'export default {__proto__: {poison: true}};',
  'export default {prototype: 1};',
  'export default {constructor() {}};',
  'export default {same: 1, same: 2};',
  'export default {get same() { return 1; }, same: 2};',
  'export default {dynamic: getValue()};',
  'export default {array: [getValue()]};',
  'export default {} as any;',
  'const value: {hidden?: string} = {}; export default value;',
  'let value = {}; export default value;',
  'const value = {}; value.changed = 1; export default value;',
  'const value = {}; const sideEffect = mutate(value); export default value;',
  'const value = {}; Object.assign(value, {changed: 1}); export default value;',
  'import plugin from "plugin"; export default plugin;',
  'export {default} from "plugin";',
  'export const method = () => 1;',
  'module.exports = {value: 1};',
  'const first = second; const second = first; export default first;'
]) {
  test(`Controller extension diagnoses unsupported source without output: ${content}`, t => {
    const {root, write} = fixture(t);
    write('src/extend/controller.ts', content);
    assert.throws(() => generate({root, controllerExtends: true}), {code: 'UNSUPPORTED_CONTROLLER_EXTEND'});
    assert.equal(fs.existsSync(path.join(root, '.thinkjs')), false);
    assert.doesNotThrow(() => generate({root}));
  });
}

for (const content of [
  'export default [{controller: {value: 1}}];',
  'export default [{controller: {value: 1}}, ...other] as const;',
  'export default {controller: {}, context: {}};',
  'export default {logic: {}};',
  'export default () => ({controller: {}});',
  'export default {get controller() { return {}; }};'
]) {
  test(`Controller plugin diagnoses unsupported configuration: ${content}`, t => {
    const {root, write} = fixture(t);
    write('src/config/extend.ts', content);
    assert.throws(() => generate({root, controllerExtends: true}), {code: 'UNSUPPORTED_CONTROLLER_EXTEND'});
  });
}

for (const key of ['ctx', 'model', 'service', 'config', 'body', 'action']) {
  test(`Controller extension protects existing ${key} contract`, t => {
    const {root, write} = fixture(t);
    write('src/extend/controller.ts', `export default {${key}: 1};`);
    assert.throws(() => generate({root, controllerExtends: true}), {code: 'CONTROLLER_EXTEND_RESERVED'});
  });
}

test('Controller accessor replacement matches descriptor copying, not object spread semantics', t => {
  const {root, write} = fixture(t);
  write('src/config/extend.ts', 'export default {controller: {get value() { return 1; }, set value(next: number) {}}};');
  write('src/extend/controller.ts', 'export default {value: "not a descriptor replacement"};');
  assert.throws(() => generate({root, controllerExtends: true}), {code: 'CONTROLLER_EXTEND_DESCRIPTOR'});
  write('src/extend/controller.ts', 'export default {get value() { return "new getter retains old setter"; }};');
  assert.throws(() => generate({root, controllerExtends: true}), {code: 'CONTROLLER_EXTEND_DESCRIPTOR'});
  const merge = require('../../think-loader/loader/util').extend;
  const target = {get value() { return 1; }, set value(next) {}};
  const oldSetter = Object.getOwnPropertyDescriptor(target, 'value').set;
  merge(target, {get value() { return 'updated'; }});
  assert.equal(Object.getOwnPropertyDescriptor(target, 'value').set, oldSetter);
  assert.equal(target.value, 'updated');
  write('src/extend/controller.ts', 'export default {get value() { return "new pair"; }, set value(next: string) {}};');
  const result = generate({root, controllerExtends: true});
  assert.doesNotMatch(result.files['controller-extend.d.ts'], /config\/extend/);
  assert.equal(result.diagnostics.length, 1);
});

test('Controller diagnostics preserve old output and validate source/output ownership', t => {
  const {root, write} = fixture(t);
  write('src/extend/controller.ts', 'export default {value: 1};');
  const first = generate({root, controllerExtends: true});
  const before = fs.readFileSync(path.join(first.output, 'controller-extend.d.ts'), 'utf8');
  write('src/extend/controller.ts', 'export default {value: 1, added: true};');
  assert.ok(generate({root, controllerExtends: true, check: true}).changed.includes('controller-extend.d.ts'));
  assert.equal(fs.readFileSync(path.join(first.output, 'controller-extend.d.ts'), 'utf8'), before);
  write('src/extend/controller.js', 'module.exports = {};');
  assert.throws(() => generate({root, controllerExtends: true}), {code: 'CONTROLLER_EXTEND_COLLISION'});
  assert.equal(fs.readFileSync(path.join(first.output, 'controller-extend.d.ts'), 'utf8'), before);
  fs.unlinkSync(path.join(root, 'src/extend/controller.js'));
  write('.thinkjs/types/controller-extend.d.ts', '// user replacement');
  assert.throws(() => generate({root}), {code: 'UNOWNED_OUTPUT'});
  assert.throws(() => generate({root, controllerExtends: true}), {code: 'UNOWNED_OUTPUT'});
  fs.unlinkSync(path.join(first.output, 'controller-extend.d.ts'));
  fs.symlinkSync(path.join(root, 'src/extend/controller.ts'), path.join(first.output, 'controller-extend.d.ts'));
  assert.throws(() => generate({root}), {code: 'UNSAFE_OUTPUT'});
});

test('Controller generation rejects source links, wrong casing and JavaScript shapes', t => {
  const {root, write} = fixture(t);
  write('src/extend/Controller.ts', 'export default {};');
  assert.throws(() => generate({root, controllerExtends: true}), {code: 'CONTROLLER_EXTEND_CASE'});
  fs.renameSync(path.join(root, 'src/extend/Controller.ts'), path.join(root, 'src/extend/controller.js'));
  assert.throws(() => generate({root, controllerExtends: true}), {code: 'UNSUPPORTED_CONTROLLER_EXTEND'});
  fs.unlinkSync(path.join(root, 'src/extend/controller.js'));
  write('outside.ts', 'export default {};');
  fs.symlinkSync(path.join(root, 'outside.ts'), path.join(root, 'src/extend/controller.ts'));
  assert.throws(() => generate({root, controllerExtends: true}), {code: 'UNSUPPORTED_SYMLINK'});
});

test('Controller CLI composes options and cleans up only the disabled slice', t => {
  const {root, write} = fixture(t);
  write('src/config/extend.ts', 'export default {controller: {value: 1}};');
  write('src/extend/controller.ts', 'export default {value: "new"};');
  write('src/config/config.ts', 'export const option = true;');
  const cli = (...args) => spawnSync(process.execPath, [path.resolve(__dirname, '../cli.js'), ...args], {encoding: 'utf8'});
  assert.equal(cli('check', root, '--controller-extends').status, 1);
  const result = cli('generate', root, '--controller-extends', '--models', '--configs');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /CONTROLLER_EXTEND_OVERRIDE/);
  assert.match(fs.readFileSync(path.join(root, '.thinkjs/types/index.d.ts'), 'utf8'), /AppExtendedController<T extends ModelHost & ConfigHost/);
  assert.equal(cli('check', root, '--controller-extends', '--models', '--configs').status, 0);
  assert.equal(cli('generate', root, '--models', '--configs').status, 0);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/controller-extend.d.ts')), false);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/model.d.ts')), true);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/config.d.ts')), true);
});
