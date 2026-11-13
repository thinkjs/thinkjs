const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {createRequire} = require('node:module');
const {test} = require('node:test');

const root = path.resolve(__dirname, '../..');
const fixture = path.join(__dirname, 'toolchain-fixtures');
const localRequire = createRequire(path.join(root, 'packages/think-typescript/package.json'));
// Override for a second compiler without adding a migration dependency or changing the lockfile.
const ts = process.env.THINKJS_AUDIT_TYPESCRIPT
  ? require(path.resolve(process.env.THINKJS_AUDIT_TYPESCRIPT))
  : localRequire('typescript');
const transpile = localRequire('./index.js');

function diagnostics(file, skipLibCheck = true) {
  const program = ts.createProgram([path.join(fixture, file)], {
    noEmit: true, strict: true, skipLibCheck, types: [],
    target: ts.ScriptTarget.ES2018, module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    baseUrl: root, paths: {thinkjs: ['packages/thinkjs/index.d.ts']}
  });
  return ts.getPreEmitDiagnostics(program);
}

test(`TS ${ts.version}: global, named import and subclass baseline (skipLibCheck)`, () => {
  assert.deepEqual(diagnostics('consumer.ts').map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
});

test('existing declarations do not describe the bootstrap constructor or no-arg hook', () => {
  const ownErrors = diagnostics('known-gaps.ts').filter(d => d.file && d.file.fileName.endsWith('known-gaps.ts'));
  assert.deepEqual(ownErrors.map(d => d.code).sort(), [2351, 2554]);
});

test('full declaration validation is not a passing baseline', () => {
  assert.ok(diagnostics('consumer.ts', false).length > 0,
    'If declarations now pass, replace this characterization with a strict contract test');
});

test('transpileModule emits a semantic error which a program typecheck rejects', () => {
  const text = fs.readFileSync(path.join(fixture, 'semantic-error.ts'), 'utf8');
  const result = ts.transpileModule(text, {reportDiagnostics: true,
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018}});
  assert.equal(result.diagnostics.length, 0);
  assert.match(result.outputText, /not a number/);
  assert.ok(diagnostics('semantic-error.ts').some(d => d.code === 2322));
});

test('installed think-typescript emits nested JS/maps without mutating input', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-toolchain-'));
  try {
    const srcPath = path.join(temporary, 'src');
    const outPath = path.join(temporary, 'app');
    fs.mkdirSync(path.join(srcPath, 'bootstrap'), {recursive: true});
    const input = 'export const answer: number = "not a number";\n';
    const source = path.join(srcPath, 'bootstrap/worker.ts');
    fs.writeFileSync(source, input);
    assert.equal(transpile({srcPath, outPath, file: 'bootstrap/worker.ts'}), true);
    assert.equal(fs.readFileSync(source, 'utf8'), input);
    assert.match(fs.readFileSync(path.join(outPath, 'bootstrap/worker.js'), 'utf8'), /not a number/);
    const map = JSON.parse(fs.readFileSync(path.join(outPath, 'bootstrap/worker.js.map'), 'utf8'));
    assert.equal(path.resolve(outPath, 'bootstrap', map.sources[0]), source);
    fs.writeFileSync(source, 'const x = ;');
    assert.ok(transpile({srcPath, outPath, file: 'bootstrap/worker.ts'}) instanceof Error);
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true});
  }
});

test('default watcher covers code but not resources and does not start a timer', () => {
  const Watcher = require(path.join(root, 'packages/think-watcher'));
  const watcher = new Watcher({srcPath: fixture}, () => {});
  const accepts = file => watcher.options.filter({file}, watcher.options);
  for (const file of ['controller/a.ts', 'bootstrap/worker.js', 'config/a.es']) assert.equal(accepts(file), true);
  for (const file of ['config/data.json', 'view/index.html', '.hidden/a.ts']) assert.equal(accepts(file), false);
  assert.equal(watcher.timer, null);
});

for (const multi of [false, true]) {
  test(`TS emitted CommonJS loads ${multi ? 'multi' : 'single'}-module services and Controller/Context calls`, () => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'thinkjs-ts-loader-'));
    const previousThink = Object.getOwnPropertyDescriptor(global, 'think');
    const thinkPath = path.join(root, 'packages/thinkjs/lib/think.js');
    const previousModule = require.cache[require.resolve(thinkPath)];
    try {
      delete require.cache[require.resolve(thinkPath)];
      require(thinkPath);
      const core = global.think;
      const controller = require(path.join(root, 'packages/thinkjs/lib/extend/controller.js'));
      const context = require(path.join(root, 'packages/thinkjs/lib/extend/context.js'));
      core.Controller.prototype.service = controller.service;
      const app = path.join(temporary, 'app');
      const emit = (input, relative) => {
        const output = path.join(app, relative);
        fs.mkdirSync(path.dirname(output), {recursive: true});
        const result = ts.transpileModule(fs.readFileSync(path.join(fixture, input), 'utf8'), {
          compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018}
        });
        fs.writeFileSync(output, result.outputText);
      };
      const prefix = multi ? 'common/' : '';
      emit('service.ts', `${prefix}service/class.js`);
      emit('object.ts', `${prefix}service/object.js`);
      emit('controller.ts', `${multi ? 'admin/' : ''}controller/index.js`);
      if (multi) fs.mkdirSync(path.join(app, 'common/config'), {recursive: true});
      const Loader = require(path.join(root, 'packages/think-loader'));
      const loader = new Loader(app);
      core.app.modules = loader.modules;
      core.app.services = loader.loadService();
      const services = multi ? core.app.services.admin : core.app.services;
      assert.equal(new services.class('constructor').value, 'constructor');
      assert.equal(services.object.value, 'object');
      assert.equal(services.class.default, undefined);
      assert.ok(services.class.prototype.__filename.endsWith('service/class.js'));
      const loaded = loader.loadController();
      const Controller = multi ? loaded.admin.index : loaded.index;
      const instance = new Controller({module: 'admin'});
      assert.equal(instance.indexAction(), 'from-controller');
      const args = multi ? ['class', 'admin', 'from-context'] : ['class', 'from-context'];
      assert.equal(context.service(...args).value, 'from-context');
      assert.equal(context.service('object'), multi ? core.app.services.common.object : services.object);
    } finally {
      if (previousThink) Object.defineProperty(global, 'think', previousThink);
      else delete global.think;
      if (previousModule) require.cache[require.resolve(thinkPath)] = previousModule;
      else delete require.cache[require.resolve(thinkPath)];
      for (const file of Object.keys(require.cache)) {
        if (file.startsWith(temporary + path.sep)) delete require.cache[file];
      }
      fs.rmSync(temporary, {recursive: true, force: true});
    }
  });
}
