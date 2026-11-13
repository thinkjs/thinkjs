'use strict';

// Observations only. Includes polling delay and full regeneration, not compiler
// or application restart time. No environment-dependent timing assertions.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {once} = require('node:events');
const {performance} = require('node:perf_hooks');
const {watch} = require('..');
const count = Number(process.argv[2] || 1000);
if (!Number.isInteger(count) || count < 1 || count > 100000) throw new Error('Expected a service count from 1 to 100000');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-ts-watch-benchmark-'));
let watcher;
async function main() {
  const service = path.join(root, 'src/service');
  fs.mkdirSync(service, {recursive: true});
  for (let i = 0; i < count; i++) fs.writeFileSync(path.join(service, `item-${i}.ts`), 'export default class Service { value() { return 1; } }\n');
  const start = performance.now();
  watcher = watch({root});
  await watcher.ready;
  const readyMs = performance.now() - start;
  async function measure(change) {
    const updated = once(watcher, 'update', {signal: AbortSignal.timeout(30000)});
    const before = performance.now();
    change();
    await updated;
    return Math.round(performance.now() - before);
  }
  const original = path.join(service, 'new.ts');
  const renamed = path.join(service, 'renamed.ts');
  const addMs = await measure(() => fs.writeFileSync(original, 'export default class Added {}\n'));
  const renameMs = await measure(() => fs.renameSync(original, renamed));
  const deleteMs = await measure(() => fs.unlinkSync(renamed));
  process.stdout.write(JSON.stringify({node: process.version, services: count, intervalMs: 500, readyMs: Math.round(readyMs), addMs, renameMs, deleteMs}) + '\n');
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; }).finally(() => {
  if (watcher) watcher.close();
  fs.rmSync(root, {recursive: true, force: true});
});
