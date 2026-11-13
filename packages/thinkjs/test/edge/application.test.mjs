import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import Application from '../../lib/application.js';
import {Application as EdgeApplication, think} from '../../edge/index.js';
import contextMethods from '../../lib/core/context.js';
import controllerMethods from '../../lib/extend/controller.js';
import logicMethods from '../../lib/extend/logic.js';

const require = createRequire(import.meta.url);

test('Application.run dispatches edge before Node startup and shares existing business methods', async () => {
  assert.equal(EdgeApplication, Application);
  class Index extends think.Controller {
    indexAction() {
      return this.success(this.get('name'));
    }
  }
  const application = new Application({
    runtime: 'edge',
    manifest: {controllers: {index: Index}}
  });
  for (const method of [
    '_isRunInTest',
    'parseArgv',
    'startWatcher',
    'runInMaster',
    'runInWorker'
  ]) {
    application[method] = () => {
      throw new Error(`Node-only method called: ${method}`);
    };
  }
  assert.equal(application.node, undefined);
  assert.equal(application._isRunInEdge(), true);
  const app = application.run();
  assert.equal(application.run(), app);
  const response = await app.fetch(
    new Request('https://example.com/?name=shared')
  );
  assert.equal((await response.json()).data, 'shared');
  assert.equal(app.context.param, contextMethods.param);
  assert.equal(app.context.post, contextMethods.post);
  assert.equal(app.context.success, contextMethods.success);
  assert.equal(think.Controller.prototype.action, controllerMethods.action);
  assert.equal(think.Logic.prototype.validate, logicMethods.validate);
  assert.equal(
    Object.keys(require.cache).some((file) =>
      file.includes('/lib/runtime/node.js')
    ),
    false
  );
});
