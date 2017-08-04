const helper = require('think-helper');
/**
 * interop require
 */
exports.interopRequire = function(obj, safe) {
  if (helper.isString(obj)) {
    if (safe) {
      try {
        obj = require(obj);
      } catch (e) {
        obj = null;
      }
    } else {
      obj = require(obj);
    }
  }
  return obj && obj.__esModule ? obj.default : obj;
};

/**
 * extend, support getter/setter
 */
exports.extend = function(target, source) {
  const properties = Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source));
  const length = properties.length;
  for (let i = 0; i < length; i++) {
    const property = properties[i];
    const descriptor = Object.getOwnPropertyDescriptor(source, property);
    if (descriptor.get && descriptor.set) {
      // target.__defineGetter__(property, descriptor.get);
      // target.__defineSetter__(property, descriptor.set);
      Object.defineProperty(target, property, {
        configurable: true,
        get: descriptor.get,
        set: descriptor.set
      });
    } else if (descriptor.get) {
      // target.__defineGetter__(property, descriptor.get);
      Object.defineProperty(target, property, {
        configurable: true,
        get: descriptor.get
      });
    } else if (descriptor.set) {
      // target.__defineSetter__(property, descriptor.set);
      Object.defineProperty(target, property, { /* eslint accessor-pairs: ["error", { "setWithoutGet": false }] */
        configurable: true,
        set: descriptor.set
      });
    } else if (descriptor.hasOwnProperty('value')) { // could be undefined but writable
      target[property] = descriptor.value;
    }
  }
  return target;
};
