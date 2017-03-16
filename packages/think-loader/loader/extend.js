const path = require('path');
const helper = require('think-helper');
const assert = require('assert');
const interopRequire = require('./util.js').interopRequire;

const ExtendLoader = {

  allowExtends: ['think', 'context', 'request', 'response', 'controller', 'logic'],
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
  load(appPath, thinkPath, modules){
    let allowExtends = ExtendLoader.allowExtends;
    const thinkFilePath = path.join(thinkPath, 'lib/config/extend.js');
    let extend = interopRequire(thinkFilePath);
    const filepath = path.join(appPath, modules.length ? 'common/config/extend.js' : 'config/extend.js');
    if(helper.isFile(filepath)){
      extend = extend.concat(interopRequire(filepath));
    }
    let ret = {};
    function assign(type, ext){
      if(!ret[type]){
        ret[type] = {};
      }
      for(let name in ext){
         let descriptor = Object.getOwnPropertyDescriptor(ext, name);
         if(descriptor.value){
           ret[type][name] = descriptor.value;
         }else if(descriptor.get){
           ret[type].__defineGetter__(name, descriptor.get);
         }else if(descriptor.set){
           ret[type].__defineSetter__(name, descriptor.set);
         }
      }
    }
    //system extend
    allowExtends.forEach(type => {
      let filepath = path.join(thinkPath, `lib/extend/${type}.js`);
      if(!helper.isFile(filepath)){
        return;
      }
      assign(type, interopRequire(filepath));
    });
    extend.forEach(item => {
      for(let type in item){
        assert(allowExtends.indexOf(type) > -1, `extend type=${type} not allowed, allow types: ${allowExtends.join(', ')}`);
        assign(type, item[type]);
      }
    });
    //application extend
    allowExtends.forEach(type => {
      let filepath = path.join(appPath, modules.length ? `common/extend/${type}.js` : `extend/${type}.js`);
      if(!helper.isFile(filepath)){
        return;
      }
      assign(type, interopRequire(filepath));
    });
    return ret;
  }
}

module.exports = ExtendLoader;