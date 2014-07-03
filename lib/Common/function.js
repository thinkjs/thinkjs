var fs = require('fs');
var path = require('path');


var _alias = {};
var _autoload_callbacks = [];
/**
 * thinkRequire获取到的路径
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
global.getThinkRequirePath = function(name){
  'use strict';
  if (_alias[name]) {
    return _alias[name];
  }
  var result = '';
  _autoload_callbacks.some(function(callback){
    result = callback && callback(name);
    if (result) {
      return true;
    }
  });
  return result;
}
/**
 * 自定义的require, 加入别名功能
 * @type {[type]}
 */
global.thinkRequire = function(name){
  'use strict';
  //如果不是字符串则直接返回
  if (!isString(name)) {
    return name;
  }
  var path = name;
  if (path[0] !== '/') {
    path = getThinkRequirePath(name);
  }
  if (path) {
    var obj = require(path);
    if (isFunction(obj)) {
      //修正子类继承的方法获取到正确的文件名
      obj.prototype.__filename = path;
    }
    return obj;
  }
  return require(name);
};
/**
 * 注册require
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
global.registerAutoload = function(callback){
  'use strict';
  _autoload_callbacks.push(callback);
};
/**
 * 别名
 * @return {[type]} [description]
 */
global.aliasImport = function(alias, classFile){
  'use strict';
  if (isString(alias)) {
    _alias[alias] = classFile;
  }else{
    _alias = extend(_alias, alias);
  }
};

//常用类的基类
['Cache', 'Behavior', 'Controller', 'Session', 'Model', 'Db'].forEach(function(item){
  'use strict';
  global[item] = function(super_, obj){
    if (isString(super_)) {
      return Class(obj, thinkRequire(super_));
    }
    return Class(super_, thinkRequire(item));
  };
});


/**
 * 调用一个指定的行为
 * @param {[type]} name [description]
 */
global.B = function(name, http, data){
  'use strict';
  if (!name) {
    return data;
  }
  if (typeof name === 'function') {
    return name(http, data);
  }
  return thinkRequire(name + 'Behavior')(http).run(data);
};

/**
 * 处理标签扩展
 * @return {[type]} [description]
 */
global.tag = function(name, http, data){
  'use strict';
  var tags = (C('tag.' + name) || []).slice();
  //tag处理的数据
  http.tag_data = data;
  if (!tags.length) {
    return getPromise(http.tag_data);
  }
  var index = 0;
  function runBehavior(){
    var behavior = tags[index++];
    if (!behavior) {
      return getPromise(http.tag_data);
    }
    var result = B(behavior, http, http.tag_data);
    return getPromise(result).then(function(data){
      //如果返回值不是undefined，那么认为有返回值
      if (data !== undefined) {
        http.tag_data = data;
      }
      return runBehavior();
    })
  }
  return runBehavior();
};
/**
 * 配置读取和写入
 */
var _config = {};
global.C = function(name, value){
  'use strict';
  //获取所有的配置
  if (arguments.length === 0) {
    return _config;
  }
  //清除所有的配置
  if (name === null) {
    _config = {};
    return;
  }
  if (isString(name)) {
    name = name.toLowerCase();
    //name里不含. 一级
    if (name.indexOf('.') === -1) {
      if (value === undefined) {
        return _config[name];
      }
      _config[name] = value;
      return;
    }
    //name中含有. 二级
    name = name.split('.');
    if (value === undefined) {
      value = _config[name[0]] || {};
      return value[name[1]];
    }
    if (!_config[name[0]]) {
      _config[name[0]] = {};
    }
    _config[name[0]][name[1]] = value;
  }else{
    _config = extend(_config, name);
  }
};
/**
 * 实例化Controller类，可以调用一个具体的Action
 * A('Home/Index'), A('Admin/Index/test')
 * @param {[type]} name [description]
 */
global.A = function(name, http, data){
  'use strict';
  //将/转为:，兼容之前的方式
  name = name.replace(/\//g, ':').split(':');
  http.group = name[0];
  http.controller = name[1];
  var App = thinkRequire('App');
  var instance = App.getBaseController(http);
  if (!instance) {
    return instance;
  }
  var action = name[2];
  if (!action) {
    return instance;
  }
  http.action = action;
  return getPromise(instance.__initReturn).then(function(){
    if (data && !isArray(data)) {
      data = [data];
    }
    return App.execAction(instance, action, data);
  })
};

/**
 * 快速文件读取和写入
 * 默认写入到App/Runtime/Data目录下
 */
global.F = function(name, value, rootPath){
  'use strict';
  rootPath = rootPath || DATA_PATH;
  var filePath = rootPath + '/' + name + '.json';
  if (value !== undefined) {
    mkdir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value));
    chmod(filePath);
    return;
  }
  if (isFile(filePath)) {
    var content = getFileContent(filePath);
    if (content) {
      return JSON.parse(content);
    }
  }
  return false;
};
/**
 * 实例化模型
 */
global.D = function(name, tablePrefix, config){
  'use strict';
  if (name === undefined) {
    return thinkRequire('Model')(name, tablePrefix, config);
  }
  name = name.split(':');
  name[0] = name[0][0].toUpperCase() + name[0].slice(1);
  var path = getThinkRequirePath(name[0] + 'Model');
  if (path) {
    return thinkRequire(name[0] + 'Model')(name[1], tablePrefix, config);
  }else{
    return thinkRequire(name[1] === 'AdvModel' ? 'AdvModel' : 'Model')(name[0], tablePrefix, config);
  }
};
/**
 * 实例化模型基类
 * @param {[type]} name        [description]
 * @param {[type]} tablePrefix [description]
 * @param {[type]} config      [description]
 */
global.M = function(name, tablePrefix, config){
  'use strict';
  if (name === undefined) {
    return thinkRequire('Model')(name, tablePrefix, config);
  }
  name = name.split(':');
  var model = name[1] === 'AdvModel' ? 'AdvModel' : 'Model';
  return thinkRequire(model)(name[0], tablePrefix, config)
}
/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 */
global.S = function(name, value, options){
  'use strict';
  if (isNumber(options)) {
    options = {timeout: options};
  }else if (options === true) {
    options = {type: true}
  }
  options = options || {};
  var type = options.type === undefined ? C('cache_type') : options.type;
  var cls = (type === true ? '' : ucfirst(type)) + 'Cache';
  var instance = thinkRequire(cls)(options);
  //获取缓存
  if (value === undefined) {
    return instance.get(name);
  }
  //移除缓存
  if (value === null) {
    return instance.rm(name);
  }
  return instance.set(name, value, options.timeout);
};
/**
 * 语言
 * @param {[type]} name [description]
 */
global.L = function(name){
  'use strict';
  return name;
};