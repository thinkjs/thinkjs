const merge = require('think-helper/node_modules/lodash.merge');
const ms = require('think-helper/node_modules/ms');
const isObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]';
const isTrueEmpty = (value) =>
  value == null ||
  value === '' ||
  (typeof value === 'number' && Number.isNaN(value));
module.exports = {
  extend: merge,
  ms,
  isObject,
  isTrueEmpty,
  isArray: Array.isArray,
  isString: (value) => typeof value === 'string',
  isNumber: (value) => typeof value === 'number',
  isInt: (value) => typeof value === 'number' && (value | 0) === value,
  isBoolean: (value) => typeof value === 'boolean',
  isFunction: (value) => typeof value === 'function',
  isRegExp: (value) => value instanceof RegExp,
  isError: (value) => value instanceof Error,
  isEmpty(value) {
    if (isTrueEmpty(value)) return true;
    if (Array.isArray(value) || typeof value === 'string')
      return value.length === 0;
    if (isObject(value)) return Object.keys(value).length === 0;
    return value === false || value === 0;
  }
};
