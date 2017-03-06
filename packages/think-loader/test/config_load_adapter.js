const test = require('ava');
const path = require('path');

test('config_load_adapter will load adapter and build cache', t=>{
  const mock = require('mock-require');

  mock('a.js', {a: 1});
  mock(path.join('session', 'b.js'), {b: 2});
  mock(path.join('session', 'session', 'c.js'), {c: 3});

  const helper = require('think-helper');
  helper.getdirFiles = function(p) {
    t.is(p, 'adapterPath');
    return [
      'a.js',
      path.join('session', 'b.js'),
      path.join('session', 'session', 'c.js')
    ];
  }

  const loadAdapter = require('../loader/config_load_adapter');
  var result = t.is(loadAdapter('adapterPath'));
  t.deepEqual(result, {
    session: {b: 2}
  });
});