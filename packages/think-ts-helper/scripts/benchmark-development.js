'use strict';

// Run in a fresh process per sample set. This measures a real generated registry
// and the checked coordinator, not application boot/HTTP latency or an IDE.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const {performance} = require('node:perf_hooks');
const loadStarted = performance.now();
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : require('typescript');
const helper = process.env.THINKJS_BENCHMARK_HELPER ? path.resolve(process.env.THINKJS_BENCHMARK_HELPER) : path.resolve(__dirname, '..');
const Watcher = require(path.join(helper, 'development')).createWatcher(require('../../think-watcher/tracked'), ts);
const loadMs = performance.now() - loadStarted;
const count = Number(process.argv[2] || 1000);
const samples = Number(process.argv[3] || 5);
const layout = process.argv[4] || 'single';
if (!Number.isInteger(count) || count < 3 || count > 10000) throw new Error('Expected 3 to 10000 service source files');
if (!Number.isInteger(samples) || samples < 1 || samples > 100) throw new Error('Expected 1 to 100 samples per warm scenario');
if (!['single', 'multi'].includes(layout)) throw new Error('Expected single or multi layout');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'think-development-benchmark-'));
const write = (file, text) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
  fs.writeFileSync(path.join(root, file), text);
};
const source = value => `export default class Service { constructor(private id: number) {} value(): number { return this.id + ${value}; } }\n`;
const servicePath = i => layout === 'single' ? `src/service/item-${i}.ts` : `src/${['common', 'home', 'admin'][i % 3]}/service/item-${Math.floor(i / 3)}.ts`;
const measured = action => {
  const cpu = process.cpuUsage();
  const before = performance.now();
  action();
  const usage = process.cpuUsage(cpu);
  return {wallMs: performance.now() - before, cpuMs: (usage.user + usage.system) / 1000};
};
const summary = values => {
  const statistic = key => {
    const ordered = values.map(value => value[key]).sort((a, b) => a - b);
    return {median: ordered[Math.floor(ordered.length / 2)], max: ordered[ordered.length - 1]};
  };
  return {samples: values.length, wallMs: statistic('wallMs'), cpuMs: statistic('cpuMs')};
};
let watcher;
try {
  write('node_modules/thinkjs/service-types.d.ts', fs.readFileSync(path.resolve(__dirname, '../../thinkjs/service-types.d.ts'), 'utf8'));
  for (let i = 0; i < count; i++) write(servicePath(i), source(i));
  if (layout === 'multi') write('src/common/config/config.ts', 'export default {};\n');
  const consumer = layout === 'single' ? 'src/consumer.ts' : 'src/home/controller/consumer.ts';
  const generated = layout === 'single' ? '../.thinkjs/types' : '../../../.thinkjs/types';
  write(consumer, `import type { AppThink } from '${generated}';\ndeclare const app: AppThink<{}>;\nexport const value: number = app.service('item-0', ${layout === 'multi' ? "'home', " : ''}1).value();\n`);
  write('tsconfig.json', JSON.stringify({compilerOptions: {strict: true, skipLibCheck: false, types: [],
    module: 'commonjs', target: 'es2018', rootDir: 'src', outDir: 'app', sourceMap: true},
  include: ['src/**/*.ts', '.thinkjs/types/**/*.d.ts']}));
  let builds = 0;
  watcher = new Watcher({root, srcPath: path.join(root, 'src'), diffPath: path.join(root, 'app')}, () => { builds++; });
  const cold = measured(() => watcher.poll());
  assert.equal(builds, 1);
  const unchanged = [];
  for (let i = 0; i < samples; i++) unchanged.push(measured(() => watcher.poll()));
  assert.equal(builds, 1, 'Unchanged polls must not reload');
  const unchangedCache = watcher.lastCompilerCache;
  const edit = [];
  for (let i = 0; i < samples; i++) {
    write(servicePath(count - 1), source(count + i));
    edit.push(measured(() => watcher.poll()));
  }
  assert.equal(builds, samples + 1);
  const editedCache = watcher.lastCompilerCache;
  const file = servicePath(count - 1);
  const output = path.join(root, file.replace(/^src\//, 'app/').replace(/\.ts$/, '.js'));
  const lastGood = fs.readFileSync(output, 'utf8');
  write(file, 'const broken: number = "wrong"; export default broken;\n');
  const failure = measured(() => assert.throws(() => watcher.poll(), {code: 'DEVELOPMENT_TYPECHECK'}));
  assert.equal(fs.readFileSync(output, 'utf8'), lastGood);
  assert.equal(builds, samples + 1);
  write(file, source(count + samples));
  const recovery = measured(() => watcher.poll());
  fs.renameSync(path.join(root, file), path.join(root, file.replace(/\.ts$/, '-renamed.ts')));
  const rename = measured(() => watcher.poll());
  assert.equal(fs.existsSync(output), false);
  assert.equal(fs.existsSync(output + '.map'), false);
  assert.equal(builds, samples + 3);
  process.stdout.write(JSON.stringify({schema: 1, node: process.version, typescript: ts.version,
    platform: process.platform, arch: process.arch, cpu: os.cpus()[0]?.model,
    layout, serviceFiles: count, loadMs, cold, unchanged: summary(unchanged), edit: summary(edit),
    failure, recovery, rename, unchangedCache, editedCache,
    maxRssKiB: process.resourceUsage().maxRSS}) + '\n');
} finally {
  if (watcher) watcher.close();
  fs.rmSync(root, {recursive: true, force: true});
}
