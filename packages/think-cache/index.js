const assert = require('assert');
const helper = require('think-helper');
const thinkAwait = require('think-await');

/**
 * cache manage
 * can not be defined a arrow function, because has `this` in it.
 * @param {String} name 
 * @param {Mixed} value 
 * @param {String|Object} config 
 */
function thinkCache(name, value, config){
  assert(name && helper.isString(name), 'cache.name must be a string');
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
    cache: thinkCache
  },
  context: {
    cache: thinkCache
  },
  think: {
    cache: thinkCache
  }
}