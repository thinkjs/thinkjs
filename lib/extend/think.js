const assert = require('assert');
const helper = require('think-helper');

// before start server
let promises = [];

const getClass = function(type, name, m){
  let mcls = think.app[type];
  let cls = null;
  if(think.app.modules.length){
    if(mcls[m]){
      cls = mcls[m][name];
    }
    if(!cls && m !== 'common' && mcls.common){
      cls = mcls.common[name];
    }
  }else{
    cls = mcls[name];
  }
  return cls;
}

/**
 * get models
 */
const getModels = function(m){
  if(think.app.modules.length){
    return helper.extend({}, think.app.models.common, think.app.models[m]);
  }else{
    return think.app.models;
  }
}

module.exports = {
  /**
   * get env
   */
  get env(){
    return think.app.env;
  },
  /**
   * get controller instance
   * @param {String} name 
   * @param {Object} ctx 
   * @param {String} m 
   */
  controller(name, ctx, m = 'common'){
    const cls = getClass('controllers', name, m);
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
    const cls = getClass('models', name, m);
    if(config && config.type){
      config = helper.parseAdapterConfig(config);
    }
    let commonConfig = helper.parseAdapterConfig(think.config('model'));
    config = helper.extend({}, commonConfig, config);
    let handle = config.handle;
    delete config.handle;
    //add models in config, it's need in model when get relation model instance
    config.models = getModels(m);
    if(cls){
      return new cls(name, config);
    }
    return new handle(name, config);
  },
  /**
   * get service
   */
  service(name, m){
    return getClass('services', name, m);
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