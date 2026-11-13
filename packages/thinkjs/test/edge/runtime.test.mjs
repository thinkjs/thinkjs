import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createApp, Controller, Logic, think} from '../../edge/index.js';

const require = createRequire(import.meta.url);
const Keygrip = createRequire(require.resolve('cookies'))('keygrip');
let initialized = 0;
let cancelled = false;
class Index extends Controller {
  indexAction() {
    return this.success({
      query: this.get(),
      post: this.post(),
      env: this.ctx.env.name
    });
  }
  cookieAction() {
    const old = this.cookie('session');
    this.cookie('session', 'new');
    this.cookie('other', 'two', {signed: false});
    return this.success({old});
  }
  readAction() {
    return this.success({value: this.cookie('session')});
  }
  deleteAction() {
    this.cookie('session', null);
  }
  uploadAction() {
    const file = this.file('file');
    return this.success({name: file.name, size: file.size, path: file.path});
  }
  streamAction() {
    this.body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('stream'));
      },
      cancel() {
        cancelled = true;
      }
    });
  }
  emptyAction() {
    this.status = 204;
    this.body = 'discard';
  }
  redirectAction() {
    return this.redirect('/');
  }
  errorAction() {
    throw new Error('secret');
  }
  async concurrentAction() {
    await new Promise((resolve) =>
      setTimeout(resolve, Number(this.get('delay')))
    );
    return this.success({env: this.ctx.env.name, query: this.get('name')});
  }
  stopAction() {
    this.body = 'stopped';
    return false;
  }
  notmodifiedAction() {
    this.status = 304;
    this.body = 'discard';
  }
  checkedAction() {
    return this.success('valid');
  }
}
class IndexLogic extends Logic {
  stopAction() {
    this.body = 'stopped';
    return false;
  }
  notmodifiedAction() {
    this.status = 304;
    this.body = 'discard';
  }
  checkedAction() {
    this.rules = {name: {required: true, method: 'GET'}};
  }
}
const app = createApp(
  {
    controllers: {index: Index},
    logics: {index: IndexLogic},
    routers: [['/hello/:name', 'index/index']],
    config: {cookie: {keys: ['current', 'previous']}},
    bootstrap: [
      () => {
        initialized++;
        think.beforeStartServer(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        });
      }
    ]
  },
  {bodyLimit: 1024, logger: {error() {}}}
);
const request = (url = '/', init, env) =>
  app.fetch(new Request(`https://example.com${url}`, init), env);

test('initialization is shared; request state is isolated', async () => {
  const responses = await Promise.all([
    request('/index/concurrent?name=a&delay=20', undefined, {name: 'A'}),
    request('/index/concurrent?name=b&delay=0', undefined, {name: 'B'})
  ]);
  assert.equal(initialized, 1);
  assert.deepEqual((await responses[0].json()).data, {env: 'A', query: 'a'});
  assert.deepEqual((await responses[1].json()).data, {env: 'B', query: 'b'});
  assert.throws(() => createApp(), /Only one/);
});

test('router, repeated query, payload, validation and errors', async () => {
  let response = await request('/hello/alice?a=1&a=2');
  assert.deepEqual((await response.json()).data.query, {
    a: ['1', '2'],
    name: 'alice'
  });
  response = await request('/', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: '{"value":1}'
  });
  assert.deepEqual((await response.json()).data.post, {value: 1});
  assert.equal(
    (
      await request('/', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: '{'
      })
    ).status,
    400
  );
  assert.equal(
    (await request('/', {method: 'POST', body: 'x'.repeat(1025)})).status,
    413
  );
  assert.equal((await (await request('/index/checked')).json()).errno, 1001);
  assert.equal(
    (await (await request('/index/checked?name=ok')).json()).errno,
    0
  );
  assert.equal((await request('/absent')).status, 404);
  assert.equal(
    await (await request('/index/error')).text(),
    'Internal Server Error'
  );
  assert.equal((await request('/index/redirect')).headers.get('location'), '/');
});

test('Web File, HEAD, empty response and streaming cancellation', async () => {
  const form = new FormData();
  form.set('file', new File(['hello'], 'test.txt'));
  assert.deepEqual(
    (
      await (
        await request('/index/upload', {method: 'POST', body: form})
      ).json()
    ).data,
    {name: 'test.txt', size: 5}
  );
  assert.equal(await (await request('/', {method: 'HEAD'})).text(), '');
  assert.equal(await (await request('/index/empty')).text(), '');
  const response = await request('/index/stream');
  const reader = response.body.getReader();
  assert.equal(new TextDecoder().decode((await reader.read()).value), 'stream');
  await reader.cancel();
  assert.equal(cancelled, true);
});

test('legacy Keygrip signature compatibility, rotation, tampering and deletion', async () => {
  const previous = new Keygrip(['previous']).sign('session=old');
  let response = await request('/index/read', {
    headers: {cookie: `session=old; session.sig=${previous}`}
  });
  assert.equal((await response.json()).data.value, 'old');
  assert.ok(
    response.headers
      .getSetCookie()
      .some((value) =>
        value.startsWith(
          `session.sig=${new Keygrip(['current']).sign('session=old')};`
        )
      )
  );
  response = await request('/index/read', {
    headers: {cookie: 'session=old; session.sig=tampered'}
  });
  assert.deepEqual((await response.json()).data, {});
  response = await request('/index/cookie');
  assert.equal(response.headers.getSetCookie().length, 3);
  assert.ok(
    response.headers
      .getSetCookie()
      .some((value) =>
        value.startsWith(
          `session.sig=${new Keygrip(['current']).sign('session=new')};`
        )
      )
  );
  response = await request('/index/delete');
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.ok(
    response.headers.getSetCookie().every((value) => value.includes('1970'))
  );
});

test('form and text payloads, empty status and explicit method behavior', async () => {
  let response = await request('/', {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: 'a=1&a=2'
  });
  assert.deepEqual((await response.json()).data.post, {a: ['1', '2']});
  response = await request('/', {method: 'POST', body: 'text body'});
  assert.deepEqual((await response.json()).data.post, {text: 'text body'});
  response = await request('/index/notmodified');
  assert.equal(response.status, 304);
  assert.equal(await response.text(), '');
  assert.equal(response.headers.get('content-type'), null);
  assert.equal(await (await request('/index/stop')).text(), 'stopped');
});
