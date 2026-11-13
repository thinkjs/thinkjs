import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp, Controller} from '../../edge/index.js';

let count = 0;
let reached = false;
class Index extends Controller {
  indexAction() {
    reached = true;
  }
}
const app = createApp(
  {
    controllers: {index: Index},
    bootstrap: [
      () => {
        count++;
        throw new Error('bootstrap failed');
      }
    ]
  },
  {logger: {error() {}}}
);

test('initialization failure is sticky and prevents business execution', async () => {
  const responses = await Promise.all(
    Array.from({length: 3}, () =>
      app.fetch(new Request('https://example.com/'))
    )
  );
  assert.deepEqual(
    responses.map((response) => response.status),
    [500, 500, 500]
  );
  assert.equal(count, 1);
  assert.equal(reached, false);
});
