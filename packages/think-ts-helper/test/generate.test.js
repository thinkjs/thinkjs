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
