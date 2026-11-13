'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');
const {generate} = require('../../packages/think-ts-helper');
const {Config, getConfigFn} = require('../../packages/think-config');
const root = path.resolve(__dirname, '../..');
const localRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT
  ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : localRequire('typescript');

for (const multi of [false, true]) {
  for (const useDefineForClassFields of [false, true]) {
    test(`TS ${ts.version}: Config/Model/Service adoption (${multi ? 'multi' : 'single'}, define fields: ${useDefineForClassFields})`, t => {
      const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-config-adoption-'));
      const output = path.join(temporary, 'app');
      const thinkFile = require.resolve('../../packages/thinkjs/lib/think.js');
      const previousThink = Object.getOwnPropertyDescriptor(global, 'think');
      const previousModule = require.cache[thinkFile];
      t.after(() => {
        if (previousThink) Object.defineProperty(global, 'think', previousThink);
        else delete global.think;
        if (previousModule) require.cache[thinkFile] = previousModule;
        else delete require.cache[thinkFile];
        for (const filename of Object.keys(require.cache)) if (filename.startsWith(temporary + path.sep)) delete require.cache[filename];
        fs.rmSync(temporary, {recursive: true, force: true});
      });
      const write = (name, content) => {
        fs.mkdirSync(path.dirname(path.join(temporary, name)), {recursive: true});
        fs.writeFileSync(path.join(temporary, name), content);
      };
      const prefix = multi ? 'common/' : '';
      write(`src/${prefix}config/config.ts`, 'const config = {shared: 1, overridden: "common", nested: {value: 7}}; export = config;');
      write(`src/${prefix}service/counter.ts`, 'export default class Counter { count = 41; }');
      write(`src/${prefix}model/user.ts`, 'export default class User extends think.Model { custom() { return 42; } }');
      if (multi) write('src/admin/config/config.ts', 'const config = {overridden: 9}; export = config;');
      generate({root: temporary, models: true});
      const layout = multi ? 'multi' : 'single';
      write('consumer.ts', `
        import type {} from 'think-model';
        import type { Think, Context, Controller, Logic } from 'thinkjs';
        import type { AppThink, AppContext, AppController } from './.thinkjs/types';
        import type { ThinkConfigs, ContextConfigs, ControllerConfigs } from 'think-config/config-types';
        declare module 'think-config/config-types' {
          interface ConfigModules {
            __single__: { shared: number; overridden: string; 'nested.value': number };
            common: { shared: number; overridden: string; 'nested.value': number };
            admin: { shared: number; overridden: number; 'nested.value': number };
          }
        }
        type PageContext = ContextConfigs<AppContext<Context, 'admin'>, '${layout}', 'admin'>;
        type PageControllerView = ControllerConfigs<AppController<Controller, 'admin'>, '${layout}', 'admin'>;
        export class BaseController extends think.Controller {
          declare config: PageControllerView['config'];
          declare model: PageControllerView['model'];
          declare service: PageControllerView['service'];
          declare ctx: PageContext;
        }
        export class PageController extends BaseController {
          indexAction() {
            const current: ${multi ? 'number' : 'string'} = this.config('overridden');
            const context: ${multi ? 'number' : 'string'} = this.ctx.config('overridden', undefined, undefined);
            const common: string = this.config('overridden', undefined, 'common');
            const fallback: string = this.config('overridden', undefined, 'missing');
            const nested: number = this.config('nested.value');
            const service: number = this.service('counter').count;
            const model: number = this.model('user').custom();
            if (false) {
              // @ts-expect-error Config checks remain strict after view composition
              this.config('shared', 'wrong');
              // @ts-expect-error Service checks remain strict after Config composition
              this.service('unknown');
              // @ts-expect-error Model fallback has no custom method
              this.model('unknown').custom();
              // @ts-expect-error unknown Config reads are unknown
              this.config('unknown').custom();
            }
            this.ctx.config('shared', 5);
            return {current, context, common, fallback, nested, service, model, updated: this.config('shared')};
          }
        }
        export class PageLogic extends think.Logic {
          declare config: ControllerConfigs<AppController<Logic, 'admin'>, '${layout}', 'admin'>['config'];
          declare ctx: PageContext;
          indexAction() { return this.config('overridden'); }
        }
        export function globalLookup(app: ThinkConfigs<AppThink<Think>, '${layout}'>) {
          const common: string = app.config('overridden');
          const service: number = app.service('counter').count;
          const model: number = app.model('user').custom();
          app.config('shared', 8, ${multi ? 'true' : "'ignored'"});
          return {common, service, model};
        }
      `);
      const program = ts.createProgram([path.join(temporary, 'consumer.ts'), path.join(temporary, `src/${prefix}config/config.ts`), ...(multi ? [path.join(temporary, 'src/admin/config/config.ts')] : [])], {
        strict: true, skipLibCheck: true, types: [], useDefineForClassFields,
        target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs, rootDir: temporary, outDir: output, baseUrl: root,
        paths: {
          thinkjs: ['packages/thinkjs/index.d.ts'], 'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts'],
          'think-model': ['packages/think-model/index.d.ts'], 'think-model/model-types': ['packages/think-model/model-types.d.ts'],
          'think-config/config-types': ['packages/think-config/config-types.d.ts']
        }
      });
      assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => `${d.file && path.basename(d.file.fileName)}:${d.file && d.file.getLineAndCharacterOfPosition(d.start).line + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`), []);
      assert.equal(program.emit().emitSkipped, false);
      assert.doesNotMatch(fs.readFileSync(path.join(output, 'consumer.js'), 'utf8'), /require\(/, 'all view and registry imports erase');
      delete require.cache[thinkFile];
      require(thinkFile);
      const core = global.think;
      core.Model = require('../../packages/think-model')({on() {}, modules: [], models: {}}).think.Model;
      const Loader = require('../../packages/think-loader');
      const loader = new Loader(path.join(output, 'src'));
      const configs = loader.loadConfig('development');
      // ORM configuration is supplied independently of the tested config schema.
      class Adapter {}
      const modelConfig = {type: 'default', default: {handle: Adapter}};
      const plugin = require('../../packages/think-model')({on() {}, modules: loader.modules, models: loader.loadModel(), think: {config() { return modelConfig; }}});
      Object.assign(core, plugin.think);
      core.config = getConfigFn(configs, multi);
      core.app.modules = loader.modules;
      core.app.services = loader.loadService();
      const controllerExtension = require('../../packages/thinkjs/lib/extend/controller.js');
      Object.assign(core.Controller.prototype, plugin.controller, {config: controllerExtension.config, service: controllerExtension.service});
      const contextExtension = require('../../packages/thinkjs/lib/extend/context.js');
      const ctx = {module: 'admin', config: contextExtension.config, service: contextExtension.service, model: plugin.context.model};
      // Context Model uses an adapter config, which isn't part of Config inference.
      const configMethod = ctx.config;
      ctx.config = function(name, ...args) { return name === 'model' ? modelConfig : configMethod.call(this, name, ...args); };
      const fixture = require(path.join(output, 'consumer.js'));
      const controller = new fixture.PageController(ctx);
      const logic = new fixture.PageLogic(ctx);
      assert.equal(Object.hasOwn(controller, 'config'), false);
      assert.equal(Object.hasOwn(logic, 'config'), false);
      assert.equal(controller.ctx, ctx);
      assert.deepEqual(controller.indexAction(), {current: multi ? 9 : 'common', context: multi ? 9 : 'common', common: 'common', fallback: 'common', nested: 7, service: 41, model: 42, updated: 5});
      assert.equal(logic.indexAction(), multi ? 9 : 'common');
      assert.deepEqual(fixture.globalLookup(core), {common: 'common', service: 41, model: 42});
      assert.equal(ctx.config('shared'), 8);
      assert.equal(core.config('shared'), 8);
    });
  }
}

test('Config runtime dispatch: placeholders, selectors, reads, writes and return values', () => {
  const single = getConfigFn({value: 1, optional: undefined, nested: {value: 2}}, false);
  const handle = single('value', 3, 'ignored');
  assert.ok(handle instanceof Config);
  assert.equal(handle.get('value'), 3);
  assert.equal(single('value', undefined, 'ignored'), 3);
  assert.equal(single('').value, 3);
  assert.equal(single(undefined).value, 3);
  assert.equal(single('optional', undefined), undefined);
  assert.equal(single('nested.missing'), undefined);
  assert.throws(() => single({value: 4}), TypeError, 'there is no object/bulk-value overload');
  const multi = getConfigFn({common: {value: 'common', shared: 1}, admin: {value: 2, shared: 1}, api: {value: true, shared: 1}}, true);
  assert.equal(multi('value', undefined, 'admin'), 2);
  assert.equal(multi('value', undefined, ''), 'common');
  assert.equal(multi('value', undefined, 'absent'), 'common');
  assert.equal(multi('value', undefined, 'admin,api'), 'common', 'comma strings only select multiple modules for writes');
  assert.equal(multi('shared', 5, 'admin,api,absent'), undefined);
  assert.equal(multi('shared'), 1);
  assert.equal(multi('shared', undefined, 'admin'), 5);
  assert.equal(multi('shared', undefined, 'api'), 5);
  assert.equal(multi('shared', 9, ''), undefined);
  assert.equal(multi('shared'), 1, 'empty write selector is a no-op, not a common fallback');
  assert.equal(multi('shared', 7, true), undefined);
  for (const name of ['common', 'admin', 'api']) assert.equal(multi('shared', undefined, name), 7);
  assert.throws(() => multi('value', undefined, 'constructor'), TypeError);
});

test('Config loader consumes raw CommonJS namespaces and does not execute config factories', t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-config-exports-'));
  t.after(() => {
    for (const filename of Object.keys(require.cache)) if (filename.startsWith(temporary + path.sep)) delete require.cache[filename];
    fs.rmSync(temporary, {recursive: true, force: true});
  });
  const configDir = path.join(temporary, 'config');
  fs.mkdirSync(configDir);
  fs.writeFileSync(path.join(configDir, 'config.js'), ts.transpileModule('export default {fromDefault: 42};', {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText);
  fs.writeFileSync(path.join(configDir, 'config.testing.js'), 'module.exports = function() { throw new Error("config factory must not execute"); }; module.exports.own = 7;');
  const ConfigLoader = require('../../packages/think-loader/loader/config.js');
  const configs = new ConfigLoader().load(temporary, 'testing', []);
  assert.equal(configs.fromDefault, undefined);
  assert.equal(configs.default.fromDefault, 42);
  assert.equal(configs.own, 7);
});
