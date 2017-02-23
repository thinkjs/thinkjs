const helper = require('think-helper');
const path = require('path');
const assert = require('assert');
const fs = require('fs');

/**
 * load config
 * src/config/config.js
 * src/config/config.[env].js
 */
const loadConfig = (configPaths, env, name = 'config') => {
  let config = {};
  configPaths.forEach(configPath => {
    let filepath = path.join(configPath, `${name}.js`);
    if(helper.isFile(filepath)){
      config = helper.extend(config, require(filepath));
    }
  });
  configPaths.forEach(configPath => {
    let envFilepath = path.join(configPath, `${name}.${env}.js`);
    if(helper.isFile(envFilepath)){
      config = helper.extend(config, require(envFilepath));
    }
  });
  return config;
}

/**
 * load adapter
 * src/config/adapter.js
 * src/config/adapter.[env].js
 */
const loadAdapter = (configPath, env) => {
  return loadConfig(configPath, env, 'adapter');
}

/**
 * {
 *   db: {
 *      type: 'xxx',
 *      common: {
 *          
 *      },
 *      xxx: {
 *          
 *      }
 *   }
 * }
 * format adapter config, merge common field to item
 */
const formatAdapter = config => {
  for(let name in config){
    assert(config[name].type, `adapter config must have type field, name is ${name}`);
    if(config[name].common){
      let common = config[name].common;
      delete config[name].common;
      for(let type in config[name]){
        if(type === 'type'){
          continue;
        }
        //merge common field to item
        config[name][type] = helper.extend({}, common, config[name][type]);
      }
    }
  }
  return config;
}

/**
 * load config files
 * src/config/config.js
 * src/config/config.[env].js
 * src/config/adapter.js
 * src/config/adapter.[env].js
 */
module.exports = function loader(appPath, isMultiModule, thinkPath, env){
  const thinkConfig = require(path.join(thinkPath, 'config/config.js'));
  if(isMultiModule){
     let dirs = fs.readdirSync(appPath);
     let config = {};
     dirs.forEach(dir => {
       if(dir === 'common'){
         return;
       }
       //merge common & module config
       let paths = [
         path.join(appPath, 'common'),
         path.join(appPath, dir)
       ];
       let config = loadConfig(paths, env);
       let adapter = loadAdapter(paths, env);
       config[dir] = helper.extend({}, thinkConfig, config, formatAdapter(adapter));
     });
     return config;
  }else{
    let configPath = path.join(appPath, 'config');
    let config = loadConfig([configPath], env);
    let adapter = loadAdapter([configPath], env);
    return helper.extend({}, thinkConfig, config, formatAdapter(adapter));
  }
};