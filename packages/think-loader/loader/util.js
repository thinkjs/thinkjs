const helper = require('think-helper');

const nodeRequire = require;

exports.interopRequire = function(obj, safe) {
  if (helper.isString(obj)) {
    if (safe) {
      try {
        obj = nodeRequire(obj);
      } catch (e) {
        obj = null;
      }
    } else {
      obj = nodeRequire(obj);
    }
  }
  return obj && obj.__esModule ? obj.default : obj;
};

exports.extend = function(target, source) {
  const properties = Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source));
  const length = properties.length;
  for (let i = 0; i < length; i++) {
    const property = properties[i];
    const descriptor = Object.getOwnPropertyDescriptor(source, property);
    if (descriptor.get && descriptor.set) {
      Object.defineProperty(target, property, {
        configurable: true,
        get: descriptor.get,
        set: descriptor.set
      });
    } else if (descriptor.get) {
      Object.defineProperty(target, property, {
        configurable: true,
        get: descriptor.get
      });
    } else if (descriptor.set) {
      Object.defineProperty(target, property, {
        configurable: true,
        set: descriptor.set
      });
    } else if (descriptor.hasOwnProperty('value')) {
      target[property] = descriptor.value;
    }
  }
  return target;
};
