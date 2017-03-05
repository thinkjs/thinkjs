const test = require('ava');

test('config-load-adapter will call load-config-by-name with right params', t=>{
  const mock = require('mock-require');
  mock('../loader/config-load-config-by-name', function(a, b, c){
    a[b+c] = 'value';
  })
  const loadAdapter = require('../loader/config-load-config');
  t.deepEqual(loadAdapter('configPaths', 'env', 'name'), {
    'configPathsname.js': 'value',
    'configPathsname.env.js': 'value'
  });
});

test('config-load-adapter will call load-config-by-name with right params default name = "config"', t=>{
  const mock = require('mock-require');
  mock('../loader/config-load-config-by-name', function(a, b, c){
    a[b+c] = 'value';
  })
  const loadAdapter = require('../loader/config-load-config');
  t.deepEqual(loadAdapter('configPaths', 'env'), {
    'configPathsconfig.js': 'value',
    'configPathsconfig.env.js': 'value'
  });
});