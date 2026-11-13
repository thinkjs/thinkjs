const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');

const root = path.resolve(__dirname, '../..');
const compiler = require.resolve('typescript/bin/tsc');
const c8 = require.resolve('c8/bin/c8.js');

function run(cwd, args) {
  const env = {...process.env};
  // Keep this isolated c8 run out of an enclosing root coverage invocation.
  delete env.NODE_V8_COVERAGE;
  const result = spawnSync(process.execPath, args, {cwd, env, encoding: 'utf8'});
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
}

function readLcov(file) {
  const records = new Map();
  for (const section of fs.readFileSync(file, 'utf8').split('end_of_record')) {
    const source = section.match(/^SF:(.+)$/m);
    if (!source) continue;
    const name = source[1].replaceAll('\\', '/');
    assert.equal(records.has(name), false, `Duplicate LCOV source: ${name}`);
    records.set(name, {
      lines: [...section.matchAll(/^DA:(\d+),(\d+)/gm)].map(match => ({line: +match[1], hits: +match[2]})),
      functions: [...section.matchAll(/^FNDA:(\d+),/gm)].map(match => +match[1]),
      section
    });
  }
  return records;
}

test('aggregate c8 retains mapped production TS and untested files without generated or declaration duplicates', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-coverage-map-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const write = (file, contents) => {
    const target = path.join(dir, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, contents);
  };
  write('packages/mapped/src/index.ts', [
    'export function choose(enabled: boolean): string {',
    '  if (enabled) {',
    "    return 'covered';",
    '  }',
    "  return 'uncovered';",
    '}', ''
  ].join('\n'));
  write('packages/mapped/src/unused.ts', "export function unused(): string {\n  return 'not executed';\n}\n");
  write('packages/mapped/src/index.test.ts', "export const testOnly: string = 'excluded';\n");
  write('packages/mapped/test/fixture.ts', "export const fixtureOnly: string = 'excluded';\n");
  write('packages/mapped/eslint.config.ts', 'export default [];\n');
  write('packages/mapped/webpack.config.ts', 'export default {};\n');
  write('packages/mapped/index.d.ts', "export * from './lib/index';\n");
  write('packages/mapped/index.js', "module.exports = require('./lib/index.js');\n");
  write('packages/mapped/tsconfig.build.json', JSON.stringify({
    extends: path.join(root, 'tsconfig.base.json'),
    compilerOptions: {rootDir: 'src', outDir: 'lib'},
    include: ['src/**/*.ts']
  }));
  write('packages/legacy/index.js', "module.exports = function legacy() { return 42; };\n");
  write('packages/legacy/unused.js', "module.exports = function unused() { return 0; };\n");
  write('packages/legacy/test/helper.js', "module.exports = 'test';\n");
  // This legacy duplicate-source exclusion must survive the TS inclusion change.
  write('packages/think-model/src/index.js', "module.exports = 'duplicate legacy source';\n");
  write('run.cjs', [
    "require('./packages/mapped').choose(true);",
    "require('./packages/mapped/lib/index.test.js');",
    "require('./packages/legacy')();",
    "require('./packages/legacy/test/helper.js');",
    "require('./packages/think-model/src/index.js');", ''
  ].join('\n'));

  run(dir, [compiler, '-p', 'packages/mapped/tsconfig.build.json']);
  run(dir, [c8, '--config', path.join(root, '.c8rc.json'),
    '--reports-dir', path.join(dir, 'coverage'), '--temp-directory', path.join(dir, 'v8'),
    '--reporter=lcovonly', process.execPath, 'run.cjs']);
  const records = readLcov(path.join(dir, 'coverage/lcov.info'));
  assert.deepEqual([...records.keys()].sort(), [
    'packages/legacy/index.js',
    'packages/legacy/unused.js',
    'packages/mapped/index.js',
    'packages/mapped/src/index.ts',
    'packages/mapped/src/unused.ts'
  ]);
  const mapped = records.get('packages/mapped/src/index.ts');
  assert.ok(mapped.lines.some(line => line.line === 3 && line.hits > 0), mapped.section);
  assert.ok(mapped.lines.some(line => line.line === 5 && line.hits === 0), mapped.section);
  assert.ok(mapped.functions.some(hits => hits > 0), mapped.section);
  assert.ok(records.get('packages/legacy/index.js').lines.some(line => line.hits > 0));
  for (const file of ['packages/legacy/unused.js', 'packages/mapped/src/unused.ts']) {
    const record = records.get(file);
    assert.ok(record.lines.length > 0, file);
    assert.ok(record.lines.every(line => line.hits === 0), record.section);
  }
});
