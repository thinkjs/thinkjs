const assert = require('node:assert/strict');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');
const root = path.resolve(__dirname, '../..');
const localRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT
  ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT)) : localRequire('typescript');

test(`TS ${ts.version}: standalone opt-in service contract, strict with full declaration checking`, () => {
  const program = ts.createProgram([path.join(__dirname, 'service-types-fixtures/contract.ts')], {
    noEmit: true, strict: true, skipLibCheck: false, types: [],
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    baseUrl: root, paths: {'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts']}
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.deepEqual(diagnostics.map(d => `${d.file && path.basename(d.file.fileName)}:${d.file && d.file.getLineAndCharacterOfPosition(d.start).line + 1} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`), []);
});

test('service contract mirrors runtime module dispatch and export behavior', () => {
  const thinkPath = path.join(root, 'packages/thinkjs/lib/think.js');
  const previousThink = Object.getOwnPropertyDescriptor(global, 'think');
  const previousModule = require.cache[require.resolve(thinkPath)];
  try {
    delete require.cache[require.resolve(thinkPath)];
    require(thinkPath);
    const core = global.think;
    const controller = require(path.join(root, 'packages/thinkjs/lib/extend/controller.js'));
    const context = require(path.join(root, 'packages/thinkjs/lib/extend/context.js'));
    class Common { constructor(...args) { this.args = args; this.kind = 'common'; } }
    class Admin { constructor(...args) { this.args = args; this.kind = 'admin'; } }
    const object = {default: 'ordinary property'};
    core.app.modules = [];
    core.app.services = {same: Common, object};
    assert.deepEqual(core.service('same', 'admin').args, ['admin']);
    assert.equal(core.service('object'), object);
    core.app.modules = ['common', 'admin', 'empty'];
    core.app.services = {
      common: {same: Common, inherited: Common, object},
      admin: {same: Admin, inherited: Common, object},
      empty: {same: Common, inherited: Common, object}
    };
    const current = {ctx: {module: 'admin'}};
    const call = (...args) => controller.service.apply(current, args);
    assert.equal(core.service('same').kind, 'common');
    assert.equal(context.service.call({module: 'admin'}, 'same').kind, 'common');
    assert.equal(call('same').kind, 'admin');
    assert.deepEqual(call('same', 'constructor-value').args, ['constructor-value']);
    assert.deepEqual(call('same', undefined, 1).args, [undefined, 1]);
    assert.deepEqual(core.service('same', undefined, 1).args, [1]);
    assert.equal(call('same', 'common').kind, 'common');
    assert.deepEqual(call('same', 'admin').args, []);
    assert.deepEqual(call('same', 'admin', 'admin').args, ['admin']);
    assert.equal(call('inherited').kind, 'common');
    assert.equal(call('object'), object);
    assert.throws(() => core.service('same', 'unknown'), /can not find service/);
  } finally {
    if (previousThink) Object.defineProperty(global, 'think', previousThink);
    else delete global.think;
    if (previousModule) require.cache[require.resolve(thinkPath)] = previousModule;
    else delete require.cache[require.resolve(thinkPath)];
  }
});


test(`TS ${ts.version}: legacy Think/Context/Controller adoption without casts (legacy declarations require skipLibCheck)`, () => {
  const file = path.join(__dirname, 'service-types-fixtures/integration.ts');
  const program = ts.createProgram([file], {
    noEmit: true, strict: true, skipLibCheck: true, types: [],
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs, baseUrl: root,
    paths: {thinkjs: ['packages/thinkjs/index.d.ts'], 'thinkjs/service-types': ['packages/thinkjs/service-types.d.ts']}
  });
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
  const source = require('node:fs').readFileSync(file, 'utf8');
  const emitted = ts.transpileModule(source, {compilerOptions: {
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS
  }}).outputText;
  assert.doesNotMatch(emitted, /require\(/, 'all imports in this integration fixture are type-only');
  const exports = {};
  require('node:vm').runInNewContext(emitted, {exports});
  // Invoke the emitted consumer against the real global service implementation.
  const thinkPath = path.join(root, 'packages/thinkjs/lib/think.js');
  const previousThink = Object.getOwnPropertyDescriptor(global, 'think');
  const previousModule = require.cache[require.resolve(thinkPath)];
  try {
    delete require.cache[require.resolve(thinkPath)];
    require(thinkPath);
    const core = global.think;
    class Counter { constructor(count) { this.count = count; } }
    core.app.modules = ['common', 'admin'];
    core.app.services = {common: {counter: Counter}, admin: {counter: Counter}};
    assert.equal(exports.globalCounter(core), 42);
    const context = require(path.join(root, 'packages/thinkjs/lib/extend/context.js'));
    assert.equal(exports.contextCounter(context), 43);
    const controller = require(path.join(root, 'packages/thinkjs/lib/extend/controller.js'));
    assert.equal(exports.controllerCounter({ctx: {module: 'admin'}, service: controller.service}), 44);
  } finally {
    if (previousThink) Object.defineProperty(global, 'think', previousThink);
    else delete global.think;
    if (previousModule) require.cache[require.resolve(thinkPath)] = previousModule;
    else delete require.cache[require.resolve(thinkPath)];
  }
});
