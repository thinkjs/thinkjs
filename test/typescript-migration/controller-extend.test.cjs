'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');
const {generate} = require('../../packages/think-ts-helper');
const root = path.resolve(__dirname, '../..');
const localRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT
  ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : localRequire('typescript');

function fixture(t, multi) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-controller-extend-'));
  t.after(() => {
    for (const file of Object.keys(require.cache)) if (file.startsWith(temporary + path.sep)) delete require.cache[file];
    fs.rmSync(temporary, {recursive: true, force: true});
  });
  const write = (name, content) => {
    const file = path.join(temporary, name);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
  };
  fs.mkdirSync(path.join(temporary, 'node_modules'));
  fs.symlinkSync(path.join(root, 'packages/thinkjs'), path.join(temporary, 'node_modules/thinkjs'), 'dir');
  const prefix = multi ? 'common/' : '';
  write(`src/${prefix}config/extend.ts`, `
    const plugins = [
      {controller: {overridden() { return 123; }, pluginOnly() { return true; }, get property() { return 1; }}},
      {controller: {overridden() { return 'plugin'; }, get property() { return 'tuple'; }}}
    ] as const;
    export default plugins;
  `);
  write(`src/${prefix}extend/controller.ts`, `
    interface Host { ctx: { module: string }; prefix: string; }
    const controller = {
      prefix: 'hello',
      overridden() { return false; },
      get property() { return 7; },
      get label() { return this.prefix + ':getter'; },
      greet(this: Host, suffix: string) { return this.prefix + ':' + this.ctx.module + ':' + suffix; },
      get mutable() { return this.prefix; },
      set mutable(value: string) { this.prefix = value; }
    };
    export = controller;
  `);
  write(`src/${prefix}service/counter.ts`, 'export default class Counter { constructor(public count: number) {} }');
  if (multi) {
    fs.mkdirSync(path.join(temporary, 'src/admin/config'), {recursive: true});
    // These are valid files but runtime ExtendLoader deliberately ignores them.
    write('src/admin/config/extend.ts', 'export default {controller: {overridden: 99}};');
    write('src/admin/extend/controller.ts', 'export default {overridden: 100};');
  }
  return {temporary, write, prefix};
}

function compile(temporary, skipLibCheck, useDefineForClassFields = false) {
  const program = ts.createProgram([path.join(temporary, 'consumer.ts')], {
    strict: true, skipLibCheck, noEmitOnError: true, types: [], useDefineForClassFields,
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs, rootDir: temporary,
    outDir: path.join(temporary, 'app'), baseUrl: root,
    paths: {
      thinkjs: ['packages/thinkjs/index.d.ts'], 'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts'],
      'think-model/model-types': ['packages/think-model/model-types.d.ts'],
      'think-config/config-types': ['packages/think-config/config-types.d.ts']
    }
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => `${d.file && path.basename(d.file.fileName)}:${d.file && d.file.getLineAndCharacterOfPosition(d.start).line + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`), []);
  assert.equal(program.emit().emitSkipped, false);
}

for (const multi of [false, true]) {
  for (const models of [false, true]) {
    for (const configs of [false, true]) {
      test(`TS ${ts.version}: standalone Controller extension composition (${multi ? 'multi' : 'single'}, models: ${models}, configs: ${configs})`, t => {
        const {temporary, write, prefix} = fixture(t, multi);
        if (models) write(`src/${prefix}model/user.ts`, 'export default class User { where(value: object) { return this; } custom() { return true; } }');
        if (configs) write(`src/${prefix}config/config.ts`, 'export const option = true;');
        const result = generate({root: temporary, controllerExtends: true, models, configs});
        assert.equal(result.diagnostics.length, 4);
        write('consumer.ts', `
          import type { AppExtendedController, AppController, ControllerExtension } from './.thinkjs/types';
          interface BaseModel { where(value: object): BaseModel; }
          interface Host { ctx: {module: string}; model(name: string): BaseModel; config(name?: string): any; service(name: string): any; retained: number; }
          declare const ctl: AppExtendedController<Host, 'admin'>;
          declare const original: AppController<Host, 'admin'>;
          const plugin: boolean = ctl.pluginOnly();
          const replaced: boolean = ctl.overridden();
          const accessor: number = ctl.property;
          const getter: string = ctl.label;
          const method: string = ctl.greet('world');
          const count: number = ctl.service('counter', 3).count;
          const retained: number = ctl.retained;
          ctl.mutable = 'changed';
          const mutable: string = ctl.mutable;
          ${models ? 'const custom: boolean = ctl.model("user").custom();' : ''}
          ${configs ? 'const option: boolean = ctl.config("option");' : ''}
          // @ts-expect-error overridden plugin signature is not intersected with the winner
          const old: number = ctl.overridden();
          // @ts-expect-error getter-only source properties remain readonly
          ctl.property = 3;
          // @ts-expect-error getter this is checked in the source and readonly is retained
          ctl.label = 'wrong';
          // @ts-expect-error the source setter still validates writes
          ctl.mutable = 4;
          const detached = ctl.greet;
          // @ts-expect-error explicit this still requires a host, not an unbound function
          detached('wrong');
          // @ts-expect-error source method parameters are not widened
          ctl.greet(3);
          // @ts-expect-error generated Service contracts remain strict
          ctl.service('missing');
          // @ts-expect-error existing views and Logic adoption are not silently changed
          original.greet('world');
          // @ts-expect-error explicit this rejects a source-only extension object without ctx
          declare const unbound: ControllerExtension; unbound.greet('wrong');
          ${models ? '// @ts-expect-error Model fallback is retained\n ctl.model("missing").custom();' : ''}
          ${configs ? '// @ts-expect-error Config value constraints remain intact\n ctl.config("option", 1);' : ''}
        `);
        compile(temporary, false);
      });
    }
  }
  for (const useDefineForClassFields of [false, true]) {
    test(`TS ${ts.version}: Controller extension source/type/runtime adoption (${multi ? 'multi' : 'single'}, define fields: ${useDefineForClassFields})`, t => {
      const {temporary, write} = fixture(t, multi);
      const generated = generate({root: temporary, controllerExtends: true});
      write('consumer.ts', `
        import type { Controller, Context } from 'thinkjs';
        import type { ControllerExtension, AppExtendedController, AppContext } from './.thinkjs/types';
        export interface BaseController extends ControllerExtension {}
        export class BaseController extends think.Controller {
          declare service: AppExtendedController<Controller, 'admin'>['service'];
          declare ctx: AppContext<Context>;
        }
        export class PageController extends BaseController {
          indexAction() {
            const replacement: boolean = this.overridden();
            const label: string = this.label;
            const greeting: string = this.greet('world');
            const plugin: boolean = this.pluginOnly();
            const property: number = this.property;
            const counter: number = this.service('counter', 11).count;
            this.mutable = 'updated';
            if (false) {
              // @ts-expect-error wrong inherited getter type
              const old: string = this.property;
              // @ts-expect-error getter-only declaration stays readonly after interface merging
              this.property = 2;
              // @ts-expect-error service generation still enforces names
              this.service('missing');
            }
            return {replacement, label, greeting, plugin, property, counter, mutable: this.mutable};
          }
        }
      `);
      compile(temporary, true, useDefineForClassFields);
      const output = path.join(temporary, 'app');
      const emitted = fs.readFileSync(path.join(output, 'consumer.js'), 'utf8');
      assert.doesNotMatch(emitted, /require\(/, 'interface merging and declare fields must not emit extension imports or shadow accessors');
      if (multi) fs.mkdirSync(path.join(output, 'src/admin/config'), {recursive: true});
      const thinkFile = require.resolve('../../packages/thinkjs/lib/think.js');
      const previousThink = Object.getOwnPropertyDescriptor(global, 'think');
      const previousModule = require.cache[thinkFile];
      t.after(() => {
        if (previousThink) Object.defineProperty(global, 'think', previousThink);
        else delete global.think;
        if (previousModule) require.cache[thinkFile] = previousModule;
        else delete require.cache[thinkFile];
      });
      delete require.cache[thinkFile];
      require(thinkFile);
      const core = global.think;
      const Loader = require('../../packages/think-loader');
      const loader = new Loader(path.join(output, 'src'));
      const extensions = loader.loadExtend();
      core.app.modules = loader.modules;
      core.app.services = loader.loadService();
      Loader.extend(core.Controller.prototype, extensions.controller);
      const fixtureModule = require(path.join(output, 'consumer.js'));
      const ctl = new fixtureModule.PageController({module: 'admin'});
      assert.deepEqual(ctl.indexAction(), {replacement: false, label: 'hello:getter', greeting: 'hello:admin:world', plugin: true, property: 7, counter: 11, mutable: 'updated'});
      for (const name of generated.manifest.controllerExtends.members) assert.equal(Object.hasOwn(ctl, name), name === 'prefix');
      assert.equal(Object.hasOwn(ctl, 'service'), false);
      const descriptor = Object.getOwnPropertyDescriptor(core.Controller.prototype, 'property');
      assert.equal(typeof descriptor.get, 'function');
      assert.equal(descriptor.set, undefined, 'getter-only layers remain getter-only');
      assert.throws(() => { ctl.property = 9; }, TypeError);
    });
  }
}
