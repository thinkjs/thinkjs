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
    if (descriptor.get) {
      target.__defineGetter__(property, descriptor.get);
    }
    if (descriptor.set) {
      target.__defineSetter__(property, descriptor.set);
    }
    if (descriptor.hasOwnProperty('value')) { // could be undefined but writable
      target[property] = descriptor.value;
    }
  }
  return target;
};
