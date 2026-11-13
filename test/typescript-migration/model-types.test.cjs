'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');
const root = path.resolve(__dirname, '../..');
const localRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT
  ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : localRequire('typescript');

test(`TS ${ts.version}: standalone Model lookup contract with full declaration checking`, () => {
  const program = ts.createProgram([path.join(__dirname, 'model-types-fixtures/contract.ts')], {
    noEmit: true, strict: true, skipLibCheck: false, types: [],
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    baseUrl: root, paths: {'think-model/model-types': ['packages/think-model/model-types.d.ts']}
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => `${d.file && path.basename(d.file.fileName)}:${d.file && d.file.getLineAndCharacterOfPosition(d.start).line + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`), []);
});

test(`TS ${ts.version}: generated Model/Service view composition with full declaration checking`, t => {
  const fs = require('node:fs');
  const temporary = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'thinkjs-model-contract-'));
  t.after(() => fs.rmSync(temporary, {recursive: true, force: true}));
  const write = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(temporary, file)), {recursive: true});
    fs.writeFileSync(path.join(temporary, file), content);
  };
  write('src/common/config/config.ts', 'export default {};');
  write('src/common/model/user.ts', 'export default class User { where(value: object) { return this; } common() { return true; } }');
  write('src/admin/model/user.ts', 'export default class Admin { where(value: object) { return this; } admin() { return 42; } }');
  write('src/common/model/constructor.ts', 'export default class Own { where(value: object) { return this; } own() { return true; } }');
  write('src/common/service/counter.ts', 'export default class Counter { count = 7; }');
  require('../../packages/think-ts-helper').generate({root: temporary, models: true});
  write('consumer.ts', `
    import type { AppThink, AppContext, AppController } from './.thinkjs/types';
    interface BaseModel { where(value: object): BaseModel; }
    interface Host { model(name: string, config?: any, module?: string): BaseModel; service(name: string): any; retained: number; }
    declare const app: AppThink<Host>;
    declare const ctx: AppContext<Host, 'admin'>;
    declare const ctl: AppController<Host, 'admin'>;
    app.model('user').common();
    ctx.model('user').admin();
    ctl.model('user').admin();
    app.model('other_table').where({});
    const n: number = app.service('counter').count + ctx.service('counter').count + ctl.service('counter').count;
    app.model('constructor').own();
    ctx.model('constructor').own();
    declare const dynamicModule: string;
    // @ts-expect-error unknown modules may have an inherited constructor despite every known module having an own one
    app.model('constructor', undefined, dynamicModule);
    declare const unbound: AppContext<Host>;
    // @ts-expect-error an unbound context might also select an unknown module
    unbound.model('constructor');
    const keep: number = app.retained + ctx.retained + ctl.retained;
    // @ts-expect-error source references retain custom method types
    const wrong: string = ctx.model('user').admin();
    // @ts-expect-error Service strictness is preserved after Model composition
    ctl.service('unknown_service');
    // @ts-expect-error unknown tables do not receive custom methods
    app.model('other_table').common();
  `);
  const program = ts.createProgram([path.join(temporary, 'consumer.ts')], {
    noEmit: true, strict: true, skipLibCheck: false, types: [],
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs, baseUrl: root,
    paths: {'think-model/model-types': ['packages/think-model/model-types.d.ts'], 'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts']}
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
});
