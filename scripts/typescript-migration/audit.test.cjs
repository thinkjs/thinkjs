'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {test} = require('node:test');
const {buildInventory, dependencyName, renderGraph, stronglyConnectedComponents} = require('./audit.cjs');

function fixture(t, manifests) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-audit-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  fs.writeFileSync(path.join(root, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n');
  for (const [directory, manifest] of Object.entries(manifests)) {
    const location = path.join(root, 'packages', directory);
    fs.mkdirSync(location, {recursive: true});
    fs.writeFileSync(path.join(location, 'package.json'), JSON.stringify({version: '1.0.0', ...manifest}));
  }
  return root;
}

test('real inventory covers every package and records known boundary risks', () => {
  const inventory = buildInventory();
  assert.equal(inventory.summary.packages, 74);
  assert.equal(inventory.summary.uniqueNames, 73);
  assert.deepEqual(inventory.duplicateNames, [{name: 'think-logger3', paths: ['packages/think-logger', 'packages/think-logger3']}]);
  assert.deepEqual(inventory.runtimeCycles, [['packages/think-loader', 'packages/thinkjs']]);
  assert.deepEqual(inventory.scope.excludedSubmodules, ['packages/think-cli/default_template']);
  assert.ok(inventory.packages.every(pkg => pkg.migration.status === 'proposed'));
  assert.ok(inventory.externalFirstPartyReferences.some(edge => edge.targetName === 'think-ms'));
  const alias = inventory.edges.find(edge => edge.from === 'packages/think-model-mysql2' && edge.name === 'think-mysql');
  assert.deepEqual(alias.targets, ['packages/think-mysql2']);
});

test('inventory keeps aliases, duplicate paths, dependency kinds, missing fields and reverse edges', t => {
  const root = fixture(t, {
    consumer: {name: 'consumer', dependencies: {alias: 'npm:duplicate@^1', 'think-absent': '^1'}, devDependencies: {dev: '^1'}, optionalDependencies: {optional: '^1'}, peerDependencies: {peer: '^1'}},
    a: {name: 'duplicate'}, b: {name: 'duplicate'}, dev: {name: 'dev'}, optional: {name: 'optional'}, peer: {name: 'peer'}
  });
  const inventory = buildInventory(root);
  const consumer = inventory.packages.find(pkg => pkg.name === 'consumer');
  assert.equal(consumer.main, null);
  assert.equal(consumer.migration.status, 'needs-triage');
  assert.equal(consumer.workspaceDependencies.runtime[0].ambiguous, true);
  assert.deepEqual(consumer.workspaceDependencies.runtime[0].targets, ['packages/a', 'packages/b']);
  assert.equal(consumer.workspaceDependencies.development.length, 1);
  assert.equal(consumer.workspaceDependencies.optional.length, 1);
  assert.equal(consumer.workspaceDependencies.peer.length, 1);
  assert.equal(inventory.packages.find(pkg => pkg.path === 'packages/b').reverseWorkspaceDependencies.runtime[0].from, 'packages/consumer');
  assert.equal(inventory.externalFirstPartyReferences[0].targetName, 'think-absent');
  assert.equal(inventory.summary.runtimeEdges, 2);
  assert.equal(renderGraph(inventory), renderGraph(buildInventory(root)));
});

test('dependency aliases do not confuse scoped names with versions', () => {
  assert.equal(dependencyName('alias', 'npm:@thinkjs/driver@^2.0.0'), '@thinkjs/driver');
  assert.equal(dependencyName('alias', 'npm:think-mysql2@^2.0.0'), 'think-mysql2');
  assert.equal(dependencyName('alias', 'workspace:think-mysql2@*'), 'think-mysql2');
  assert.equal(dependencyName('alias', 'workspace:@scope/driver@^'), '@scope/driver');
  assert.equal(dependencyName('plain', 'workspace:*'), 'plain');
});

test('SCC includes cycles, isolated nodes and self-loops without conflating development edges', () => {
  const components = stronglyConnectedComponents(['a', 'b', 'c', 'd'], [
    {from: 'a', targets: ['b']}, {from: 'b', targets: ['a']}, {from: 'c', targets: ['c']}
  ]);
  assert.deepEqual(components, [['a', 'b'], ['c'], ['d']]);
});

test('unknown workspace patterns fail rather than silently omit packages', t => {
  const root = fixture(t, {one: {name: 'one'}});
  fs.writeFileSync(path.join(root, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n  - "other/*"\n');
  assert.throws(() => buildInventory(root), /Workspace patterns changed/);
});

test('generation is repeatable and --check rejects stale output without writing', t => {
  const root = fixture(t, {one: {name: 'one'}});
  const scriptDirectory = path.join(root, 'scripts/typescript-migration');
  fs.mkdirSync(scriptDirectory, {recursive: true});
  const script = path.join(scriptDirectory, 'audit.cjs');
  fs.copyFileSync(path.join(__dirname, 'audit.cjs'), script);
  const run = (...args) => spawnSync(process.execPath, [script, ...args], {encoding: 'utf8'});
  assert.equal(run().status, 0);
  const file = path.join(root, 'docs/typescript-migration/packages.json');
  const first = fs.readFileSync(file, 'utf8');
  assert.equal(run().status, 0);
  assert.equal(fs.readFileSync(file, 'utf8'), first);
  assert.equal(run('--check').status, 0);
  fs.writeFileSync(file, 'stale\n');
  assert.equal(run('--check').status, 1);
  assert.equal(fs.readFileSync(file, 'utf8'), 'stale\n');
  assert.equal(run('--unsupported').status, 1);
});
