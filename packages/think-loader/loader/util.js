const helper = require('think-helper');

const nodeRequire = require;

/**
 * interop require
 */
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

/**
 * extend, support getter/setter
 */
exports.extend = require('../extend');
