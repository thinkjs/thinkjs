'use strict';

var fs = require('fs');
var path = require('path');
var common = require('../common/common.js');
var base = require('./base.js');

/**
 * cache
 * @type {Object}
 */
global.thinkCache = {
  /**
   * base cache
   * @type {Object}
   */
  base: {},
  /**
   * session cache
   * @type {Object}
   */
  session: {},
  /**
   * db cache
   * @type {Object}
   */
  db: {}
};
/**
 * global think variable
 * @type {Object}
 */
global.think = {};
/**
 * debug
 * @type {Boolean}
 */
think.debug = false;
/**
 * cli url
 * @type {String}
 */
think.cli = '';
/**
 * app mode
 * @type {String}
 */
think.mode = 'normal';
/**
 * thinkjs version
 * @param  {) []
 * @return {}         []
 */
think.version = (function(){
  var packageFile = path.normalize(__dirname + '/../../package.json');
  var json = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
  return json.version;
})();
/**
 * thinkjs module root path
 * @type {String}
 */
think.THINK_PATH = path.normalize(__dirname + '/../../');
/**
 * thinkjs module lib path
 * @type {String}
 */
think.THINK_LIB_PATH = path.normalize(__dirname + '/../');
/**
 * thinkjs config
 * @type {Object}
 */
think.config = {};
/**
 * thinkjs module alias
 * @type {Object}
 */
think.alias = {};
/**
 * load alias
 * @return {[type]} [description]
 */
think.loadAlias = function(){
  var data = extend({}, require('../config/alias.js'));
  var common = think.mode === 'single' ? '' : 'common/';
  //sys controller & model
  ['controller', 'model'].forEach(function(item){
    var dir = path.normalize(__dirname + '/..') + '/' + item;
    var files = getFiles(dir);
    files.forEach(function(file){
      var name = file.slice(0, -3);
      name = name === 'base' ? item : name + '_' + item;
      data[name] = dir + '/' + file;
    })
  });
  //behavior
  var behaviorPaths = [
    path.normalize(__dirname + '/../behavior'),
    think.APP_PATH + '/' + common + 'behavior'
  ];
  behaviorPaths.forEach(function(dir){
    var files = getFiles(dir);
    files.forEach(function(file){
      var name = file.slice(0, -3);
      name = name === 'base' ? 'behavior' : name + '_behavior';
      data[name] = dir + '/' + file;
    })
  });
  //driver
  var driverPaths = [
    path.normalize(__dirname + '/../driver'),
    think.APP_PATH + '/' + common +'driver'
  ];
  driverPaths.forEach(function(driver){
    ['cache', 'db', 'session', 'template'].forEach(function(type){
      var dir = driver + '/' + type;
      var files = getFiles(dir);
      files.forEach(function(file){
        var name = file.slice(0, -3);
        name = name === 'base' ? type : name + '_' + type;
        data[name] = dir + '/' + file;
      })
    })
  });
  //reset think alias
  think.alias = data;
}
/**
 * load config
 * @return {} [description]
 */
think.loadConfig = function(){
  var config = require('../config/config.js');
}
/**
 * require module
 * @param  {String} name []
 * @return {mixed}      []
 */
think.require = function(name){
  if (!isString(name)) {
    return name;
  }
  if (name[0] !== '/') {
    if (name in think.alias) {
      name = think.alias[name];
    }else if (name.indexOf('/') > -1) {
      name = think.APP_PATH + '/' + name + '.js';
    }
  }
  var obj = require(name);
  if (isFunction(obj)) {
    obj.prototype.__filename = name;
  }
  return obj;
}
/**
 * create class
 * @param {Object} props [methods and props]
 */
think.Class = function(props){
  return Class(base, props);
}
/**
 * create type class
 * @type {Array}
 */
var clsList = [
  'controller', 'model', 'behavior', 
  'cache', 'db', 'session', 'template'
];
clsList.forEach(function(type){
  think[type] = function(superClass, props){
    if (isObject(superClass)) {
      props = superClass;
      superClass = type;
    }else if (isString(superClass)) {
      superClass += '_' + type;
    }
    superClass = think.require(superClass);
    return Class(superClass, props);
  }
});
/**
 * create logic class
 * @type {Function}
 */
think.logic = think.controller;
/**
 * run
 * @return {} []
 */
think.run = function(options){
  extend(think, options);
  var dir = think.APP_PATH + '/controller';
  if (isDir(dir)) {
    think.mode = 'single';
  }
  this.loadAlias();
}