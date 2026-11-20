const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');
const { pathToFileURL } = require('node:url');
const { test } = require('node:test');

const detector = join(__dirname, 'changed-packages.cjs');
const zeroSha = '0'.repeat(40);

function setup(t) {
  const temp = mkdtempSync(join(tmpdir(), 'thinkjs-release-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const cwd = join(temp, 'source');
  mkdirSync(cwd);

  function git(args, directory = cwd) {
    return execFileSync('git', args, { cwd: directory, encoding: 'utf8' }).trim();
  }

  git(['init', '--quiet', '--object-format=sha1']);
  git(['config', 'user.name', 'Fixture']);
  git(['config', 'user.email', 'fixture@example.com']);

  function write(file, data) {
    const path = join(cwd, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data));
  }

  function commit() {
    git(['add', '-A']);
    git(['commit', '--quiet', '-m', 'fixture']);
    return git(['rev-parse', 'HEAD']);
  }

  function detect(before, after, directory = cwd) {
    const output = join(temp, 'output');
    writeFileSync(output, '');
    const result = spawnSync(process.execPath, [detector], {
      cwd: directory,
      encoding: 'utf8',
      env: { ...process.env, BEFORE_SHA: before, GITHUB_SHA: after, GITHUB_OUTPUT: output },
    });
    assert.ifError(result.error);
    return { ...result, output: readFileSync(output, 'utf8') };
  }

  return { cwd, temp, git, write, commit, detect };
}

function assertPackages(result, ...paths) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, ['packages<<EOF', paths.join('\n'), 'EOF', ''].join('\n'));
}

test('compares the exact push range and fails if a shallow checkout lacks its base', t => {
  const { cwd, temp, git, write, commit, detect } = setup(t);
  write('packages/a/package.json', { version: '1.0.0' });
  const before = commit();
  write('packages/a/package.json', { version: '1.0.1' });
  commit();
  write('README.md', 'unrelated second commit');
  const after = commit();

  assertPackages(detect(before, after), 'packages/a');

  const shallow = join(temp, 'shallow');
  git(['clone', '--quiet', '--depth=2', pathToFileURL(cwd).href, shallow]);
  const missing = detect(before, after, shallow);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Cannot resolve push base commit/);
  assert.equal(missing.output, '');
});

test('includes new and bumped public packages, but skips removed/private/unchanged manifests', t => {
  const { cwd, write, commit, detect } = setup(t);
  for (const name of ['bumped', 'deleted', 'unchanged', 'private']) {
    write('packages/' + name + '/package.json', { version: '1.0.0', private: name === 'private' });
  }
  const before = commit();

  write('packages/new/package.json', { version: '1.0.0' });
  write('packages/new-private/package.json', { version: '1.0.0', private: true });
  write('packages/private/package.json', { version: '1.0.1', private: true });
  write('packages/bumped/package.json', { version: '1.0.1' });
  write('packages/unchanged/package.json', { version: '1.0.0', description: 'new description' });
  write('packages/unchanged/example/package.json', { version: '1.0.0' });
  rmSync(join(cwd, 'packages/deleted/package.json'));
  const after = commit();

  assertPackages(detect(before, after), 'packages/bumped', 'packages/new');
  assertPackages(detect(after, after));
});

test('uses the first parent only for an all-zero before SHA, or the empty tree for a root', t => {
  const { write, commit, detect } = setup(t);
  write('packages/a/package.json', { version: '1.0.0' });
  const root = commit();
  write('packages/b/package.json', { version: '1.0.0' });
  const after = commit();
  assertPackages(detect(zeroSha, root), 'packages/a');
  assertPackages(detect(zeroSha, after), 'packages/b');
  const missing = detect('', after);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Missing or invalid push base commit SHA/);
  assert.equal(missing.output, '');
});

test('compares the before tree even if it is not an ancestor after a force-push', t => {
  const { git, write, commit, detect } = setup(t);
  write('packages/a/package.json', { version: '1.0.0' });
  const shared = commit();
  write('packages/a/package.json', { version: '1.0.1' });
  const before = commit();
  git(['checkout', '--quiet', '--detach', shared]);
  write('packages/a/package.json', { version: '1.0.2' });
  const after = commit();

  assertPackages(detect(before, after), 'packages/a');
});
