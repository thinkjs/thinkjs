const helper = require('think-helper');
const assert = require('assert');
const path = require('path');
const interopRequire = require('../util.js').interopRequire;

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

module.exports = formatAdapter;