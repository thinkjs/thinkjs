const test = require('ava');

test('config-load-adapter will call load_config_by_name with right params', t=>{
  const mock = require('mock-require');
  mock('../loader/config_load_config_by_name', function(a, b, c){
    a[b+c] = 'value';
  })
  const loadAdapter = require('../loader/config_load_config');
  t.deepEqual(loadAdapter('configPaths', 'env', 'name'), {
    'configPathsname.js': 'value',
    'configPathsname.env.js': 'value'
  });
});

test('config-load-adapter will call load_config_by_name with right params default name = "config"', t=>{
  const mock = require('mock-require');
  mock('../loader/config_load_config_by_name', function(a, b, c){
    a[b+c] = 'value';
  })
  const loadAdapter = require('../loader/config_load_config');
  t.deepEqual(loadAdapter('configPaths', 'env'), {
    'configPathsconfig.js': 'value',
    'configPathsconfig.env.js': 'value'
  });
});