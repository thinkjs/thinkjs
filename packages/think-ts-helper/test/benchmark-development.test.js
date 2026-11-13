'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

for (const layout of ['single', 'multi']) {
  test(`checked-development benchmark verifies ${layout} transitions and syntax-work budgets`, () => {
    const env = {...process.env};
    delete env.THINKJS_BENCHMARK_HELPER;
    const result = JSON.parse(execFileSync(process.execPath,
      [path.resolve(__dirname, '../scripts/benchmark-development.js'), '3', '1', layout],
      {env, encoding: 'utf8', timeout: 30000}));
    assert.equal(result.schema, 1);
    assert.equal(result.layout, layout);
    assert.equal(result.serviceFiles, 3);
    assert.equal(result.unchangedCache.parsed, 0);
    assert.ok(result.unchangedCache.reused > 3);
    assert.equal(result.editedCache.parsed, 1);
    assert.equal(result.editedCache.retained, result.unchangedCache.retained);
    for (const metric of [result.cold, result.failure, result.recovery, result.rename]) {
      assert.ok(Number.isFinite(metric.wallMs) && metric.wallMs >= 0);
      assert.ok(Number.isFinite(metric.cpuMs) && metric.cpuMs >= 0);
    }
  });
}
