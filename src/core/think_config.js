'use strict';

import fs from 'fs';


/**
 * get item config
 * @param  {} configPath []
 * @param  {} item       []
 * @return {}            []
 */
let _getItemConfig = (configPath, item) => {
  let fileFilters = ['config', 'route', 'hook'];
  let dirFilters = ['env', 'sys'];
  if(think.isDir(`${configPath}/${item}`)){
    if(dirFilters.indexOf(item) === -1){
      return {
        [item]: _getConfig(`${configPath}/${item}`)
      };
    }
    return;
  }
  item = item.slice(0, -3);
  if(item[0] === '_' || fileFilters.indexOf(item) > -1){
    return;
  }
  let conf = think.safeRequire(`${configPath}/${item}.js`);
  if(conf){
    return {[item]: conf};
  }
};

/**
 * get module config
 * @param  {String} module []
 * @return {Object}        []
 */
let _getConfig = configPath => {
  let config = {};
  if(!think.isDir(configPath)){
    return config;
  }
  fs.readdirSync(configPath).forEach(item => {
    let data = _getItemConfig(configPath, item);
    config = think.extend(config, data);
  });
  return config;
};

/**
 * transform config
 * @param  {Object} config []
 * @return {Object}        []
 */
let _transformConfig = (config, transforms) => {
  for(let key in transforms){
    if (!(key in config)) {
      continue;
    }
    let value = transforms[key];
    if (think.isFunction(value)) {
      config[key] = value(config[key], config);
    }else {
      config[key] = _transformConfig(config[key], value);
    }
  }
  return config;
};

let _getModuleConfig = (module = think.dirname.common) => {

  //get module config from cache
  let moduleConfig = thinkData.config;
  if (moduleConfig[module]) {
    return moduleConfig[module];
  }

  let rootPath;
  //get sys config
  if (module === true) {
    rootPath = `${think.THINK_LIB_PATH}/config`;
  }else{
    rootPath = think.getPath(module, think.dirname.config);
  }

  //config.js
  let config = think.safeRequire(`${rootPath}/config.js`);
  let envConfig = {}, extraConfig = _getConfig(rootPath);

  envConfig = think.safeRequire(`${rootPath}/env/${think.env}.js`);
  envConfig = think.extend(envConfig, _getConfig(`${rootPath}/env/${think.env}`));

  //merge all configs
  config = think.extend({}, config, extraConfig, envConfig);
  //merge sys, common configs to module
  if(module !== true){
    if(module === think.dirname.common){
      config = think.extend({}, _getModuleConfig(true), config);
    }else{
      config = think.extend({}, _getModuleConfig(), config);
    }
  }
  //transform config
  let transforms = think.safeRequire(`${think.THINK_LIB_PATH}/config/sys/transform.js`);
  config = _transformConfig(config, transforms);

  if(module !== true){
    thinkData.config[module] = config;
  }

  return config;
};


/**
 * get or set config
 * @return {mixed} []
 */
//if set common config, must sync to module config
let _setConfig = (name, value, flag, data) => {
  let configs = [];
  if(flag){
    configs = think.module.map(item => _getModuleConfig(item));
  }
  [data, ...configs].forEach(itemData => {
    if(think.isObject(name)){
      think.extend(itemData, name);
    }
    else if(think.isString(name)){
      //name = name.toLowerCase();
      if (name.indexOf('.') === -1) {
        itemData[name] = value;
      }else{
        let names = name.split('.');
        itemData[names[0]] = itemData[names[0]] || {};
        itemData[names[0]][names[1]] = value;
      }
    }

  });
};

let Config = (name, value, data) => {
  let flag = !data;

  //convert data to undefined when is null (in http._config)
  if(data === null) {
    data = undefined;
  }
  //get data from module config
  if(!think.isObject(data)){
    data = _getModuleConfig(data);
  }
  // get all config
  if (name === undefined) {
    return data;
  }
  // merge config
  if (think.isObject(name) || value !== undefined) {
    return _setConfig(name, value, flag, data);
  }
  //get config
  if (name.indexOf('.') === -1) {
    return data[name];
  }
  name = name.split('.');
  value = data[name[0]] || {};
  return value[name[1]];
};

export default Config;