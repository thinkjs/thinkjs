'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');
const {generate} = require('../../packages/think-ts-helper');
const ConfigLoader = require('../../packages/think-loader/loader/config');
const {getConfigFn} = require('../../packages/think-config');
const root = path.resolve(__dirname, '../..');
const localRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT
  ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : localRequire('typescript');

function sourceFiles(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(ts|js)$/.test(file) ? [file] : [];
  });
}

for (const multi of [false, true]) {
  for (const models of [false, true]) {
    test(`TS ${ts.version}: generated Config merge/env parity (${multi ? 'multi' : 'single'}, models: ${models})`, t => {
      const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-config-generation-'));
      const output = path.join(temporary, 'app');
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
      write(`src/${prefix}config/config.ts`, `
        const shared = {keep: 1, replace: 'base', maybe: 2};
        const config = {port: undefined, nested: shared, shape: {old: true}, empty: {}, callback: () => 42};
        export = config;
      `);
      write(`src/${prefix}config/config.production.ts`, `
        const config = {nested: {replace: true, maybe: undefined, added: 'production'}, shape: 5, envOnly: 7};
        export = config;
      `);
      write(`src/${prefix}config/config.staging.js`, 'module.exports = {nested: {replace: null}, shape: {staging: true}};');
      write(`src/${prefix}service/counter.ts`, 'export default class Counter { count = 7; }');
      if (models) write(`src/${prefix}model/user.ts`, 'export default class User { where(value: object) { return this; } custom() { return true; } }');
      if (multi) {
        write('src/admin/config/config.ts', 'const config = {nested: {local: 4, replace: 8}, onlyLocal: true}; export = config;');
        write('src/admin/config/config.production.ts', 'const config = {nested: {replace: "local production"}}; export = config;');
        fs.mkdirSync(path.join(temporary, 'src/empty'));
      }
      generate({root: temporary, models, configs: true});
      write('consumer.ts', `
        import type { AppThink, AppContext, AppController } from './.thinkjs/types';
        interface BaseModel { where(value: object): BaseModel; }
        interface Host { model(name: string, config?: any, module?: string): BaseModel; service(name: string): any; config(name?: string, value?: any, module?: string): any; retained: number; }
        declare const app: AppThink<Host>;
        declare const ctx: AppContext<Host, 'admin'>;
        declare const ctl: AppController<Host, 'admin'>;
        const port: number = app.config('port');
        const keep: number = app.config('nested.keep');
        const undefinedDoesNotOverwrite: number = app.config('nested.maybe');
        const optional: number | undefined = app.config('envOnly');
        const nested = app.config('nested');
        const nestedOptional: string | undefined = nested.added;
        const nestedKeep: number = nested.keep;
        const replaced: string | boolean | null = app.config('nested.replace');
        const local: ${multi ? 'number | string | null' : 'string | boolean | null'} = ctx.config('nested.replace');
        const localController: ${multi ? 'number | string | null' : 'string | boolean | null'} = ctl.config('nested.replace');
        const shape: {old: boolean; staging?: boolean} | number = app.config('shape');
        const removedChild: boolean | undefined = app.config('shape.old');
        const callback: number = app.config('callback')();
        const count: number = app.service('counter').count + ctx.service('counter').count + ctl.service('counter').count;
        ${models ? 'const custom: boolean = app.model("user").custom() && ctx.model("user").custom() && ctl.model("user").custom();' : ''}
        const retained: number = app.retained + ctx.retained + ctl.retained;
        app.config('nested.keep', 2);
        ctx.config('nested.keep', 3);
        // @ts-expect-error unknown config paths are not any
        const unknown: number = app.config('missing');
        // @ts-expect-error a base-only runtime environment is possible
        const required: number = app.config('envOnly');
        // @ts-expect-error environment overrides must remain in the union
        const baseOnly: string = app.config('nested.replace');
        // @ts-expect-error optional nested properties cannot be read as always present
        const missing: string = nested.added;
        // @ts-expect-error generated writes retain value constraints
        app.config('nested.keep', 'wrong');
        // @ts-expect-error config composition does not erase Service constraints
        ctl.service('missing');
        ${models ? '// @ts-expect-error Config composition does not invent custom methods on unknown table names\n app.model("missing").custom();' : ''}
      `);
      const program = ts.createProgram([path.join(temporary, 'consumer.ts'), ...sourceFiles(path.join(temporary, 'src'))], {
        strict: true, skipLibCheck: false, types: [], allowJs: true, checkJs: false,
        target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs, rootDir: temporary, outDir: output, baseUrl: root,
        paths: {
          'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts'],
          'think-model/model-types': ['packages/think-model/model-types.d.ts'],
          'think-config/config-types': ['packages/think-config/config-types.d.ts']
        }
      });
      assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => `${d.file && path.basename(d.file.fileName)}:${d.file && d.file.getLineAndCharacterOfPosition(d.start).line + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`), []);
      assert.equal(program.emit().emitSkipped, false);
      // The empty module has no config source for tsc to emit; the application
      // build is responsible for preserving the module directory.
      if (multi) fs.mkdirSync(path.join(output, 'src/empty'), {recursive: true});
      const loader = new ConfigLoader();
      for (const env of ['unlisted', 'production', 'staging']) {
        const data = loader.load(path.join(output, 'src'), env, multi ? ['common', 'admin', 'empty'] : []);
        const config = getConfigFn(data, multi);
        assert.equal(config('port'), 8360, 'undefined app override preserves system default');
        assert.equal(config('nested.keep'), 1);
        assert.equal(config('nested.maybe'), 2, 'undefined env override preserves base');
        assert.equal(config('nested.replace'), env === 'production' ? true : env === 'staging' ? null : 'base');
        assert.equal(config('nested.added'), env === 'production' ? 'production' : undefined);
        assert.equal(config('envOnly'), env === 'production' ? 7 : undefined);
        assert.equal(config('shape.old'), env === 'production' ? undefined : true);
        assert.equal(config('callback')(), 42);
        if (multi) {
          assert.equal(config('nested.replace', undefined, 'admin'), env === 'production' ? 'local production' : env === 'staging' ? null : 8);
          assert.equal(config('nested.local', undefined, 'admin'), 4);
          assert.equal(config('nested.keep', undefined, 'empty'), 1);
        }
      }
    });
  }
}

test(`TS ${ts.version}: Config raw namespace default and CommonJS named exports agree with loader`, t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-config-namespace-'));
  t.after(() => {
    for (const file of Object.keys(require.cache)) if (file.startsWith(temporary + path.sep)) delete require.cache[file];
    fs.rmSync(temporary, {recursive: true, force: true});
  });
  fs.mkdirSync(path.join(temporary, 'src/config'), {recursive: true});
  fs.mkdirSync(path.join(temporary, 'node_modules'));
  fs.symlinkSync(path.join(root, 'packages/thinkjs'), path.join(temporary, 'node_modules/thinkjs'), 'dir');
  fs.writeFileSync(path.join(temporary, 'src/config/config.ts'), 'export const named = 1; export default {value: "default"};');
  fs.writeFileSync(path.join(temporary, 'src/config/config.production.js'), 'exports.named = 2; exports.default = {extra: true}; exports.missing = undefined; exports.nullable = null;');
  generate({root: temporary, configs: true});
  fs.writeFileSync(path.join(temporary, 'consumer.ts'), `
    import type { AppThink } from './.thinkjs/types';
    declare const app: AppThink<{config(...args: any[]): any; service(...args: any[]): any}>;
    const value: string = app.config('default.value');
    const extra: boolean | undefined = app.config('default.extra');
    const named: number = app.config('named');
    const missing: undefined = app.config('missing');
    const nullable: null | undefined = app.config('nullable');
    // @ts-expect-error JS null/undefined inference must not leak any into the registry
    const nullAsNumber: number = app.config('nullable');
    // @ts-expect-error JS undefined must not leak any into the registry
    const missingAsNumber: number = app.config('missing');
    // @ts-expect-error ES default is not unwrapped by ConfigLoader
    const invented: string = app.config('value');
  `);
  const program = ts.createProgram([path.join(temporary, 'consumer.ts'), ...sourceFiles(path.join(temporary, 'src'))], {
    strict: true, skipLibCheck: false, types: [], allowJs: true, checkJs: false,
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs, rootDir: temporary, outDir: path.join(temporary, 'app'), baseUrl: root,
    paths: {'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts'], 'think-config/config-types': ['packages/think-config/config-types.d.ts']}
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
  assert.equal(program.emit().emitSkipped, false);
  const config = getConfigFn(new ConfigLoader().load(path.join(temporary, 'app/src'), 'production', []), false);
  assert.equal(config('default.value'), 'default');
  assert.equal(config('default.extra'), true);
  assert.equal(config('named'), 2);
  assert.equal(config('value'), undefined);
  assert.equal(config('nullable'), null);
  assert.equal(config('missing'), undefined);
});
