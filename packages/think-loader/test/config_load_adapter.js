const test = require('ava');
const path = require('path');

test('config_load_adapter will load adapter and build cache', t=>{
  const mock = require('mock-require');

  mock(path.join('adapterPath', 'a.js'), {a: 1});
  mock(path.join('adapterPath', 'session', 'b.js'), {b: 2});
  mock(path.join('adapterPath', 'session', 'session', 'c.js'), {c: 3});

  const helper = require('think-helper');
  helper.getdirFiles = function(p) {
    t.is(p, 'adapterPath');
    return [
      'a.js',
      path.join('session', 'b.js'),
      path.join('session', 'session', 'c.js')
    ];
  }

  const instance = require('../loader/config');
  var result = (new instance()).loadAdapter('adapterPath');
  t.deepEqual(result, {
    session: {b: {b: 2}}
  });
});