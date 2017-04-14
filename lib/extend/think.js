const assert = require('assert');
const helper = require('think-helper');

// before start server
let promises = [];

module.exports = {
  /**
   * get controller instance
   * @param {String} name 
   * @param {Object} ctx 
   * @param {String} m 
   */
  controller(name, ctx, m = 'common'){
    const controllers = think.app.controllers;
    let cls = null;
    if(think.app.modules.length){
      if(controllers[m]){
        cls = controllers[m][name];
      }
      if(!cls && m !== 'common' && controllers.common){
        cls = controllers.common[name];
      }
    }else{
      cls = controllers[name];
    }
    assert(cls, `can not find controller:${name}`);
    return new cls(ctx);
  },
  /**
   * get model instance
   * @param {String} name 
   * @param {Object} config 
   * @param {String} m 
   */
  model(name, config, m = 'common'){
    const models = think.app.models;

  },
  /**
   * before start server
   * @param {Function} fn 
   */
  beforeStartServer(fn){
    if(fn) {
      assert(helper.isFunction(fn), 'fn in think.beforeStartServer must be a function');
      return promises.push(fn());
    }
    const promise = Promise.all(promises);
    const timeout = think.config('startServerTimeout');
    assert(helper.isNumber(timeout), 'startServerTimeout must be a number');
    const timeoutPromise = helper.timeout(timeout).then(() => {
      const err = new Error(`waiting for start server timeout, time: ${timeout}ms`);
      return Promise.reject(err);
    });
    return Promise.race([promise, timeoutPromise]);
  }
}