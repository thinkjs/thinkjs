const helper = require('think-helper');
const path = require('path');
const interopRequire = require('../util.js').interopRequire;
const loadConfig = require('./config-load-config');
const loadAdapter = require('./config-load-adapter');
const formatAdapter = require('./config-format-adapter');


/**
 * load config files
 * src/config/config.js
 * src/config/config.[env].js
 * src/config/adapter.js
 * src/config/adapter.[env].js
 */
module.exports = function loader(appPath, thinkPath, env, modules){
  const thinkConfig = interopRequire(path.join(thinkPath, 'lib/config/config.js'));
  if(modules.length){
     let config = {};
     modules.forEach(dir => {
       let paths = [path.join(appPath, 'common')];
       //merge common & module config
       if(dir !== 'common'){
         paths.push(path.join(appPath, dir));
       }
       let config = loadConfig(paths, env);
       let adapter = loadAdapter(paths, env);
       let adapterPath = path.join(appPath, 'common/adapter');
       config[dir] = helper.extend({}, thinkConfig, config, formatAdapter(adapter, adapterPath));
     });
     return config;
  }else{
    let configPath = path.join(appPath, 'config');
    let config = loadConfig([configPath], env);
    let adapter = loadAdapter([configPath], env);
    let adapterPath = path.join(appPath, 'adapter');
    return helper.extend({}, thinkConfig, config, formatAdapter(adapter, adapterPath));
  }
};