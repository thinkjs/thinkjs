const helper = require('think-helper');
const path = require('path');
const assert = require('assert');
const interopRequire = require('../util.js').interopRequire;

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
      config = helper.extend(config, interopRequire(filepath));
    }
  });
  configPaths.forEach(configPath => {
    let envFilepath = path.join(configPath, `${name}.${env}.js`);
    if(helper.isFile(envFilepath)){
      config = helper.extend(config, interopRequire(envFilepath));
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
 * load apdater in application
 * src/adapter/session/file.js
 * src/adapter/session/db.js
 */
const loadAdapterFiles = adapterPath => {
  let files = helper.getdirFiles(adapterPath);
  let ret = {};
  files.forEach(file => {
    let item = file.replace(/\.\w+$/, '').split(path.sep);
    if(!item[0] || !item[1]){
      return;
    }
    if(!ret[item[0]]){
      ret[item[0]] = {};
    }
    ret[item[0]][item[1]] = interopRequire(path.join(adapterPath, file));
  });
  return ret;
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
const formatAdapter = (config, adapterPath) => {
  let appAdapters = loadAdapterFiles(adapterPath);
  for(let name in config){
    assert(helper.isObject(config[name]), `adapter.${name} must be an object`);
    assert(config[name].type, `adapter.${name} config must have type field`);
    if(!config[name].common){
      continue;
    }
    let common = config[name].common;
    assert(helper.isObject(common), `${name}.common must be an object`);
    delete config[name].common;
    for(let type in config[name]){
      if(type === 'type'){
        continue;
      }
      let item = config[name][type];
      if(!helper.isObject(item)){
        continue;
      }
      //merge common field to item
      item = helper.extend({}, common, item);
      //convert string handle to class
      if(item.handle && helper.isString(item.handle)){
        assert(name in appAdapters && appAdapters[name][item.handle], `can not find ${name}.${type}.handle`);
        item.handle = appAdapters[type][item.handle];
      }
      config[name][type] = item;
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