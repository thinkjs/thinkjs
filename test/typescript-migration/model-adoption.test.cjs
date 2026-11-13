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

for (const multi of [false, true]) {
  for (const useDefineForClassFields of [false, true]) {
    test(`TS ${ts.version}: generated ${multi ? 'multi' : 'single'} Model adoption (define fields: ${useDefineForClassFields})`, t => {
      const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-model-adoption-'));
      const source = path.join(temporary, 'src');
      const output = path.join(temporary, 'app');
      const thinkFile = require.resolve('../../packages/thinkjs/lib/think.js');
      const previousThink = Object.getOwnPropertyDescriptor(global, 'think');
      const previousModule = require.cache[thinkFile];
      t.after(() => {
        if (previousThink) Object.defineProperty(global, 'think', previousThink);
        else delete global.think;
        if (previousModule) require.cache[thinkFile] = previousModule;
        else delete require.cache[thinkFile];
        for (const filename of Object.keys(require.cache)) {
          if (filename.startsWith(temporary + path.sep)) delete require.cache[filename];
        }
        fs.rmSync(temporary, {recursive: true, force: true});
      });
      const prefix = multi ? 'common/' : '';
      const files = {
        [`${prefix}model/constructor.ts`]: 'export default class OwnConstructor extends think.Model { ownOnly() { return 9; } }',
        [`${prefix}model/shared.ts`]: 'export default class Shared extends think.Model { commonOnly() { return true; } }',
        [`${prefix}model/nested/item.ts`]: 'class Item extends think.Model { nestedOnly() { return 7; } } export = Item;',
        [`${prefix}model/legacy.js`]: 'module.exports = class Legacy extends think.Model { legacyOnly() { return "legacy"; } };',
        [`${prefix}service/counter.ts`]: 'export default class Counter { constructor(public count: number) {} }'
      };
      if (multi) {
        files['admin/model/shared.ts'] = 'export default class Admin extends think.Model { adminOnly() { return 42; } }';
        fs.mkdirSync(path.join(source, 'common/config'), {recursive: true});
        fs.mkdirSync(path.join(source, 'empty'), {recursive: true});
        fs.mkdirSync(path.join(output, 'src/common/config'), {recursive: true});
        fs.mkdirSync(path.join(output, 'src/empty'), {recursive: true});
      }
      for (const [file, content] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(source, file)), {recursive: true});
        fs.writeFileSync(path.join(source, file), content);
      }
      const generated = generate({root: temporary, models: true});
      const consumer = path.join(temporary, 'consumer.ts');
      fs.writeFileSync(consumer, `
        import type {} from 'think-model';
        import type { Think, Context, Controller, Logic } from 'thinkjs';
        import type { AppThink, AppContext, AppController } from './.thinkjs/types';
        export class BaseController extends think.Controller {
          declare model: AppController<Controller, 'admin'>['model'];
          declare service: AppController<Controller, 'admin'>['service'];
          declare ctx: AppContext<Context, 'admin'>;
        }
        export class PageController extends BaseController {
          indexAction() {
            const current: ${multi ? 'number' : 'boolean'} = this.model('shared').${multi ? 'adminOnly' : 'commonOnly'}();
            const context: ${multi ? 'number' : 'boolean'} = this.ctx.model('shared', undefined, undefined).${multi ? 'adminOnly' : 'commonOnly'}();
            const common: boolean = this.model('shared', null, 'common').commonOnly();
            const inherited: number = this.model('nested/item').nestedOnly();
            const legacy: string = this.model('legacy').legacyOnly();
            const own: number = this.model('constructor').ownOnly();
            const count: number = this.service('counter', 41).count;
            const table = this.model('unregistered_table').where({id: 1}).tableName;
            if (false) {
              // @ts-expect-error unknown tables preserve ORM type, not any
              this.model('not_registered').missingMethod();
              // @ts-expect-error service checks remain strict after Model composition
              this.service('missing_service');
              // @ts-expect-error model config is not a constructor parameter
              this.model('shared', 42);
              ${multi ? `
              // @ts-expect-error current-module model does not have common's overridden method
              this.model('shared').commonOnly();
              // @ts-expect-error argument two is adapter config, not the common module
              this.model('shared', 'common').commonOnly();
              // @ts-expect-error unknown module returns base, not common
              this.model('shared', undefined, 'absent').commonOnly();
              ` : ''}
            }
            return {current, context, common, inherited, legacy, own, count, table};
          }
        }
        export class PageLogic extends think.Logic {
          declare model: AppController<Logic, 'admin'>['model'];
          declare ctx: AppContext<Context, 'admin'>;
          indexAction() { return this.model('shared').${multi ? 'adminOnly' : 'commonOnly'}(); }
        }
        // The global typed boundary is explicit. Unlike legacy service's any,
        // the legacy base-Model return cannot promise custom methods without proof.
        export function globalLookup(app: AppThink<Think>) {
          return app.model('shared').commonOnly();
        }
        export function checkUnbound(ctx: AppContext<Context>) {
          ctx.model('not_registered').where({});
          ${multi ? `
          // @ts-expect-error unbound Context does not assume a current module
          ctx.model('shared').adminOnly();
          ` : ''}
        }
      `);
      const program = ts.createProgram([consumer], {
        strict: true, skipLibCheck: true, noEmitOnError: true, allowJs: true, types: [],
        useDefineForClassFields, target: ts.ScriptTarget.ES2018,
        module: ts.ModuleKind.CommonJS, moduleResolution: ts.ModuleResolutionKind.NodeJs,
        rootDir: temporary, outDir: output, baseUrl: root,
        paths: {
          thinkjs: ['packages/thinkjs/index.d.ts'], 'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts'],
          'think-model': ['packages/think-model/index.d.ts'], 'think-model/model-types': ['packages/think-model/model-types.d.ts']
        }
      });
      assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => `${d.file && path.basename(d.file.fileName)}:${d.file && d.file.getLineAndCharacterOfPosition(d.start).line + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`), []);
      assert.equal(program.emit().emitSkipped, false);
      const emitted = fs.readFileSync(path.join(output, 'consumer.js'), 'utf8');
      assert.doesNotMatch(emitted, /require\(/, 'model adoption has no runtime type import');

      delete require.cache[thinkFile];
      require(thinkFile);
      const core = global.think;
      const extensions = require('../../packages/think-model')({on() {}, modules: [], models: {}});
      core.Model = extensions.think.Model;
      const Loader = require('../../packages/think-loader');
      const loader = new Loader(path.join(output, 'src'));
      const modelMaps = loader.loadModel();
      const runtimeMaps = multi ? modelMaps : {__single__: modelMaps};
      assert.deepEqual(Object.keys(generated.manifest.models).sort(), Object.keys(runtimeMaps).sort());
      for (const name of Object.keys(runtimeMaps)) {
        assert.deepEqual(Object.keys(generated.manifest.models[name]), Object.keys(runtimeMaps[name]).sort());
      }
      class Adapter {}
      const configCalls = [];
      const application = {
        on() {}, modules: loader.modules, models: modelMaps,
        think: {config(name, value, module) {
          configCalls.push({name, module});
          return name === 'model' ? {type: 'default', default: {handle: Adapter}, alternate: {handle: Adapter}, common: {handle: Adapter}} : {};
        }}
      };
      const plugin = require('../../packages/think-model')(application);
      Object.assign(core, plugin.think);
      core.app.modules = loader.modules;
      core.app.services = loader.loadService();
      core.Controller.prototype.service = require('../../packages/thinkjs/lib/extend/controller.js').service;
      Object.assign(core.Controller.prototype, plugin.controller);
      const ctx = {
        module: 'admin', model: plugin.context.model,
        service: require('../../packages/thinkjs/lib/extend/context.js').service,
        config(name) { return name === 'model' ? {type: 'default', default: {handle: Adapter}, alternate: {handle: Adapter}, common: {handle: Adapter}} : {}; }
      };
      const fixture = require(path.join(output, 'consumer.js'));
      const controller = new fixture.PageController(ctx);
      const logic = new fixture.PageLogic(ctx);
      assert.equal(controller.ctx, ctx);
      assert.equal(logic.ctx, ctx);
      assert.equal(Object.hasOwn(controller, 'model'), false);
      assert.equal(Object.hasOwn(logic, 'model'), false);
      assert.deepEqual(controller.indexAction(), {current: multi ? 42 : true, context: multi ? 42 : true, common: true, inherited: 7, legacy: 'legacy', own: 9, count: 41, table: 'unregistered_table'});
      assert.equal(logic.indexAction(), multi ? 42 : true);
      assert.equal(fixture.globalLookup(core), true);
      assert.equal(core.model('nested/item').modelName, 'item', 'nested key selects model; basename is the constructor name');
      assert.equal(core.model('new_table').constructor, core.Model);
      assert.equal(core.model('shared', undefined, 'missing').constructor, multi ? core.Model : runtimeMaps.__single__.shared);
      assert.equal(core.model('shared', undefined, '').constructor, multi ? core.Model : runtimeMaps.__single__.shared);
      assert.equal(core.model('shared', undefined, undefined).commonOnly(), true);
      assert.equal(plugin.service.model('shared').commonOnly(), true);
      assert.equal(controller.model('shared', 'alternate').config.type, 'alternate');
      assert.equal(controller.model('shared', 'common').constructor, multi ? runtimeMaps.admin.shared : runtimeMaps.__single__.shared);
      assert.equal(configCalls.at(-1).module, undefined);
      if (multi) {
        assert.equal(generated.manifest.models.admin.shared, 'src/admin/model/shared.ts');
        assert.equal(generated.manifest.models.admin['nested/item'], 'src/common/model/nested/item.ts');
        assert.equal(core.model('shared', undefined, 'empty').commonOnly(), true);
        assert.equal(controller.model('shared', undefined, 'common').commonOnly(), true);
      }
    });
  }
}
