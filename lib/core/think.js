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
think.config = {};
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
think.alias = require('../config/alias.js');
/**
 * thinkjs mode
 * @type {String}
 */
think.mode = 'http';
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
    }else if (name.split('/').length >= 3) {
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