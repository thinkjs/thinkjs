const test = require('ava');

test('config-load-adapter will call load-config with right params', t=>{
  const mock = require('mock-require');
  mock('../loader/config-load-config', function(a, b, c){
    t.is(a, 1);
    t.is(b, 2);
    t.is(c, 'adapter');
    return 'result';
  })
  const loadAdapter = require('../loader/config-load-adapter');
  t.is(loadAdapter(1, 2), 'result');
});