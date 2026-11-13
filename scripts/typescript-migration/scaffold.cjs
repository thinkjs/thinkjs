#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const template = path.join(root, 'templates/typescript-checked');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');

function collectPackages(manifest) {
  const available = new Map();
  for (const directory of fs.readdirSync(path.join(root, 'packages'))) {
    const location = path.join(root, 'packages', directory);
    if (!fs.existsSync(path.join(location, 'package.json'))) continue;
    const pkg = readJson(path.join(location, 'package.json'));
    // The audit records two historical think-logger3 directories. Select the
    // active workspace package, matching the installed-application gate.
    if (pkg.name === 'think-logger3' && directory !== 'think-logger3') continue;
    if (available.has(pkg.name)) throw new Error(`Ambiguous package: ${pkg.name}`);
    available.set(pkg.name, {location, manifest: pkg});
  }
  const selected = new Map();
  const visit = name => {
    if (selected.has(name) || !available.has(name)) return;
    const pkg = available.get(name);
    selected.set(name, pkg);
    for (const dependency of Object.keys({...pkg.manifest.dependencies, ...pkg.manifest.optionalDependencies})) visit(dependency);
  };
  Object.keys({...manifest.dependencies, ...manifest.devDependencies}).forEach(visit);
  return selected;
}

async function render(target) {
  const generate = require('../../packages/think-cli/lib/generate');
  const metadata = readJson(path.join(template, 'metadata.json'));
  // Use the real CLI pipeline without its remote/cache discovery. No default
  // template, installed CLI, registry dependency or interactive answer changes.
  await new Promise((resolve, reject) => generate(template, target, {
    name: 'thinkjs-checked-app', command: 'new', maps: metadata.new.default,
    template, metadata, context: {}, isMultiModule: false, clone: false
  }, error => error ? reject(error) : resolve()));
}

async function scaffold(destination) {
  if (process.platform === 'win32') throw new Error('This local prototype currently requires a POSIX host; Windows scaffolding is not implemented yet');
  if (!destination) throw new Error('Usage: pnpm create:typescript-application <new-directory>');
  const target = path.resolve(destination);
  // Reserve exclusively. Existing files, directories and symlinks are never
  // passed to Metalsmith's clean destination behavior.
  fs.mkdirSync(target);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-scaffold-'));
  try {
    const rendered = path.join(temporary, 'project');
    await render(rendered);
    const manifest = readJson(path.join(rendered, 'package.json'));
    // Avoid persisting checkout paths and irrelevant local template metadata.
    delete manifest.thinkjs;
    const packages = collectPackages(manifest);
    const tarballs = path.join(rendered, '.thinkjs/packages');
    fs.mkdirSync(tarballs, {recursive: true});
    const packed = JSON.parse(execFileSync('npm',
      ['pack', ...[...packages.values()].map(pkg => pkg.location), '--ignore-scripts', '--json', '--pack-destination', tarballs],
      {cwd: root, env: {...process.env, npm_config_cache: path.join(temporary, 'npm-cache'), npm_config_update_notifier: 'false'}, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 300000}));
    if (packed.length !== packages.size || new Set(packed.map(pkg => pkg.name)).size !== packages.size) {
      throw new Error('Unexpected package packing result');
    }
    const overrides = {};
    for (const pkg of packed) {
      if (!packages.has(pkg.name) || path.basename(pkg.filename) !== pkg.filename || !fs.existsSync(path.join(tarballs, pkg.filename))) {
        throw new Error('Unexpected packed package: ' + pkg.name);
      }
      overrides[pkg.name] = 'file:./.thinkjs/packages/' + pkg.filename;
    }
    // Both direct and transitive first-party dependencies must resolve to this
    // checkout, including the thinkjs/think-loader cycle. Paths remain portable.
    for (const group of ['dependencies', 'devDependencies']) {
      for (const name of Object.keys(manifest[group])) {
        if (overrides[name]) manifest[group][name] = overrides[name];
      }
    }
    writeJson(path.join(rendered, 'package.json'), manifest);
    fs.writeFileSync(path.join(rendered, 'pnpm-workspace.yaml'), 'packages: []\noverrides: ' + JSON.stringify(overrides) + '\n');
    for (const entry of fs.readdirSync(rendered)) {
      fs.cpSync(path.join(rendered, entry), path.join(target, entry), {recursive: true, force: false, errorOnExist: true});
    }
    return {target, packages: [...packages.keys()]};
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true});
  }
}

if (require.main === module) scaffold(process.argv.length === 3 && process.argv[2]).then(result => {
  process.stdout.write(`Created checked TypeScript prototype in ${result.target}\n` +
    'Run pnpm install --ignore-scripts, then pnpm typecheck, pnpm dev, pnpm build and pnpm start.\n' +
    'No packages were installed, published or downloaded by the scaffold command.\n');
}).catch(error => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });

module.exports = {collectPackages, render, scaffold};
