const assert = require('node:assert/strict');
const {execFileSync, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');
const {ESLint} = require('eslint');

const root = path.resolve(__dirname, '../..');
const tsc = require.resolve('typescript/bin/tsc');
// Invoke npm's JS entry with Node, never a platform-specific shell/batch file.
function findNpmCli() {
  const candidates = [
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')
  ];
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    candidates.push(path.join(dir, 'node_modules/npm/bin/npm-cli.js'));
    const launcher = path.join(dir, 'npm');
    if (fs.existsSync(launcher)) {
      const real = fs.realpathSync(launcher);
      if (path.basename(real) === 'npm-cli.js') candidates.push(real);
    }
  }
  const cli = candidates.find(file => fs.existsSync(file));
  assert.ok(cli, 'npm CLI is required; install a Node distribution that includes npm');
  return cli;
}
const npmCli = findNpmCli();
const fixtureRoot = path.join(__dirname, 'fixtures');

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-build-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  fs.cpSync(fixtureRoot, dir, {recursive: true});
  for (const name of ['core', 'consumer']) {
    const file = path.join(dir, name, 'tsconfig.build.json');
    const config = JSON.parse(fs.readFileSync(file, 'utf8'));
    config.extends = path.join(root, 'tsconfig.base.json');
    fs.writeFileSync(file, JSON.stringify(config));
  }
  // Mirror workspace linking without reusing any built artifacts.
  fs.mkdirSync(path.join(dir, 'node_modules/@thinkjs-build-fixture'), {recursive: true});
  for (const name of ['core', 'consumer']) {
    fs.symlinkSync(path.join(dir, name), path.join(dir, 'node_modules/@thinkjs-build-fixture', name),
      process.platform === 'win32' ? 'junction' : 'dir');
  }
  return dir;
}

function compile(dir, args, expected = 0, compiler = tsc) {
  const result = spawnSync(process.execPath, [compiler, ...args], {cwd: dir, encoding: 'utf8'});
  assert.ifError(result.error);
  assert.equal(result.status, expected, result.stdout + result.stderr);
  return result.stdout + result.stderr;
}

function outputs(dir, name) {
  return ['index.js', 'index.js.map', 'index.d.ts', 'index.d.ts.map']
    .map(file => path.join(dir, name, 'lib', file));
}

function packageCommand(dir, args) {
  return execFileSync(process.execPath, [npmCli, ...args], {
    cwd: dir, encoding: 'utf8',
    env: {...process.env,
      PATH: `${path.join(root, 'node_modules/.bin')}${path.delimiter}${process.env.PATH}`,
      npm_config_cache: path.join(dir, '.npm-cache'),
      npm_config_ignore_scripts: 'false',
      npm_config_update_notifier: 'false'
    }
  });
}

test('maintainer compiler is exactly pinned; strict CommonJS settings remain opt-in', () => {
  const manifest = require(path.join(root, 'package.json'));
  assert.equal(manifest.devDependencies.typescript, '5.9.3');
  assert.equal(require('typescript').version, manifest.devDependencies.typescript);
  const config = require(path.join(root, 'tsconfig.base.json')).compilerOptions;
  for (const option of ['strict', 'noEmitOnError', 'declaration', 'declarationMap', 'sourceMap', 'forceConsistentCasingInFileNames']) {
    assert.equal(config[option], true, option);
  }
  assert.equal(config.module, 'CommonJS');
  assert.equal(config.skipLibCheck, false);
  assert.deepEqual(config.types, []);
  for (const key of ['rootDir', 'outDir', 'composite', 'incremental']) assert.equal(config[key], undefined);
  // The app transpiler retains its separate compiler compatibility range.
  assert.equal(require(path.join(root, 'packages/think-typescript/package.json')).dependencies.typescript, '^3.5.3');
});

test('cold project references build dependencies, emit maps and preserve CommonJS shape', t => {
  const dir = fixture(t);
  compile(dir, ['-b', 'tsconfig.build.json']);
  for (const name of ['core', 'consumer']) {
    for (const file of outputs(dir, name)) assert.ok(fs.existsSync(file), file);
    for (const extension of ['js', 'd.ts']) {
      const mapPath = path.join(dir, name, `lib/index.${extension}.map`);
      const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
      assert.equal(map.file, `index.${extension}`);
      assert.deepEqual(map.sources, ['../src/index.ts']);
      assert.ok(fs.existsSync(path.resolve(path.dirname(mapPath), map.sources[0])));
    }
    const emitted = outputs(dir, name).map(file => fs.readFileSync(file, 'utf8'));
    compile(dir, ['-p', `${name}/tsconfig.build.json`, '--noEmit']);
    assert.deepEqual(outputs(dir, name).map(file => fs.readFileSync(file, 'utf8')), emitted);
  }
  const localRequire = createRequire(path.join(dir, 'package.json'));
  const describe = localRequire('@thinkjs-build-fixture/consumer');
  assert.equal(typeof describe, 'function');
  assert.equal(describe.default, undefined);
  assert.equal(describe(42), '42');
  assert.equal(describe, localRequire('@thinkjs-build-fixture/consumer/lib/index.js'));
});

test('incremental rebuild is stable and clean only removes current compiler outputs', t => {
  const dir = fixture(t);
  compile(dir, ['-b', 'tsconfig.build.json']);
  const files = ['core', 'consumer'].flatMap(name => outputs(dir, name));
  const before = files.map(file => fs.statSync(file).mtimeMs);
  compile(dir, ['-b', 'tsconfig.build.json']);
  assert.deepEqual(files.map(file => fs.statSync(file).mtimeMs), before);
  const sentinel = path.join(dir, 'core/lib/keep.txt');
  fs.writeFileSync(sentinel, 'not a compiler output');
  compile(dir, ['-b', 'tsconfig.build.json', '--clean']);
  for (const file of files) assert.equal(fs.existsSync(file), false, file);
  for (const name of ['core', 'consumer']) {
    assert.ok(fs.existsSync(path.join(dir, name, 'src/index.ts')));
    assert.equal(fs.existsSync(path.join(dir, name, '.build/tsconfig.tsbuildinfo')), false);
  }
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'not a compiler output');
  compile(dir, ['-b', 'tsconfig.build.json']);
  for (const file of files) assert.ok(fs.existsSync(file), file);
});

test('semantic errors fail before publishing invalid package output', t => {
  const dir = fixture(t);
  fs.writeFileSync(path.join(dir, 'core/src/index.ts'), 'const value: number = "wrong"; export = value;\n');
  const output = compile(dir, ['-b', 'core/tsconfig.build.json'], 1);
  assert.match(output, /TS2322/);
  for (const file of outputs(dir, 'core')) assert.equal(fs.existsSync(file), false);
});

test('changed dependency declarations invalidate the dependent package', t => {
  const dir = fixture(t);
  compile(dir, ['-b', 'tsconfig.build.json']);
  fs.writeFileSync(path.join(dir, 'core/src/index.ts'),
    'function wrap(value: string): {value: string} { return {value}; } export = wrap;\n');
  const diagnostic = compile(dir, ['-b', 'tsconfig.build.json'], 2);
  assert.ok(diagnostic.replaceAll('\\', '/').includes('consumer/src/index.ts'), diagnostic);
  assert.match(diagnostic, /TS2345/);
  assert.match(fs.readFileSync(path.join(dir, 'core/lib/index.d.ts'), 'utf8'), /value: string/);
});

test('prepack refuses semantic errors even when stale build artifacts exist', t => {
  const dir = fixture(t);
  compile(dir, ['-b', 'tsconfig.build.json']);
  const output = path.join(dir, 'core/lib/index.js');
  const previous = fs.readFileSync(output, 'utf8');
  fs.writeFileSync(path.join(dir, 'core/src/index.ts'), 'const value: number = "wrong"; export = value;\n');
  assert.throws(() => packageCommand(path.join(dir, 'core'), ['pack', '--json', '--pack-destination', dir]), error => {
    assert.notEqual(error.status, 0);
    assert.match(String(error.stdout) + String(error.stderr), /TS2322/);
    return true;
  });
  assert.equal(fs.readFileSync(output, 'utf8'), previous);
  assert.equal(fs.readdirSync(dir).some(file => file.endsWith('.tgz')), false);
});

test('cyclic project references fail explicitly instead of running in an arbitrary order', t => {
  const dir = fixture(t);
  const file = path.join(dir, 'core/tsconfig.build.json');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  config.references = [{path: '../consumer/tsconfig.build.json'}];
  fs.writeFileSync(file, JSON.stringify(config));
  assert.match(compile(dir, ['-b', 'tsconfig.build.json'], 4), /TS6202/);
  for (const name of ['core', 'consumer']) {
    for (const file of outputs(dir, name)) assert.equal(fs.existsSync(file), false);
  }
});

test('prepack rebuilds cold artifacts; isolated installed packages include usable source maps and declarations', t => {
  const dir = fixture(t);
  const tarballs = path.join(dir, 'tarballs');
  fs.mkdirSync(tarballs);
  const archives = [];
  for (const name of ['core', 'consumer']) {
    const output = packageCommand(path.join(dir, name), ['pack', '--json', '--pack-destination', tarballs]);
    const [packed] = JSON.parse(output.slice(output.indexOf('[\n')));
    assert.deepEqual(packed.files.map(file => file.path).sort(), [
      'lib/index.d.ts', 'lib/index.d.ts.map', 'lib/index.js', 'lib/index.js.map', 'package.json', 'src/index.ts'
    ]);
    archives.push(path.join(tarballs, packed.filename));
  }
  const install = path.join(dir, 'installed');
  fs.mkdirSync(install);
  fs.writeFileSync(path.join(install, 'package.json'), '{"private":true}');
  // Both dependencies are local tarballs. No install scripts or registry fallback.
  packageCommand(install, ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', ...archives]);
  const installedRequire = createRequire(path.join(install, 'package.json'));
  const describe = installedRequire('@thinkjs-build-fixture/consumer');
  assert.equal(describe(7), '7');
  assert.equal(describe.default, undefined);
  for (const name of ['core', 'consumer']) {
    const installed = path.dirname(installedRequire.resolve(`@thinkjs-build-fixture/${name}/package.json`));
    for (const extension of ['js', 'd.ts']) {
      const mapFile = path.join(installed, `lib/index.${extension}.map`);
      const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
      assert.ok(fs.existsSync(path.resolve(path.dirname(mapFile), map.sources[0])));
    }
  }
  fs.writeFileSync(path.join(install, 'consumer.ts'), [
    "import wrap = require('@thinkjs-build-fixture/core');",
    "import describe = require('@thinkjs-build-fixture/consumer');",
    'const wrapped: {value: number} = wrap(123);',
    'const text: string = describe(wrapped.value);',
    '// @ts-expect-error The declaration must retain the argument contract.',
    "describe('wrong');",
    '// @ts-expect-error Generic inference must not degrade to any.',
    'const incorrect: string = wrap(123).value;',
    'void text; void incorrect;'
  ].join('\n'));
  fs.writeFileSync(path.join(install, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {strict: true, noEmit: true, skipLibCheck: false, types: [], target: 'ES2018', module: 'CommonJS'},
    files: ['consumer.ts']
  }));
  // These fixtures intentionally use declarations compatible with both tested
  // versions. This does not set a framework-wide minimum consumer TS version.
  const appRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
  assert.equal(appRequire('typescript').version, '3.9.10');
  for (const compiler of [appRequire.resolve('typescript/bin/tsc'), tsc]) {
    compile(install, ['-p', 'tsconfig.json'], 0, compiler);
  }
  // Prove the negative assertions actually detect lost constraints.
  const positiveOnly = fs.readFileSync(path.join(install, 'consumer.ts'), 'utf8').replace(/\/\/ @ts-expect-error[^\n]*/g, '');
  fs.writeFileSync(path.join(install, 'consumer.ts'), positiveOnly);
  assert.match(compile(install, ['-p', 'tsconfig.json'], 2), /TS2345/);
});

test('TS source lint accepts typed CommonJS and diagnoses explicit any and unused locals', async () => {
  const eslint = new ESLint({cwd: root, overrideConfigFile: path.join(root, 'eslint.typescript.config.cjs')});
  const filePath = path.join(root, 'packages/build-test/src/index.ts');
  const [valid] = await eslint.lintText("import wrap = require('wrapped');\nconst value: number = 1;\nexport = wrap(value);\n", {filePath});
  assert.equal(valid.errorCount, 0, JSON.stringify(valid.messages));
  const [invalid] = await eslint.lintText('const unused: any = 1;\nexport {};\n', {filePath});
  const rules = invalid.messages.map(message => message.ruleId);
  assert.ok(rules.includes('@typescript-eslint/no-explicit-any'));
  assert.ok(rules.includes('@typescript-eslint/no-unused-vars'));
});
