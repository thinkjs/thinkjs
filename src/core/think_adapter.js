'use strict';

import fs from 'fs';

/**
 * create, register, call adapter
 * @param  {String} name []
 * @return {void}      []
 */
let Adapter = (...args) => {
  let [type, name, fn] = args;
  let length = args.length, key = 'adapter_';
  if(length === 3){
    //register adapter
    //think.adapter('session', 'redis', function(){})
    if (think.isFunction(fn)) {
      key += `${type}_${name}`;
      thinkData.export[key] = fn;
      return;
    }
    //create adapter
    //module.exports = think.adapter('session', 'memory', {})
    else if(think.isObject(fn)){
      return think.Class(think.adapter(type, name), fn);
    }
  }
  //type has not _
  else if(length === 2 && think.isString(type) && type.indexOf('_') === -1){
    //create adapter
    //module.exports = think.adapter('session', {})
    if(think.isObject(name)){
      return think.Class(think.adapter(type, 'base'), name);
    }
    //get adapter
    //think.adapter('session', 'redis')
    else if (think.isString(name)) {
      return Adapter.get(type, name);
    }
  }
  
  return Adapter.create(type, name);
};

//get adapter
//think.adapter('session', 'redis')
Adapter.get = (type, name) => {
  let key = 'adapter_';
  let nameLower = name.toLowerCase();
  if(name !== nameLower){
    name = nameLower;
    think.log(colors => {
      return colors.yellow(`[WARNING]`) + ` adapter type \`${name}\` has uppercase chars.`;
    });
  }
  
  key += type + '_' + name;
  let cls = think.require(key, true);
  if (cls) {
    return cls;
  }else{
    Adapter.load(type, name);
    let cls = think.require(key, true);
    if(cls){
      return cls;
    }
  }
  throw new Error(think.locale('ADAPTER_NOT_FOUND', key));
};

//create adapter
//module.exports = think.adapter({})
//module.exports = think.adapter(function(){}, {});
Adapter.create = (type, name) => {
  let superClass;
  if (think.isFunction(type)) {
    superClass = type;
  }else if (think.isString(type)) {
    superClass = think.require(type);
  }
  //create clean Class
  if (!superClass) {
    return think.Class(type);
  }
  return think.Class(superClass, name);
};

/**
 * load system & comon module adapter
 * @return {} []
 */
Adapter.load = (type, name = 'base') => {
  let paths = [`${think.THINK_LIB_PATH}${think.sep}adapter`];
  
  //load base adapter
  if(!think.adapter.base){
    think.adapter.base = think.safeRequire(paths[0] + '/base.js');
  }
  
  //common module adapter
  let adapterPath = think.getPath(undefined, think.dirname.adapter);
  if (think.isDir(adapterPath)) {
    paths.push(adapterPath);
  }
  paths.forEach(path => {
    if(type){
      let filepath = `${path}${think.sep}${type}${think.sep}${name}.js`;
      if(think.isFile(filepath)){
        thinkData.alias[`adapter_${type}_${name}`] = filepath;
      }
    }else{
      let dirs = fs.readdirSync(path);
      dirs.forEach(dir => {
        if(!think.isDir(`${path}/${dir}`)){
          return;
        }
        think.alias(`adapter_${dir}`, `${path}${think.sep}${dir}`);
      });
    }
  });
};

export default Adapter;