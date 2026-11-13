'use strict';

// Reproducible local measurement, not a performance assertion or CI timing gate.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {performance} = require('node:perf_hooks');
const {generate} = require('..');
const count = Number(process.argv[2] || 1000);
if (!Number.isInteger(count) || count < 1 || count > 100000) throw new Error('Expected a service count from 1 to 100000');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-ts-benchmark-'));
try {
  const service = path.join(root, 'src/service');
  fs.mkdirSync(service, {recursive: true});
  for (let i = 0; i < count; i++) fs.writeFileSync(path.join(service, `item-${i}.ts`), 'export default class Service { value() { return 1; } }\n');
  const start = performance.now();
  generate({root});
  const initialMs = performance.now() - start;
  const stable = [];
  for (let i = 0; i < 5; i++) {
    const before = performance.now();
    const result = generate({root});
    if (result.changed.length) throw new Error('Output was not stable');
    stable.push(performance.now() - before);
  }
  stable.sort((a, b) => a - b);
  process.stdout.write(JSON.stringify({node: process.version, services: count, initialMs: Math.round(initialMs), stableMedianMs: Math.round(stable[2])}) + '\n');
} finally {
  fs.rmSync(root, {recursive: true, force: true});
}
