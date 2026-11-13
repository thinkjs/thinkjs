'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');
const root = path.resolve(__dirname, '../..');
const localRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT
  ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : localRequire('typescript');

for (const fixture of ['contract', 'partial']) {
  test(`TS ${ts.version}: Config ${fixture} with full declaration checking`, () => {
    const program = ts.createProgram([path.join(__dirname, `config-types-fixtures/${fixture}.ts`)], {
      noEmit: true, strict: true, skipLibCheck: false, types: [],
      target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      baseUrl: root, paths: {'think-config/config-types': ['packages/think-config/config-types.d.ts']}
    });
    assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => `${d.file && path.basename(d.file.fileName)}:${d.file && d.file.getLineAndCharacterOfPosition(d.start).line + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`), []);
  });
}

test(`TS ${ts.version}: generated Config/Model/Service view composition with full declaration checking`, t => {
  const fs = require('node:fs');
  const temporary = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'thinkjs-config-contract-'));
  t.after(() => fs.rmSync(temporary, {recursive: true, force: true}));
  const write = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(temporary, file)), {recursive: true});
    fs.writeFileSync(path.join(temporary, file), content);
  };
  write('src/common/config/config.ts', 'const value = {port: 3000}; export = value;');
  write('src/admin/config/config.ts', 'const value = {port: "local"}; export = value;');
  write('src/common/model/user.ts', 'export default class User { where(value: object) { return this; } custom() { return true; } }');
  write('src/common/service/counter.ts', 'export default class Counter { count = 7; }');
  require('../../packages/think-ts-helper').generate({root: temporary, models: true});
  write('consumer.ts', `
    import type { AppThink, AppContext, AppController } from './.thinkjs/types';
    import type { ThinkConfigs, ContextConfigs, ControllerConfigs } from 'think-config/config-types';
    declare module 'think-config/config-types' {
      interface ConfigModules { common: {port: number}; admin: {port: string}; }
    }
    interface BaseModel { where(value: object): BaseModel; }
    interface Host { model(name: string, config?: any, module?: string): BaseModel; service(name: string): any; config(name?: string, value?: any, module?: string): any; retained: number; }
    declare const app: ThinkConfigs<AppThink<Host>, 'multi'>;
    declare const ctx: ContextConfigs<AppContext<Host, 'admin'>, 'multi', 'admin'>;
    declare const ctl: ControllerConfigs<AppController<Host, 'admin'>, 'multi', 'admin'>;
    const common: number = app.config('port');
    const local: string = ctx.config('port') + ctl.config('port');
    const count: number = app.service('counter').count + ctx.service('counter').count + ctl.service('counter').count;
    const custom: boolean = app.model('user').custom() && ctx.model('user').custom() && ctl.model('user').custom();
    const retained: number = app.retained + ctx.retained + ctl.retained;
    // @ts-expect-error Config view does not reintroduce Service any overloads
    ctl.service('missing');
    // @ts-expect-error Config view preserves Model table fallback
    app.model('missing').custom();
    // @ts-expect-error module-bound Config override remains precise
    const wrong: number = ctx.config('port');
    // @ts-expect-error Config values cannot be widened by another view
    ctl.config('port', 1);
    // @ts-expect-error mutation is not valid in both modules
    app.config('port', 1, true);
  `);
  const program = ts.createProgram([path.join(temporary, 'consumer.ts')], {
    noEmit: true, strict: true, skipLibCheck: false, types: [],
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs, baseUrl: root,
    paths: {
      'think-model/model-types': ['packages/think-model/model-types.d.ts'],
      'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts'],
      'think-config/config-types': ['packages/think-config/config-types.d.ts']
    }
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
});
