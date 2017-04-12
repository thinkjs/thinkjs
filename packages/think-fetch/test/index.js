const test = require('ava');
const startServer = require('./server.js');
const fetch = require('../index.js').controller.fetch;
let stopServer = null;

test.before(t => {
  startServer(1995, stop => {
    stopServer = stop;
  });
});

test('Fetch', t => {
  return fetch('http://127.0.0.1:1995/200').then(res => {
    t.true(res.ok);
  });
});

test('should return a promise', t => {
  const p = fetch('http://127.0.0.1:1995/200');
  t.true(p instanceof fetch.Promise)
});

test('Should return 404 status', t => {
  return fetch('http://127.0.0.1:1995/404').then(res => {
    t.is(res.status, 404);
  });
});

test('Should can get the correct text', t => {
  return fetch('http://127.0.0.1:1995/200').then(res => res.text()).then(text => {
    t.is(text, 'GET /200');
  });
});

test('Should can get the correct json', t => {
  return fetch('http://127.0.0.1:1995/json').then(res => res.json()).then(json => {
    t.deepEqual(json, {name: 'value'});
  });
});

test.after(t => {
  stopServer();
});