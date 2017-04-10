const test = require('ava');
const startServer = require('./server.js');
const curl = require('../index.js').controller.curl;
let stopServer = null;

test.before(t => {
  startServer(1995, stop => {
    stopServer = stop;
  });
});

test('Request', t => {
  return curl('http://127.0.0.1:1995/200').then(body => {
    t.is(body, 'GET /200');
  });
});

test('Response 404', t => {
  return curl('http://127.0.0.1:1995/404').catch(error => {
    t.is(error.statusCode, 404);
  });
});

test('Post Method', t => {
  return curl.post('http://127.0.0.1:1995/200').then(body => {
    t.is(body, 'POST /200');
  });
});

test('Options', t => {
  const options = {
    method: 'DELETE',
    uri: 'http://127.0.0.1:1995/200'
  };

  return curl(options).then(body => {
    t.is(body, 'DELETE /200');
  });
});

test('resolveWithFullResponse', t => {
  const options = {
    method: 'DELETE',
    uri: 'http://127.0.0.1:1995/200',
    resolveWithFullResponse: true
  };

  return curl(options).then(res => {
    t.is(res.body, 'DELETE /200');
  });
});

test.after(t => {
  stopServer();
});