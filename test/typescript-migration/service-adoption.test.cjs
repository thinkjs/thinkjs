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
    test(`TS ${ts.version}: generated ${multi ? 'multi' : 'single'} legacy adoption (define fields: ${useDefineForClassFields})`, t => {
      const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-service-adoption-'));
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
        [`${prefix}service/counter.ts`]: 'export default class Counter { constructor(public count: number) {} }',
        [`${prefix}service/payload.ts`]: 'export default class Payload { constructor(public value: {name: string}) {} }',
        [`${prefix}service/optional.ts`]: 'export default class Optional { constructor(public value: undefined, public count: number) {} }',
        [`${prefix}service/shared.ts`]: 'export default class Shared { commonOnly = true; }'
      };
      if (multi) {
        files['admin/service/shared.ts'] = 'export default class Local { adminOnly = 42; }';
        fs.mkdirSync(path.join(source, 'common/config'), {recursive: true});
        fs.mkdirSync(path.join(output, 'src/common/config'), {recursive: true});
      }
      for (const [file, content] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(source, file)), {recursive: true});
        fs.writeFileSync(path.join(source, file), content);
      }
      generate({root: temporary});
      const consumer = path.join(temporary, 'consumer.ts');
      fs.writeFileSync(consumer, `
        import type { Think, Context, Controller, Logic } from 'thinkjs';
        import type { AppThink, AppContext, AppController } from './.thinkjs/types';

        // Only annotate these two members once in the application's base classes.
        // 'declare' must not create an own field that shadows the runtime method.
        export class BaseController extends think.Controller {
          declare service: AppController<Controller, 'admin'>['service'];
          declare ctx: AppContext<Context>;
        }
        export class PageController extends BaseController {
          indexAction() {
            const current: ${multi ? 'number' : 'boolean'} = this.service('shared').${multi ? 'adminOnly' : 'commonOnly'};
            const common: boolean = this.ctx.service('shared').commonOnly;
            const count: number = this.service('counter', 41).count;
            const payload: string = this.service('payload', {name: 'object'}).value.name;
            const optional: number = this.service('optional', undefined, 42).count;
            if (false) {
              // @ts-expect-error strict instance calls cannot escape to the legacy any signature
              this.service('conter', 1);
              // @ts-expect-error source constructor type is preserved
              this.service('counter', 'wrong');
              // @ts-expect-error object constructor shape is checked
              this.service('payload', {name: 1});
              // @ts-expect-error ctx is also the generated strict view
              this.ctx.service('conter');
              // @ts-expect-error required constructor parameter is still required
              this.service('counter');
              ${multi ? `
              // @ts-expect-error Context defaults to common, not the request's admin module
              this.ctx.service('shared').adminOnly;
              // @ts-expect-error recognized module consumes argument two, leaving count missing
              this.service('counter', 'admin');
              ` : ''}
            }
            return {current, common, count, payload, optional};
          }
        }
        export class PageLogic extends think.Logic {
          declare service: AppController<Logic, 'admin'>['service'];
          declare ctx: AppContext<Context>;
          indexAction() {
            this.rules = {};
            const count: number = this.service('counter', 43).count;
            if (false) {
              // @ts-expect-error Logic does not retain the legacy any overload
              this.service('counter', 'wrong');
              this.validate({});
            }
            return count;
          }
        }
        export function boundaries(global: Think, context: Context, controller: Controller, logic: Logic) {
          const app: AppThink<Think> = global;
          const ctx: AppContext<Context> = context;
          const ctl: AppController<Controller, 'admin'> = controller;
          const check: AppController<Logic, 'admin'> = logic;
          return [
            app.service('counter', ${multi ? 'undefined, ' : ''}1).count,
            ctx.service('payload', ${multi ? 'null, ' : ''}{name: 'boundary'}).value.name,
            ctl.service('counter', 2).count,
            check.service('counter', 3).count
          ];
        }
        // An application override written against the old signature still compiles.
        export class ExistingController extends think.Controller {
          service(name: string, module?: string, ...args: any[]): any {
            return super.service(name, module, ...args);
          }
        }
        export function legacy(context: Context, controller: Controller, logic: Logic) {
          // Existing untyped code remains broad, including valid non-string args.
          context.service('payload', ${multi ? 'undefined, ' : ''}{name: 'legacy'});
          controller.service('counter', 1);
          controller.service('optional', undefined, 2);
          logic.service('counter', 3);
          if (false) {
            context.service('legacy-unknown');
            controller.service('legacy-unknown');
            // @ts-expect-error even the compatibility entry still requires a string name
            controller.service(42);
          }
        }
      `);
      const program = ts.createProgram([consumer], {
        strict: true, skipLibCheck: true, noEmitOnError: true, types: [],
        useDefineForClassFields, target: ts.ScriptTarget.ES2018,
        module: ts.ModuleKind.CommonJS, moduleResolution: ts.ModuleResolutionKind.NodeJs,
        rootDir: temporary, outDir: output, baseUrl: root,
        paths: {thinkjs: ['packages/thinkjs/index.d.ts'], 'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts']}
      });
      const diagnostics = ts.getPreEmitDiagnostics(program);
      assert.deepEqual(diagnostics.map(d => `${d.file && path.basename(d.file.fileName)}:${d.file && d.file.getLineAndCharacterOfPosition(d.start).line + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`), []);
      assert.equal(program.emit().emitSkipped, false);
      const emitted = fs.readFileSync(path.join(output, 'consumer.js'), 'utf8');
      assert.doesNotMatch(emitted, /require\(/, 'type-only imports add no runtime dependency');

      delete require.cache[thinkFile];
      require(thinkFile);
      const core = global.think;
      const contextExtension = require('../../packages/thinkjs/lib/extend/context.js');
      const controllerExtension = require('../../packages/thinkjs/lib/extend/controller.js');
      core.Controller.prototype.service = controllerExtension.service;
      const Loader = require('../../packages/think-loader');
      const loader = new Loader(path.join(output, 'src'));
      core.app.modules = loader.modules;
      core.app.services = loader.loadService();
      const fixture = require(path.join(output, 'consumer.js'));
      const ctx = {module: 'admin', service: contextExtension.service};
      const controller = new fixture.PageController(ctx);
      const logic = new fixture.PageLogic(ctx);
      assert.equal(controller.ctx, ctx, 'declare ctx preserves the constructor-injected context');
      assert.equal(logic.ctx, ctx);
      assert.equal(Object.hasOwn(controller, 'service'), false, 'declare service must not shadow its prototype');
      assert.equal(Object.hasOwn(logic, 'service'), false);
      assert.deepEqual(controller.indexAction(), {current: multi ? 42 : true, common: true, count: 41, payload: 'object', optional: 42});
      assert.equal(logic.indexAction(), 43);
      assert.deepEqual(fixture.boundaries(core, ctx, controller, logic), [1, 'boundary', 2, 3]);
      fixture.legacy(ctx, controller, logic);
    });
  }
}
