const { execFileSync } = require('node:child_process');
const { appendFileSync } = require('node:fs');
const { dirname } = require('node:path');

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', ...options });
}

function resolveCommit(sha, label) {
  if (!/^[0-9a-f]{40}$/.test(sha || '')) {
    throw new Error('Missing or invalid ' + label + ' commit SHA.');
  }

  try {
    return git(['rev-parse', '--verify', sha + '^{commit}']).trim();
  } catch {
    throw new Error('Cannot resolve ' + label + ' commit ' + sha + '. Check that the push commit is available in the checkout.');
  }
}

function findChangedPackages(beforeSha, afterSha) {
  const after = resolveCommit(afterSha, 'push head');
  let before;
  if (beforeSha === '0'.repeat(40)) {
    // A branch creation has no before commit. Keep the previous one-commit
    // fallback, or compare to the empty tree for a true root commit.
    const headers = git(['cat-file', 'commit', after]).split('\n\n', 1)[0];
    const parent = headers.match(/^parent ([0-9a-f]{40})$/m);
    before = parent
      ? resolveCommit(parent[1], 'push head parent')
      : git(['hash-object', '-w', '-t', 'tree', '--stdin'], { input: '' }).trim();
  } else {
    before = resolveCommit(beforeSha, 'push base');
  }

  const changedFiles = git([
    'diff', '--name-only', '--no-renames', '--diff-filter=AMT', '-z',
    before, after, '--', ':(glob)packages/*/package.json',
  ]).split('\0').filter(Boolean);

  return changedFiles.flatMap(file => {
    const current = JSON.parse(git(['show', after + ':' + file]));
    if (current.private === true || typeof current.version !== 'string' || !current.version) return [];

    // An added manifest has no old version; other Git/read errors must fail.
    const exists = git(['--literal-pathspecs', 'ls-tree', '-z', before, '--', file]);
    const oldVersion = exists ? JSON.parse(git(['show', before + ':' + file])).version : undefined;
    return oldVersion === current.version ? [] : [dirname(file)];
  }).sort();
}

try {
  const { BEFORE_SHA, GITHUB_SHA, GITHUB_OUTPUT } = process.env;
  const packages = findChangedPackages(BEFORE_SHA, GITHUB_SHA);
  if (packages.some(path => /[\r\n]/.test(path))) {
    throw new Error('Cannot emit a package path containing a line break.');
  }
  appendFileSync(GITHUB_OUTPUT, 'packages<<EOF\n' + packages.join('\n') + '\nEOF\n');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
