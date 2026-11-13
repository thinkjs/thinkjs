'use strict';

// The runtime loader is the oracle for the generated effective service maps.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');
const root = path.resolve(__dirname, '../..');
const {generate} = require('../../packages/think-ts-helper');
const localRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT
  ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : localRequire('typescript');

function setup(t, multi) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-generated-runtime-'));
  const source = path.join(temporary, 'src');
  const app = path.join(temporary, 'app');
  const prefix = multi ? 'common/' : '';
  const inputs = {
    [`${prefix}service/shared.ts`]: 'export default class Shared { source = "common"; commonOnly = true; constructor(public value?: string) {} }',
    [`${prefix}service/nested/echo.ts`]: 'class Echo { constructor(public value: number) {} } export = Echo;',
    [`${prefix}service/default-property.js`]: 'module.exports = { default: {value: "nested"}, source: "plain-cjs" };'
  };
  if (multi) {
    inputs['admin/service/shared.ts'] = 'export default class Local { source = "admin"; adminOnly = 42; constructor(public value?: string) {} }';
    fs.mkdirSync(path.join(source, 'common/config'), {recursive: true});
    fs.mkdirSync(path.join(app, 'common/config'), {recursive: true});
  }
  for (const [file, content] of Object.entries(inputs)) {
    fs.mkdirSync(path.dirname(path.join(source, file)), {recursive: true});
    fs.writeFileSync(path.join(source, file), content);
    const output = path.join(app, file.replace(/\.ts$/, '.js'));
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, file.endsWith('.ts') ? ts.transpileModule(content, {
      compilerOptions: {target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS}
    }).outputText : content);
  }
  const descriptor = Object.getOwnPropertyDescriptor(global, 'think');
  const thinkFile = require.resolve('../../packages/thinkjs/lib/think.js');
  const cached = require.cache[thinkFile];
  delete require.cache[thinkFile];
  require(thinkFile);
  const think = global.think;
  const Loader = require('../../packages/think-loader');
  const loader = new Loader(app);
  think.app.modules = loader.modules;
  think.app.services = loader.loadService();
  t.after(() => {
    delete require.cache[thinkFile];
    if (cached) require.cache[thinkFile] = cached;
    if (descriptor) Object.defineProperty(global, 'think', descriptor);
    else delete global.think;
    for (const filename of Object.keys(require.cache)) {
      if (filename.startsWith(temporary + path.sep)) delete require.cache[filename];
    }
    fs.rmSync(temporary, {recursive: true, force: true});
  });
  return {temporary, think, loader};
}

for (const multi of [false, true]) {
  test(`generated ${multi ? 'multi' : 'single'} service maps agree with the emitted runtime`, t => {
    const {temporary, think, loader} = setup(t, multi);
    const {manifest} = generate({root: temporary});
    assert.equal(manifest.layout, multi ? 'multi' : 'single');
    const runtimeMaps = multi ? think.app.services : {__single__: think.app.services};
    assert.deepEqual(Object.keys(manifest.modules).sort(), Object.keys(runtimeMaps).sort());
    for (const name of Object.keys(runtimeMaps)) {
      assert.deepEqual(Object.keys(manifest.modules[name]).sort(), Object.keys(runtimeMaps[name]).sort());
    }
    const echoArgs = multi ? ['nested/echo', 'admin', 42] : ['nested/echo', 42];
    assert.equal(think.service(...echoArgs).value, 42);
    const object = think.service('default-property');
    assert.equal(object.source, 'plain-cjs');
    assert.deepEqual(object.default, {value: 'nested'});
    const consumer = path.join(temporary, 'consumer.ts');
    fs.writeFileSync(consumer, `
      import type { AppThink, AppContext, AppController } from './.thinkjs/types';
      export function consume(app: AppThink<{}>, ctx: AppContext<{}>, controller: AppController<{}, 'admin'>) {
        const value: number = app.service('nested/echo', ${multi ? "'admin', " : ''}42).value;
        const label: string = app.service('default-property').default.value;
        const common: boolean = ctx.service('shared').commonOnly;
        const current: ${multi ? 'number' : 'boolean'} = controller.service('shared').${multi ? 'adminOnly' : 'commonOnly'};
        if (false) {
          // @ts-expect-error unknown literal service names do not reach a broad fallback
          app.service('not_registered');
          // @ts-expect-error constructor arguments retain their original source types
          app.service('nested/echo', ${multi ? "'admin', " : ''}'wrong');
          // @ts-expect-error a CommonJS default property is an ordinary nested object
          app.service('default-property').value;
        }
        return {value, label, common, current};
      }
    `);
    const program = ts.createProgram([consumer], {
      noEmit: true, strict: true, skipLibCheck: false, allowJs: true, types: [],
      target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      baseUrl: root, paths: {'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts']}
    });
    assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
    const consumerOutput = path.join(temporary, 'consumer.js');
    fs.writeFileSync(consumerOutput, ts.transpileModule(fs.readFileSync(consumer, 'utf8'), {
      compilerOptions: {target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS}
    }).outputText);
    const context = require('../../packages/thinkjs/lib/extend/context.js');
    const controller = require('../../packages/thinkjs/lib/extend/controller.js');
    const ctx = {module: 'admin', service: context.service};
    const ctl = {ctx, service: controller.service};
    assert.deepEqual(require(consumerOutput).consume(think, ctx, ctl), {
      value: 42, label: 'nested', common: true, current: multi ? 42 : true
    });
    if (multi) {
      assert.deepEqual(loader.modules.sort(), ['admin', 'common']);
      assert.equal(manifest.modules.admin.shared, 'src/admin/service/shared.ts');
      assert.equal(manifest.modules.admin['nested/echo'], 'src/common/service/nested/echo.ts');
      assert.equal(context.service.call(ctx, 'shared').source, 'common');
      assert.equal(controller.service.call({ctx}, 'shared').source, 'admin');
      // A registered module in argument two is consumed, never a string payload.
      assert.equal(controller.service.call({ctx}, 'shared', 'common').source, 'common');
      assert.equal(controller.service.call({ctx}, 'shared', 'common').value, undefined);
      assert.equal(controller.service.call({ctx}, 'shared', 'admin', 'common').value, 'common');
    }
  });
}
