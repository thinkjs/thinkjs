const test = require('ava');

test('config_load_adapter will call load-config with right params', t=>{
  const mock = require('mock-require');
  mock('../loader/config_load_config', function(a, b, c){
    t.is(a, 1);
    t.is(b, 2);
    t.is(c, 'adapter');
    return 'result';
  })
  const loadAdapter = require('../loader/config_load_adapter');
  t.is(loadAdapter(1, 2), 'result');
});