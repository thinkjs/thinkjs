const merge = require('lodash.merge');
const ms = require('ms');
const isObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]';
const isTrueEmpty = (value) =>
  value == null ||
  value === '' ||
  (typeof value === 'number' && Number.isNaN(value));
module.exports = {
  extend: merge,
  ms(time) {
    if (typeof time === 'number') return time;
    const result = ms(time);
    if (result === undefined)
      throw new Error(`think-ms('${time}') result is undefined`);
    return result;
  },
  isObject,
  isTrueEmpty,
  isArray: Array.isArray,
  isString: (value) => typeof value === 'string',
  isNumber: (value) => typeof value === 'number',
  isInt(value) {
    if (isNaN(value) || typeof value === 'string') return false;
    const number = parseFloat(value);
    return (number | 0) === number;
  },
  isNull: value => value === null,
  isNullOrUndefined: value => value == null,
  isUndefined: value => value === undefined,
  isSymbol: value => typeof value === 'symbol',
  isDate: value => Object.prototype.toString.call(value) === '[object Date]',
  isPrimitive: value => value === null || ['boolean', 'number', 'string', 'symbol', 'undefined'].includes(typeof value),
  isBoolean: (value) => typeof value === 'boolean',
  isFunction: (value) => typeof value === 'function',
  isRegExp: value => Object.prototype.toString.call(value) === '[object RegExp]',
  isError: value => Object.prototype.toString.call(value) === '[object Error]' || value instanceof Error,
  isEmpty(value) {
    if (isTrueEmpty(value)) return true;
    if (Array.isArray(value) || typeof value === 'string')
      return value.length === 0;
    if (isObject(value)) return Object.keys(value).length === 0;
    return value === false || value === 0;
  }
};
