const assert = require('assert');
const helper = require('think-helper');
const Debounce = require('think-debounce');

const debounceInstance = new Debounce();

/**
 * cache manage
 * can not be defined a arrow function, because has `this` in it.
 * @param {String} name
 * @param {Mixed} value
 * @param {String|Object} config
 */
function thinkCache(name, value, config) {
  assert(name && helper.isString(name), 'cache.name must be a string');
  if (config) {
    config = helper.parseAdapterConfig(this.config('cache'), config);
  } else {
    config = helper.parseAdapterConfig(this.config('cache'));
  }
  const Handle = config.handle;
  assert(helper.isFunction(Handle), 'cache.handle must be a function');
  delete config.handle;
  const instance = new Handle(config);
  // delete cache
  if (value === null) {
    return Promise.resolve(instance.delete(name));
  }
  // get cache
  if (value === undefined) {
    return debounceInstance.debounce(name, () => {
      return instance.get(name);
    });
  }

  // get cache when value is function
  if (helper.isFunction(value)) {
    return debounceInstance.debounce(name, () => {
      let cacheData;
      return instance.get(name).then(data => {
        if (data === undefined) {
          return value(name);
        }
        cacheData = data;
      }).then(data => {
        if (data !== undefined) {
          cacheData = data;
          return instance.set(name, data);
        }
      }).then(() => {
        return cacheData;
      });
    });
  }
  // set cache
  return Promise.resolve(instance.set(name, value));
}

module.exports = thinkCache;
