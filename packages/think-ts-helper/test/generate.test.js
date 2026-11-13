'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {generate} = require('..');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-ts-helper-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const write = (file, content = 'export default class Service {}\n') => {
    fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
    fs.writeFileSync(path.join(root, file), content);
  };
  fs.mkdirSync(path.join(root, 'src'));
  return {root, write};
}

test('deterministic nested TS/JS discovery never executes sources; check is read-only', t => {
  const {root, write} = fixture(t);
  write('src/service/z.js', 'throw new Error("must not execute"); module.exports = {};');
  write('src/service/a/deep.ts');
  write('src/service/ignored.d.ts');
  write('src/service/.hidden.ts');
  const check = generate({root, check: true});
  assert.equal(check.changed.length, 3);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs')), false);
  const first = generate({root});
  assert.deepEqual(Object.keys(first.manifest.modules.__single__), ['a/deep', 'z']);
  assert.match(first.files['service.d.ts'], /typeof import\("..\/..\/src\/service\/a\/deep"\)/);
  assert.deepEqual(generate({root}).changed, []);
  assert.deepEqual(generate({root, check: true}).files, first.files);
  write('.thinkjs/types/user.d.ts', '// preserve');
  fs.renameSync(path.join(root, 'src/service/z.js'), path.join(root, 'src/service/renamed.js'));
  fs.unlinkSync(path.join(root, 'src/service/a/deep.ts'));
  write('src/service/new.ts');
  const updated = generate({root});
  assert.deepEqual(Object.keys(updated.manifest.modules.__single__), ['new', 'renamed']);
  assert.equal(fs.readFileSync(path.join(root, '.thinkjs/types/user.d.ts'), 'utf8'), '// preserve');
  assert.equal(fs.readdirSync(updated.output).some(name => name.endsWith('.tmp')), false);
});

test('loader common/config detection, common fallback and local overrides', t => {
  const {root, write} = fixture(t);
  write('src/common/config/config.ts');
  write('src/common/service/shared.ts');
  write('src/common/service/overridden.ts');
  write('src/home/service/overridden.js');
  write('src/home/service/local.ts');
  fs.mkdirSync(path.join(root, 'src/admin'));
  const {manifest} = generate({root});
  assert.equal(manifest.layout, 'multi');
  assert.deepEqual(manifest.modules.home, {local: 'src/home/service/local.ts', overridden: 'src/home/service/overridden.js', shared: 'src/common/service/shared.ts'});
  assert.deepEqual(manifest.modules.admin, manifest.modules.common);
});

test('does not infer multi-module layout merely from common service directory', t => {
  const {root, write} = fixture(t);
  write('src/common/service/ignored.ts');
  write('src/service/actual.ts');
  assert.equal(generate({root}).manifest.layout, 'single');
});

for (const files of [['src/service/a.ts', 'src/service/a.js'], ['src/service/A.ts', 'src/service/a.ts'], ['src/common/config/a.ts', 'src/common/service/A.ts', 'src/home/service/a.ts']]) {
  test(`diagnoses collision: ${files.join(', ')}`, t => {
    const {root, write} = fixture(t);
    files.forEach(file => write(file));
    assert.throws(() => generate({root}), {code: 'SERVICE_COLLISION'});
    assert.equal(fs.existsSync(path.join(root, '.thinkjs')), false);
  });
}

test('refuses reserved module names and module case collisions', t => {
  const {root, write} = fixture(t);
  write('src/common/config/config.ts');
  write('src/__single__/service/a.ts');
  assert.throws(() => generate({root}), {code: 'RESERVED_MODULE'});
  fs.rmSync(path.join(root, 'src/__single__'), {recursive: true});
  fs.mkdirSync(path.join(root, 'src/home'));
  fs.mkdirSync(path.join(root, 'src/Home'));
  assert.throws(() => generate({root}), {code: 'SERVICE_COLLISION'});
});

test('refuses unowned outputs before any write', t => {
  const {root, write} = fixture(t);
  write('src/service/a.ts');
  write('.thinkjs/types/index.d.ts', '// user file');
  assert.throws(() => generate({root}), {code: 'UNOWNED_OUTPUT'});
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/service.d.ts')), false);
});

test('rejects symlink services rather than traversing or executing targets', t => {
  const {root, write} = fixture(t);
  write('src/service/a.ts');
  fs.symlinkSync(path.join(root, 'src/service/a.ts'), path.join(root, 'src/service/b.ts'));
  assert.throws(() => generate({root}), {code: 'UNSUPPORTED_SYMLINK'});
});

test('CLI generates, detects drift without writing, validates arguments', t => {
  const {root, write} = fixture(t);
  const cli = (...args) => spawnSync(process.execPath, [path.resolve(__dirname, '../cli.js'), ...args], {encoding: 'utf8'});
  write('src/service/a.ts');
  assert.equal(cli('check', root).status, 1);
  assert.equal(cli('generate', root).status, 0);
  assert.equal(cli('check', root).status, 0);
  write('src/service/b.js');
  assert.equal(cli('check', root).status, 1);
  assert.doesNotMatch(fs.readFileSync(path.join(root, '.thinkjs/types/service.d.ts'), 'utf8'), /"b":/);
  assert.equal(cli('generate', root, '--bad').status, 1);
  assert.equal(cli('generate', root, '--source-dir').status, 1);
});

test('selects actual default export without unwrapping CommonJS default properties', t => {
  const {root, write} = fixture(t);
  write('src/service/es.ts', 'export default class ES { method() { return 1; } }');
  write('src/service/cjs.js', 'module.exports = {default: {method() { return 2; }}, other: 3};');
  write('src/service/equals.ts', 'class Equals {} export = Equals;');
  const text = generate({root}).files['service.d.ts'];
  assert.match(text, /"es": typeof import\([^\n]+\)\.default;/);
  assert.match(text, /"cjs": typeof import\([^\n]+\);/);
  assert.match(text, /"equals": typeof import\([^\n]+\);/);
});

for (const code of ['export const named = {};', 'module.exports = {}; exports.__esModule = true;', 'if (true) { module.exports = {}; }', 'export {default} from "./other";', 'const unused = {};']) {
  test(`rejects unsupported exports: ${code}`, t => {
    const {root, write} = fixture(t);
    write('src/service/a.ts', code);
    assert.throws(() => generate({root}), {code: 'UNSUPPORTED_EXPORT'});
  });
}

test('ignores dependency services and rejects output/source overlap and output symlinks', t => {
  const {root, write} = fixture(t);
  write('src/service/a.ts');
  write('src/service/node_modules/ignored.ts', 'not even valid typescript');
  assert.deepEqual(Object.keys(generate({root}).manifest.modules.__single__), ['a']);
  assert.throws(() => generate({root, outDir: 'src/generated'}), {code: 'UNSAFE_OUTPUT'});
  fs.mkdirSync(path.join(root, 'destination'));
  fs.symlinkSync(path.join(root, 'destination'), path.join(root, 'linked'), 'dir');
  assert.throws(() => generate({root, outDir: 'linked/types'}), {code: 'UNSAFE_OUTPUT'});
});

test('Model generation is explicit, deterministic, non-executing, and preserves source references', t => {
  const {root, write} = fixture(t);
  write('src/service/service.ts');
  write('src/model/side-effect.js', 'throw new Error("never execute models"); module.exports = class Model {};');
  write('src/model/nested/item.ts', 'class Item {} export = Item;');
  write('src/model/default.ts', 'export default class Model {}');
  const plain = generate({root});
  assert.equal(plain.manifest.models, undefined);
  assert.equal(plain.files['model.d.ts'], undefined);
  assert.doesNotMatch(plain.files['index.d.ts'], /think-model/);
  const first = generate({root, models: true});
  assert.deepEqual(Object.keys(first.manifest.models.__single__), ['default', 'nested/item', 'side-effect']);
  assert.match(first.files['model.d.ts'], /"default": typeof import\([^\n]+\)\.default;/);
  assert.match(first.files['model.d.ts'], /"nested\/item": typeof import\([^\n]+\);/);
  assert.match(first.files['model.d.ts'], /"side-effect": typeof import\([^\n]+\);/);
  assert.match(first.files['index.d.ts'], /AppContext<T extends ModelHost, M extends string = string>/);
  assert.deepEqual(generate({root, models: true}).changed, []);
  fs.renameSync(path.join(root, 'src/model/default.ts'), path.join(root, 'src/model/renamed.ts'));
  fs.unlinkSync(path.join(root, 'src/model/nested/item.ts'));
  const stale = generate({root, models: true, check: true});
  assert.ok(stale.changed.includes('model.d.ts'));
  assert.match(fs.readFileSync(path.join(root, '.thinkjs/types/model.d.ts'), 'utf8'), /"default":/);
  const updated = generate({root, models: true});
  assert.deepEqual(Object.keys(updated.manifest.models.__single__), ['renamed', 'side-effect']);
  write('.thinkjs/types/user.d.ts', '// preserve');
  assert.ok(generate({root, check: true}).removed.includes('model.d.ts'));
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/model.d.ts')), true);
  const disabled = generate({root});
  assert.deepEqual(disabled.removed, ['model.d.ts']);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/model.d.ts')), false);
  assert.equal(fs.readFileSync(path.join(root, '.thinkjs/types/user.d.ts'), 'utf8'), '// preserve');
  assert.deepEqual(disabled.files, plain.files, 'disabling returns to the exact service-only outputs');
});

test('Model common inheritance and override maps follow the loader', t => {
  const {root, write} = fixture(t);
  write('src/common/config/config.ts');
  write('src/common/model/shared.ts');
  write('src/common/model/nested/item.ts');
  write('src/admin/model/shared.js');
  fs.mkdirSync(path.join(root, 'src/empty'));
  const {manifest} = generate({root, models: true});
  assert.deepEqual(manifest.models.empty, manifest.models.common);
  assert.deepEqual(manifest.models.admin, {'nested/item': 'src/common/model/nested/item.ts', shared: 'src/admin/model/shared.js'});
});

for (const files of [['src/model/a.ts', 'src/model/a.js'], ['src/model/A.ts', 'src/model/a.ts'], ['src/common/config/a.ts', 'src/common/model/A.ts', 'src/admin/model/a.ts']]) {
  test(`Model collision before any write: ${files.join(', ')}`, t => {
    const {root, write} = fixture(t);
    files.forEach(file => write(file));
    assert.throws(() => generate({root, models: true}), {code: 'MODEL_COLLISION'});
    assert.equal(fs.existsSync(path.join(root, '.thinkjs')), false);
  });
}

test('Model outputs preserve ownership on enable/disable and never follow symlinks', t => {
  const {root, write} = fixture(t);
  write('src/model/a.ts');
  write('.thinkjs/types/model.d.ts', '// user registry');
  assert.throws(() => generate({root, models: true}), {code: 'UNOWNED_OUTPUT'});
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/service.d.ts')), false);
  fs.unlinkSync(path.join(root, '.thinkjs/types/model.d.ts'));
  generate({root, models: true});
  const before = fs.readFileSync(path.join(root, '.thinkjs/types/index.d.ts'), 'utf8');
  write('.thinkjs/types/model.d.ts', '// user replacement');
  assert.throws(() => generate({root}), {code: 'UNOWNED_OUTPUT'});
  assert.equal(fs.readFileSync(path.join(root, '.thinkjs/types/index.d.ts'), 'utf8'), before);
  fs.unlinkSync(path.join(root, '.thinkjs/types/model.d.ts'));
  fs.symlinkSync(path.join(root, 'src/model/a.ts'), path.join(root, '.thinkjs/types/model.d.ts'));
  assert.throws(() => generate({root}), {code: 'UNSAFE_OUTPUT'});
  fs.symlinkSync(path.join(root, 'src/model/a.ts'), path.join(root, 'src/model/b.ts'));
  assert.throws(() => generate({root, models: true}), {code: 'UNSUPPORTED_SYMLINK'});
});

test('CLI --models enables generation and read-only drift checks', t => {
  const {root, write} = fixture(t);
  const cli = (...args) => spawnSync(process.execPath, [path.resolve(__dirname, '../cli.js'), ...args], {encoding: 'utf8'});
  write('src/model/a.ts');
  assert.equal(cli('check', root, '--models').status, 1);
  assert.equal(cli('generate', '--models', root).status, 0);
  assert.equal(cli('check', root, '--models').status, 0);
  write('src/model/b.ts');
  assert.equal(cli('check', root, '--models').status, 1);
  assert.doesNotMatch(fs.readFileSync(path.join(root, '.thinkjs/types/model.d.ts'), 'utf8'), /"b":/);
  assert.equal(cli('generate', root).status, 0);
  assert.equal(fs.existsSync(path.join(root, '.thinkjs/types/model.d.ts')), false);
});

for (const file of ['src/model/__proto__.ts', 'src/__proto__/model/item.ts']) {
  test(`rejects prototype-mutating Model layout: ${file}`, t => {
    const {root, write} = fixture(t);
    write(file);
    if (file.startsWith('src/__proto__/')) write('src/common/config/config.ts');
    assert.throws(() => generate({root, models: true}), {code: 'MODEL_RESERVED_NAME'});
    assert.equal(fs.existsSync(path.join(root, '.thinkjs')), false);
  });
}

test('without Model opt-in, unsupported model sources do not affect service generation', t => {
  const {root, write} = fixture(t);
  write('src/service/valid.ts');
  write('src/model/dynamic.js', 'if (true) module.exports = {};');
  assert.doesNotThrow(() => generate({root}));
  assert.throws(() => generate({root, models: true}), {code: 'UNSUPPORTED_EXPORT'});
});
