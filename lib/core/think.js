'use strict';

var fs = require('fs');
var path = require('path');
var common = require('../common/common.js');
var base = require('./base.js');
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
think.url = '';
/**
 * thinkjs mode
 * @type {String}
 */
think.mode = 'http';
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
 * thinkjs config
 * @type {Object}
 */
think.config = require('../config/config.js');
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
 * thinkjs module alias
 * @type {Object}
 */
think.alias = {};
/**
 * base cache
 * @type {Object}
 */
think.cache = {};
/**
 * db cache
 * @type {Object}
 */
think.dbCache = {};
/**
 * session cache
 * @type {Object}
 */
think.sessionCache = {};
/**
 * load alias
 * @return {[type]} [description]
 */
think.loadAlias = function(){
  var data = extend({}, require('../config/alias.js'));
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
    think.APP_PATH + '/common/behavior'
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
    think.APP_PATH + '/common/driver'
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
    }else if (name.split('/').length >= 2) {
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
 * create controller class
 * @param  {} superClass []
 * @param  {} props      []
 * @return {}            []
 */
think.controller = function(superClass, props){
  if (isObject(superClass)) {
    props = superClass;
    superClass = 'controller';
  }else if (isString(superClass)) {
    superClass += '_controller';
  }
  superClass = think.require(superClass);
  return Class(superClass, props);
}
think.model = function(superClass, props){

}