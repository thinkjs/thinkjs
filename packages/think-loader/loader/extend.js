const path = require('path');
const helper = require('think-helper');
const assert = require('assert');
const util = require('./util.js');
const interopRequire = util.interopRequire;
const extendObj = util.extend;
const debug = require('debug')(`think-loader-extend-${process.pid}`);

const SYS_EXTENDS = {
  context: require('thinkjs/lib/extend/context'),
  controller: require('thinkjs/lib/extend/controller'),
  logic: require('thinkjs/lib/extend/logic')
};

const ExtendLoader = {

  allowExtends: ['think', 'application', 'context', 'request', 'response', 'controller', 'logic', 'service'],
  /**
   * const modelExtend = require('think-model').extend;
   *  modelExtend = {
   *  think: {},
   *  context: {},
   *  request: {}
   * };
   * module.exports = [
   *  modelExtend,
   * ]
   */
  load(appPath, modules) {
    const allowExtends = ExtendLoader.allowExtends;

    let extend = [];
    const filepath = path.join(appPath, modules.length ? 'common/config/extend.js' : 'config/extend.js');
    if (helper.isFile(filepath)) {
      debug(`load file: ${filepath}`);
      extend = extend.concat(interopRequire(filepath));
    }

    const ret = {};
    function assign(type, ext) {
      if (!ret[type]) {
        ret[type] = {};
      }
      ret[type] = extendObj(ret[type], ext);
    }
    // system extend
    allowExtends
      .filter(type => SYS_EXTENDS[type])
      .forEach(type => assign(type, SYS_EXTENDS[type]));

    // config extend
    extend.forEach(item => {
      if (helper.isFunction(item)) {
        console.error(`extend item can not be a function, ${item.name}`);
        return;
      }
      for (const type in item) {
        assert(allowExtends.indexOf(type) > -1, `extend type=${type} not allowed, allow types: ${allowExtends.join(', ')}`);
        assign(type, item[type]);
      }
    });
    // application extend
    allowExtends.forEach(type => {
      const filepath = path.join(appPath, modules.length ? `common/extend/${type}.js` : `extend/${type}.js`);
      if (!helper.isFile(filepath)) {
        return;
      }
      debug(`load file: ${filepath}`);
      assign(type, interopRequire(filepath));
    });
    return ret;
  }
};

module.exports = ExtendLoader;
