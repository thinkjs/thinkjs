#!/usr/bin/env node
'use strict';

// Dependency-free and deterministic: runnable before pnpm install.
const fs = require('node:fs');
const path = require('node:path');
const BASELINE = 'aa9cdde600db87c332e5c98f704024e1a66788f4';
const ROOT = path.resolve(__dirname, '../..');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const sorted = object => Object.fromEntries(Object.entries(object || {}).sort(([a], [b]) => compare(a, b)));

const BATCHES = [
  ['P3-foundations', 'P3', 'Foundations: pure utilities, storage primitives and process helpers',
    'think-helper think-debounce think-instance think-gc think-store-file think-mock-http think-cluster think-pm2'],
  ['P3-request-pipeline', 'P3', 'Request pipeline: configuration, routing, parsing, dispatch, validation and errors',
    'think-config think-router think-router-rest think-payload think-controller think-logic think-meta think-resource think-validator think-trace think-logger3'],
  ['P3-bootstrap', 'P3', 'Bootstrap: migrate application and loader together after resolving their runtime cycle',
    'thinkjs think-loader think-crontab'],
  ['P4-state-adapters', 'P4', 'State: cache/session contracts and file, cookie, JWT, Redis and Memcache adapters',
    'think-cache think-cache-file think-cache-memcache think-cache-redis think-memcache think-redis think-session think-session-cookie think-session-file think-session-jwt think-session-mysql think-session-redis'],
  ['P4-data-adapters', 'P4', 'Data: model contracts, SQL drivers and adapters, MongoDB and ORM integrations',
    'think-model think-model-abstract think-model-mysql think-model-mysql2 think-model-postgresql think-model-sqlite think-mongo think-mongoose think-mysql think-mysql2 think-sequelize think-knex'],
  ['P4-presentation-transport', 'P4', 'Presentation/transport: views, WebSockets, localization and pagination',
    'think-view think-view-ejs think-view-handlebars think-view-nunjucks think-view-pug think-websocket think-websocket-socket.io think-websocket-ws think-i18n think-pagination'],
  ['P4-integrations', 'P4', 'Integrations: GraphQL, HTTP/email clients, middleware and security helpers',
    'think-apollo-graphql think-csrf think-email think-fetch think-helmet think-proxy think-qs think-ratelimiter think-svg-captcha'],
  ['P4-tooling', 'P4', 'Tooling: CLI, transpilers, watching, inspection and test mocking; template submodule separately',
    'think-cli think-babel think-typescript think-watcher think-inspect think-mock'],
  ['P4-legacy-review', 'P4', 'Legacy boundary: decide ownership of duplicate logger before any migration or publication', 'think-logger'],
  ['P4-example-validation', 'P4', 'Example boundary: validate application consumption; no library publishing assumption', 'think-demo']
];

function migrationFor(directory) {
  const batch = BATCHES.find(item => item[3].split(' ').includes(directory));
  return batch ? {status: 'proposed', phase: batch[1], batch: batch[0]} :
    {status: 'needs-triage', phase: 'P4', batch: 'P4-unclassified'};
}

function dependencyName(name, specifier) {
  if (specifier.startsWith('npm:')) return specifier.slice(4).replace(/@[^@/]*$/, '');
  // pnpm workspace aliases may use workspace:target@* or workspace:@scope/target@*.
  if (specifier.startsWith('workspace:')) {
    const alias = specifier.slice(10).match(/^((?:@[^/]+\/)?[^@~^*./][^@]*)@/);
    if (alias) return alias[1];
  }
  return name;
}

function stronglyConnectedComponents(nodes, edges) {
  const adjacency = new Map(nodes.map(node => [node, []]));
  for (const edge of edges) for (const target of edge.targets) adjacency.get(edge.from).push(target);
  const index = new Map();
  const low = new Map();
  const stack = [];
  const active = new Set();
  const components = [];
  let next = 0;
  function visit(node) {
    index.set(node, next);
    low.set(node, next++);
    stack.push(node);
    active.add(node);
    for (const target of adjacency.get(node)) {
      if (!index.has(target)) {
        visit(target);
        low.set(node, Math.min(low.get(node), low.get(target)));
      } else if (active.has(target)) low.set(node, Math.min(low.get(node), index.get(target)));
    }
    if (low.get(node) === index.get(node)) {
      const component = [];
      let target;
      do {
        target = stack.pop();
        active.delete(target);
        component.push(target);
      } while (target !== node);
      components.push(component.sort(compare));
    }
  }
  nodes.forEach(node => { if (!index.has(node)) visit(node); });
  return components.sort((a, b) => compare(a[0], b[0]));
}

function buildInventory(root = ROOT) {
  const workspace = fs.readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8');
  // Fail closed if workspace selection changes; do not silently audit a subset.
  const selection = workspace.match(/^packages:\s*\r?\n((?:[ \t]+-.*\r?\n)+)/m);
  if (!selection || selection[1].trim() !== '- "packages/*"') {
    throw new Error('Workspace patterns changed; update audit discovery before regenerating.');
  }
  const packages = fs.readdirSync(path.join(root, 'packages'), {withFileTypes: true})
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, 'packages', entry.name, 'package.json')))
    .sort((a, b) => compare(a.name, b.name)).map(entry => {
      const directory = entry.name;
      const relativePath = `packages/${directory}`;
      const manifest = JSON.parse(fs.readFileSync(path.join(root, relativePath, 'package.json'), 'utf8'));
      return {
        path: relativePath, name: manifest.name, version: manifest.version,
        private: manifest.private === true,
        boundary: directory === 'think-demo' ? 'example' : directory === 'think-logger' ? 'legacy-review' : 'first-party',
        migration: migrationFor(directory),
        main: manifest.main ?? null, types: manifest.types ?? null, typings: manifest.typings ?? null,
        bin: typeof manifest.bin === 'object' ? sorted(manifest.bin) : manifest.bin ?? null,
        files: manifest.files ?? null, scripts: sorted(manifest.scripts),
        dependencies: sorted(manifest.dependencies), devDependencies: sorted(manifest.devDependencies),
        optionalDependencies: sorted(manifest.optionalDependencies), peerDependencies: sorted(manifest.peerDependencies),
        workspaceDependencies: {runtime: [], development: [], optional: [], peer: []},
        reverseWorkspaceDependencies: {runtime: [], development: [], optional: [], peer: []}
      };
    });
  const byName = new Map();
  for (const pkg of packages) byName.set(pkg.name, [...(byName.get(pkg.name) || []), pkg.path]);
  const edges = [];
  const externalFirstPartyReferences = [];
  for (const pkg of packages) {
    for (const [field, kind] of [['dependencies', 'runtime'], ['devDependencies', 'development'], ['optionalDependencies', 'optional'], ['peerDependencies', 'peer']]) {
      for (const [name, specifier] of Object.entries(pkg[field])) {
        const targetName = dependencyName(name, specifier);
        const targets = byName.get(targetName) || [];
        if (!targets.length) {
          if (/^(think-|thinkjs$|@thinkjs\/|babel-preset-think-)/.test(targetName)) externalFirstPartyReferences.push({from: pkg.path, kind, name, specifier, targetName});
          continue;
        }
        const edge = {from: pkg.path, kind, name, specifier, targetName, targets, ambiguous: targets.length > 1};
        edges.push(edge);
        pkg.workspaceDependencies[kind].push({name, specifier, targetName, targets, ambiguous: edge.ambiguous});
        for (const target of targets) packages.find(candidate => candidate.path === target)
          .reverseWorkspaceDependencies[kind].push({from: pkg.path, name, specifier});
      }
    }
  }
  const runtimeEdges = edges.filter(edge => edge.kind === 'runtime' || edge.kind === 'optional');
  const components = stronglyConnectedComponents(packages.map(pkg => pkg.path), runtimeEdges);
  const cycles = components.filter(component => component.length > 1 || runtimeEdges.some(edge => edge.from === component[0] && edge.targets.includes(component[0])));
  const gitmodules = fs.existsSync(path.join(root, '.gitmodules')) ? fs.readFileSync(path.join(root, '.gitmodules'), 'utf8') : '';
  const excludedSubmodules = [...gitmodules.matchAll(/^\s*path\s*=\s*(.+)$/gm)].map(match => match[1].trim()).sort(compare);
  return {
    schemaVersion: 1,
    baseline: {commit: BASELINE, issue: 'https://github.com/thinkjs/thinkjs/issues/1795'},
    scope: {patterns: ['packages/*'], root: 'Workspace orchestration only; not a published package in this inventory.', excludedSubmodules},
    semantics: {
      dependencies: 'Declared name/alias matches to current workspace manifests, not pnpm installed resolution. Version ranges are preserved, not assumed satisfied. Duplicate names retain every candidate path.',
      runtimeGraph: 'dependencies and optionalDependencies; peer and development edges are separate.',
      boundaries: 'Proposed migration responsibility, not a deprecation decision. think-logger requires duplicate-name review; think-demo is an example.',
      externalReferences: 'First-party-looking dependency names absent from this workspace are recorded but never synthesized as packages.',
      missingManifestFields: 'null means absent; no implicit Node/npm defaults are invented.',
      baseline: 'Fixed planning baseline; manifests reflect current checkout. Generation does not depend on wall-clock time, installed modules or git HEAD.'
    },
    summary: {packages: packages.length, uniqueNames: byName.size, runtimeEdges: runtimeEdges.length, developmentEdges: edges.filter(edge => edge.kind === 'development').length, runtimeCycles: cycles.length},
    batches: [...BATCHES.map(([id, phase, responsibility]) => ({id, phase, responsibility})), {id: 'P4-unclassified', phase: 'P4', responsibility: 'New packages require explicit migration responsibility review.'}],
    duplicateNames: [...byName].filter(([, paths]) => paths.length > 1).map(([name, paths]) => ({name, paths})).sort((a, b) => compare(a.name, b.name)),
    externalFirstPartyReferences, packages, edges,
    runtimeStronglyConnectedComponents: components, runtimeCycles: cycles
  };
}

function renderGraph(inventory) {
  const ids = new Map(inventory.packages.map((pkg, index) => [pkg.path, `p${index}`]));
  const lines = ['%% Generated by node scripts/typescript-migration/audit.cjs; do not edit.',
    '%% Arrows: consumer -> declared workspace candidate. Solid: runtime/optional; dotted: development/peer.',
    '%% Names/aliases only; ranges are not resolved. Duplicate-name edges are explicitly ambiguous.', 'flowchart LR'];
  for (const pkg of inventory.packages) lines.push(`  ${ids.get(pkg.path)}["${pkg.path}<br/>${pkg.name}<br/>${pkg.migration.batch}"]`);
  for (const edge of inventory.edges) for (const target of edge.targets) {
    const arrow = edge.kind === 'runtime' || edge.kind === 'optional' ? '-->' : '-.->';
    const label = `${edge.kind}${edge.ambiguous ? ' ambiguous' : ''}${edge.name !== edge.targetName ? ' alias' : ''}`;
    lines.push(`  ${ids.get(edge.from)} ${arrow}|"${label}"| ${ids.get(target)}`);
  }
  return `${lines.join('\n')}\n`;
}

function main(args = process.argv.slice(2)) {
  if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/typescript-migration/audit.cjs [--check]');
  const inventory = buildInventory();
  const outputs = new Map([
    ['docs/typescript-migration/packages.json', `${JSON.stringify(inventory, null, 2)}\n`],
    ['docs/typescript-migration/dependencies.mmd', renderGraph(inventory)]
  ]);
  for (const [relativePath, content] of outputs) {
    const file = path.join(ROOT, relativePath);
    if (args.includes('--check')) {
      if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) throw new Error(`${relativePath} is stale; run node scripts/typescript-migration/audit.cjs`);
    } else {
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.writeFileSync(file, content);
    }
  }
  process.stdout.write(`${args.includes('--check') ? 'Verified' : 'Generated'} migration inventory: ${inventory.summary.packages} packages, ${inventory.summary.runtimeCycles} runtime cycle(s).\n`);
}

if (require.main === module) {
  try { main(); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
module.exports = {buildInventory, dependencyName, stronglyConnectedComponents, renderGraph, main};
