const assert = require('assert');
const helper = require('think-helpers');
const thinkAwait = require('think-await');

/**
 * cache manage
 * can not be define a arrow function, because has `this` in it.
 * @param {String} name 
 * @param {undefined|null|Function|Mixed} value 
 * @param {String|Object} config 
 */
function cacheManage(name, value, config){
  assert(helper.isString(name), 'cache.name must be a string when value is null');
  config = helper.parseAdapterConfig(this.config('cache'), config);
  const handle = config.handle;
  assert(helper.isFunction(handle), 'cache.handle must be a function');
  delete config.handle;
  const instance = new handle(config);
  //delete cache
  if(value === null){
    return Promise.resolve(instance.delete(name));
  }
  //get cache
  if(value === undefined){
    return thinkAwait(name, () => {
      return instance.get(name);
    });
  }
  //get cache when value is function
  if(helper.isFunction(value)){
    return thinkAwait(name, () => {
      let cacheData;
      return instance.get(name).then(data => {
        if(data === undefined){
          return value(name);
        }
        cacheData = data;
      }).then(data => {
        if(data !== undefined){
          cacheData = data;
          return instance.set(name, data);
        }
      }).then(() => {
        return cacheData;
      })
    });
  }
  //set cache
  return Promise.resolve(instance.set(name, value));
}
/**
 * extends to think, controller, context
 */
module.exports = {
  controller: {
    cache: cacheManage
  },
  context: {
    cache: cacheManage
  },
  think: {
    cache: cacheManage
  }
}