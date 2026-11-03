const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'think-debounce-pack-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
try {
  const output = execFileSync(npm, ['pack', '--json', '--pack-destination', temporary], {
    cwd: root, encoding: 'utf8', env: {...process.env, npm_config_ignore_scripts: 'false'}
  });
  // npm versions may print lifecycle output before the JSON result.
  const [packed] = JSON.parse(output.slice(output.indexOf('[\n')));
  assert.deepEqual(packed.files.map(file => file.path).sort(), [
    'LICENSE', 'README.md', 'index.d.ts', 'index.js', 'package.json'
  ]);
  fs.writeFileSync(path.join(temporary, 'package.json'), '{"private":true}');
  execFileSync(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', path.join(temporary, packed.filename)], {cwd: temporary, stdio: 'pipe'});
  const installed = path.join(temporary, 'node_modules/think-debounce');
  const Debounce = require(installed);
  assert.equal(typeof Debounce, 'function');
  assert.equal(Debounce, require(path.join(installed, 'index.js')));
  assert.equal(Debounce.default, undefined);
  const consumer = fs.readFileSync(path.join(__dirname, 'types/consumer.ts'), 'utf8').replace("require('../..')", "require('think-debounce')");
  fs.writeFileSync(path.join(temporary, 'consumer.ts'), consumer);
  fs.copyFileSync(path.join(__dirname, 'types/tsconfig.json'), path.join(temporary, 'tsconfig.json'));
  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', path.join(temporary, 'tsconfig.json')], {stdio: 'pipe'});
  // Run all runtime regression tests against the installed tarball too.
  fs.copyFileSync(path.join(__dirname, 'regression.js'), path.join(installed, 'regression.js'));
  const test = fs.readFileSync(path.join(installed, 'regression.js'), 'utf8').replace("require('..')", "require('./index.js')").replace("require('../index.js')", "require('./index.js')");
  fs.writeFileSync(path.join(installed, 'regression.js'), test);
  execFileSync(process.execPath, ['--test', path.join(installed, 'regression.js')], {stdio: 'inherit'});
  process.stdout.write('Packed-file layout, JS consumers, and strict TS consumers passed.\n');
} finally {
  fs.rmSync(temporary, {recursive: true, force: true});
}
