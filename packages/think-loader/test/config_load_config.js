const test = require('ava');

function getInstance() {
  const config = require('../loader/config');
  return new config();
}

test('config_load_adapter will call load_config_by_name with right params', t=>{

  const instance = getInstance();
  instance.loadConfigByName = function(a, b, c){
    a[b+c] = 'value';
  };

  t.deepEqual(instance.loadConfig('configPaths', 'env', 'name'), {
    'configPathsname.js': 'value',
    'configPathsname.env.js': 'value'
  });
});

test('config_load_adapter will call load_config_by_name with right params default name = "config"', t=>{
  const instance = getInstance();
  instance.loadConfigByName = function(a, b, c){
    a[b+c] = 'value';
  };
  t.deepEqual(instance.loadConfig('configPaths', 'env'), {
    'configPathsconfig.js': 'value',
    'configPathsconfig.env.js': 'value'
  });
});