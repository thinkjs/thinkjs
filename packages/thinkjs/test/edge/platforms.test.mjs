import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, writeFile, mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {Miniflare} from 'miniflare';
import {buildEdge} from '../../edge/build.js';
import {contract} from './contract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('same HTTP contract on Node Fetch, Deno and Workers without nodejs_compat', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'thinkjs-platform-'));
  let worker;
  try {
    const outfile = path.join(folder, 'worker.mjs');
    const result = await buildEdge({
      appPath: path.join(here, '../../examples/edge/src'),
      outfile
    });
    const inputs = Object.keys(result.metafile.inputs);
    assert.ok(inputs.some(file => file.endsWith('lib/core/context.js')));
    assert.ok(inputs.some(file => file.endsWith('lib/core/think.js')));
    assert.ok(inputs.some(file => file.endsWith('think-loader/middleware.js')));
    assert.equal(inputs.some(file => file.endsWith('lib/runtime/node.js') || file.includes('/koa/lib/')), false);
    const start = performance.now();
    const {default: app} = await import(pathToFileURL(outfile));
    const importMs = performance.now() - start;
    const firstRequestStart = performance.now();
    await app.fetch(new Request('https://example.com/'));
    const firstRequestMs = performance.now() - firstRequestStart;
    await contract((request) => app.fetch(request));
    process.stdout.write(
      `Edge bundle: ${result.bytes} bytes; Node import: ${importMs.toFixed(1)}ms; initialization + first request: ${firstRequestMs.toFixed(1)}ms\n`
    );
    worker = new Miniflare({
      modules: true,
      modulesRoot: folder,
      scriptPath: outfile,
      compatibilityDate: '2026-07-30'
    });
    await contract(async (request) =>
      worker.dispatchFetch(request.url, {
        method: request.method,
        headers: Object.fromEntries(request.headers),
        body: request.body
          ? new Uint8Array(await request.arrayBuffer())
          : undefined
      })
    );
    const runner = path.join(folder, 'deno.mjs');
    await writeFile(
      runner,
      `import app from ${JSON.stringify(pathToFileURL(outfile).href)};\nimport {contract} from ${JSON.stringify(pathToFileURL(path.join(here, 'contract.mjs')).href)};\nawait contract(request => app.fetch(request));\n`
    );
    const deno = spawnSync(
      path.join(here, '../../node_modules/.bin/deno'),
      ['run', runner],
      {encoding: 'utf8'}
    );
    assert.equal(deno.status, 0, deno.stderr || String(deno.error));
  } finally {
    await worker?.dispose();
    await rm(folder, {recursive: true, force: true});
  }
});

test('build rejects Node dependencies and unresolved dynamic loading', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'thinkjs-build-'));
  try {
    await mkdir(path.join(folder, 'controller'));
    for (const source of [
      "module.exports = require('node:fs');",
      'module.exports = require(globalThis.packageName);'
    ]) {
      await writeFile(path.join(folder, 'controller/index.js'), source);
      await assert.rejects(
        buildEdge({appPath: folder, outfile: path.join(folder, 'out.mjs')}),
        /unsupported|require|dynamic/i
      );
    }
  } finally {
    await rm(folder, {recursive: true, force: true});
  }
});
