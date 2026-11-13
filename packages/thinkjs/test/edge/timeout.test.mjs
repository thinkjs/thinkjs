import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../../edge/index.js';

const app = createApp(
  {
    config: {startServerTimeout: 20},
    bootstrap: [() => new Promise(() => {})]
  },
  {logger: {error() {}}}
);

test('timeout covers bootstrap and remains failed', async () => {
  const response = await app.fetch(new Request('https://example.com/'));
  assert.equal(response.status, 500);
  assert.equal(
    (await app.fetch(new Request('https://example.com/'))).status,
    500
  );
});
