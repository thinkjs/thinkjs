import {test} from 'node:test';
import assert from 'node:assert/strict';
import Application, {think} from '../../lib/index.js';

class Index extends think.Controller {
  indexAction() {
    return this.success('same Application');
  }
}

test('the existing Node package entry can explicitly select Edge through run()', async () => {
  const application = new Application({runtime: 'edge', manifest: {controllers: {index: Index}}});
  const app = application.run();
  assert.equal(app.think, think);
  assert.equal(application.node, undefined);
  const response = await app.fetch(new Request('https://example.com/'));
  assert.equal((await response.json()).data, 'same Application');
});
