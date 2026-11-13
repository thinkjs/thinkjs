import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildEdge} from '../../edge/build.js';

test('TS static registry, common inheritance, nested controllers, config precedence and hooks', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'thinkjs-multi-'));
  const source = {
    'common/config/extend.js': 'module.exports = [{context: {get greeting() { return "configured"; }}}];',
    'common/extend/context.js': 'module.exports = {get greeting() { return "local"; }};',
    'common/config/validator.js': 'module.exports = {messages: {custom: "custom message"}};',
    'common/config/config.js':
      "module.exports = {value: 'common', nested: {a: 1}};",
    'home/config/config.ts':
      "export default {value: 'module', nested: {b: 2}};",
    'common/config/config.production.js':
      "module.exports = {value: 'common-env'};",
    'home/config/config.production.ts': 'export default {nested: {c: 3}};',
    'common/controller/index.ts': `export default class extends think.Controller {
      indexAction() {
        return this.success({value: this.config('value'), nested: this.config('nested'), greeting: this.ctx.greeting, message: this.ctx.app.validators.messages.custom});
      }
    }`,
    'home/controller/nested/test.ts': `export default class extends think.Controller {
      __before() {
        this.ctx.state.before = true;
      }
      indexAction() {
        this.body = {before: this.ctx.state.before};
      }
      __after() {
        this.body.after = true;
      }
    }`
  };
  try {
    for (const [name, content] of Object.entries(source)) {
      const file = path.join(root, 'src', name);
      await mkdir(path.dirname(file), {recursive: true});
      await writeFile(file, content);
    }
    const output = path.join(root, 'out.mjs');
    await buildEdge({appPath: path.join(root, 'src'), outfile: output});
    const {default: app} = await import(pathToFileURL(output));
    let response = await app.fetch(new Request('https://example.com/'));
    assert.deepEqual((await response.json()).data, {
      value: 'common-env',
      nested: {a: 1, b: 2, c: 3}, greeting: 'local', message: 'custom message'
    });
    response = await app.fetch(
      new Request('https://example.com/home/nested/test')
    );
    assert.deepEqual(await response.json(), {before: true, after: true});
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
