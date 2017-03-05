/*
* @Author: lushijie
* @Date:   2017-02-27 19:11:47
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-05 11:27:19
*/
'use strict';
const helper = require('think-helper');
const validator = require('validator');
const errors = require('./errors.js');
const assert = require('assert');

let Validator = {}
Validator.errors = errors;

/**
 * check value is set
 * @param  {String}  value []
 * @param  {Boolean} options []
 * @return {Boolean}       []
 */
Validator.required = (value, options) => {
  return options;
};

/**
 * parse requiredIf rule options
 * @param  {Array}  options []
 * @param  {Object} ctx []
 * @return {Array}  []
 */
Validator._requiredIf = (options, ctx) => {
  assert(helper.isArray(options), 'requiredIf\'s options should be array');
  options = options.slice();

  // just parse the first param
  let arg0 = options[0];
  options[0] = (ctx[arg0] ? ctx[arg0] : '');
  return options;
};

/**
 * The field under validation must be present if the otherFields field is equal to any value.
 * @param  {String}    value       [description]
 * @param  {Array}     options     [description]
 * @return {Boolean}               [description]
 */
Validator.requiredIf = (value, options) => {
  let first = options[0];
  let others = options.slice(1);
  return others.indexOf(first) > -1;
};

/**
 * parse requiredNotIf rule options
 * @param  {Array} options      []
 * @param  {Object} ctx []
 * @return {Array}      []
 */
Validator._requiredNotIf = (options, ctx) => {
  assert(helper.isArray(options), 'requiredNotIf\'s options should be array');
  return Validator._requiredIf(options, ctx);
};

/**
 * The field under validation must be present not if the otherFileds field is equal to any value.
 * @param  {String}    value        []
 * @param  {Array}     options       []
 * @return {Boolean}                 []
 */
Validator.requiredNotIf = (value, options) => {
  let first = options[0];
  let others = options.slice(1);
  return (others.indexOf(first) === -1);
};

/**
 * parse required rule options
 * @param  {Array}  options []
 * @param  {Object} ctx []
 * @return {Array}      []
 */
Validator._requiredWith = (options, ctx) => {
  assert(helper.isArray(options), 'requiredWith\'s options should be array');
  options = options.slice();

  // parsed all the param
  return options.map(item => {
    return ctx[item] ? ctx[item] : '';
  });
};

/**
 * The field under validation must be present only if any of the other specified fields are present.
 * @param  {String} value         []
 * @param  {Array}  options  []
 * @return {Boolean}              []
 */
Validator.requiredWith = (value, options) => {
  return options.some(item => {
    return !helper.isEmpty(item);
  });
};

/**
 * parse requiredWithAll rule options
 * @param  {Array}  options []
 * @param  {Object} ctx []
 * @return {Array}      []
 */
Validator._requiredWithAll = (options, ctx) => {
  assert(helper.isArray(options), 'requiredWithAll\'s options should be array');
  return Validator._requiredWith(options, ctx);
};

/**
 * The field under validation must be present only if all of the other specified fields are present.
 * @param  {String}    value         []
 * @param  {Array}     options       []
 * @return {Boolean}                 []
 */
Validator.requiredWithAll = (value, options) => {
  return options.every(item => {
    return !helper.isEmpty(item);
  });
};

/**
 * parse requiredWithOut rule options
 * @param  {Array} options []
 * @param  {Object} ctx []
 * @return {Array}      []
 */
Validator._requiredWithOut = (options, ctx) => {
  assert(helper.isArray(options), 'requiredWithOut\'s options should be array');
  return Validator._requiredWith(options, ctx);
};

/**
 * The field under validation must be present only when any of the other specified fields are not present.
 * @param  {String}    value          []
 * @param  {Array} options            []
 * @return {Boolean}                  []
 */
Validator.requiredWithOut = (value, options) => {
  return options.some(item => {
    return helper.isEmpty(item);
  });
};

/**
 * parse requiredWithOutAll rule options
 * @param  {Array} options []
 * @param  {Object} ctx []
 * @return {Array}      []
 */
Validator._requiredWithOutAll = (options, ctx) => {
  assert(helper.isArray(options), 'requiredWithOutAll\'s options should be array');
  return Validator._requiredWith(options, ctx);
};

/**
 * The field under validation must be present only when all of the other specified fields are not present.
 * @param  {String}    value         []
 * @param  {Array}     options []
 * @return {Boolean}                  []
 */
Validator.requiredWithOutAll = (value, options) => {
  return options.every(item => {
    return helper.isEmpty(item);
  });
};

/**
 * check if the string contains the seed.
 * @param  {String} value []
 * @param  {String} seed   []
 * @return {Boolean}       []
 */
Validator.contains = (value, seed) => {
  value = validator.toString(value);
  return validator.contains(value, seed);
};


/**
 * parse equal rule comparison
 * @param  {String} comparison []
 * @param  {Object} ctx []
 * @return {String}      []
 */
Validator._equals = (comparison, ctx) => {
  let item = ctx[comparison];
  return item ? item : comparison;
};

/**
 * check if the string matches the comparison.
 * @param  {String} value      []
 * @param  {String} comparison []
 * @return {Boolean}            []
 */
Validator.equals = (value, comparison) => {
  value = validator.toString(value);
  return validator.equals(value, comparison);
};

/**
 * parse different rule comparison
 * @param  {Array}  comparison []
 * @param  {Object} ctx []
 * @return {Array}  []
 */
Validator._different = (comparison, ctx) => {
  return Validator._equals(comparison, ctx);
};

/**
 * check if the string not matches the comparison.
 * @param  {String} value      [description]
 * @param  {String} comparison [description]
 * @return {Boolean}            [description]
 */
Validator.different = (value, comparison) => {
  value = validator.toString(value);
  return !validator.equals(value, comparison);
};

/*
 * pretreat before rule comparison
 * @param  {Date String|true} comparison []
 * @return {Array}      []
*/
Validator._before = (comparison) => {
 if(comparison === true) {
    let now = new Date();
    let nowTime = now.getFullYear() + '-' +
                  (now.getMonth() + 1) + '-' +
                  now.getDate() + ' ' +
                  now.getHours() + ':' +
                  now.getMinutes() + ':' +
                  now.getSeconds();
    return nowTime;
  }
  return comparison;
};

/*
 * check if the string is a date that's before the specified date.
 * @param  {String} value []
 * @param  {Date String} comparison  []
 * @return {Boolean}       []
*/
Validator.before = (value, comparison) => {
  value = validator.toString(value);
  return validator.isBefore(value, comparison);
};

/*
 * pretreat after rule comparison
 * @param  {Date String | true} comparison []
 * @return {Array}      []
*/
Validator._after = (comparison) => {
  return Validator._before(comparison);
};

/*
 * check if the string is a date that's after the specified date (defaults to now).
 * @param  {String} value []
 * @param  {Date String} comparison  []
 * @return {Boolean}       []
*/
Validator.after = (value, comparison) => {
  value = validator.toString(value);
  return validator.isAfter(value, comparison);
};

/**
 * check if the string contains only letters (a-zA-Z).
 * @param  {String} value []
 * @param  {String|true} locale default:en-US
 * @return {Boolean}       []
 */
Validator.alpha = (value, locale) => {
  value = validator.toString(value);
  if(locale === true) {
    return validator.isAlpha(value);
  }else {
    return validator.isAlpha(value, locale);
  }
};

/**
 * check if the string contains letters (a-zA-Z_).
 * @param  {String} value []
 * @param  {String|true} locale default:en-US
 * @return {Boolean}       []
 */
Validator.alphaDash = (value, locale) => {
  value = validator.toString(value);
  if(locale === true) {
    return validator.isAlpha(value) || (value === '_');
  }else {
    return validator.isAlpha(value, locale) || (value === '_');
  }
};

/**
 * check if the string contains only letters and numbers.
 * @param  {String} value []
 * @param  {String|true} locale default:en-US
 * @return {Boolean}       []
 */
Validator.alphaNumeric = (value, locale) => {
  value = validator.toString(value);
  if(locale === true) {
    return validator.isAlphanumeric(value);
  }else {
    return validator.isAlphanumeric(value, locale);
  }
};

/**
 * check if the string contains only letters, numbers and _.
 * @param  {String} value []
 * @param  {String|true} locale default:en-US
 * @return {Boolean}       []
 */
Validator.alphaNumericDash = (value, locale) => {
  value = validator.toString(value);
  if(locale === true) {
    return validator.isAlphanumeric(value) || (value === '_');
  }else {
    return validator.isAlphanumeric(value, locale) || (value === '_');
  }
};

/**
 * check if the string contains ASCII chars only.
 * @param  {String} value []
 * @return {Boolean}      []
 */
Validator.ascii = value => {
  value = validator.toString(value);
  return validator.isAscii(value);
};

/**
 * check if a string is base64 encoded.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.base64 = value => {
  value = validator.toString(value);
  return validator.isBase64(value);
};

/**
 * check if the string's length (in bytes) falls in a range.
 * @param  {String} value []
 * @param  {Object|true} options []
 * @return {Boolean}       []
 */
Validator.byteLength = (value, options) => {
  assert((helper.isObject(options) || options === true), 'byteLength\'s options should be object or true');

  value = validator.toString(value);
  if(options === true) {
    return validator.isByteLength(value, {min: 0, max: undefined});
  }else {
    return validator.isByteLength(value, options);
  }
};

/**
 *  check if the string is a credit card.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.creditCard = value => {
  value = validator.toString(value);
  return validator.isCreditCard(value);
};

/**
 * check if the string is a valid currency amount. options is an object which defaults to
 * @param  {String} value   []
 * @param  {Object|true} options []
 * @return {Boolean}         []
 */
Validator.currency = (value, options) => {
  assert((helper.isObject(options) || options === true), 'currency\'s options should be object or true');
  value = validator.toString(value);
  if(options === true) {
    return validator.isCurrency(value);
  }else {
    return validator.isCurrency(value, options);
  }
};

/**
 * check is string date format
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.date = value => {
  if(isNaN(Date.parse(value))){
    return false;
  }
  return true;
};

/**
 * check if the string represents a decimal number, such as 0.1, .3, 1.1, 1.00003, 4.0, etc.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.decimal = value => {
  value = validator.toString(value);
  return validator.isDecimal(value);
};


/**
 * check if the string is a number that's divisible by another.
 * @param  {String} value  [description]
 * @param  {Number} number [description]
 * @return {Boolean}        [description]
 */
Validator.divisibleBy = (value, number) => {
  value = validator.toString(value);
  return validator.isDivisibleBy(value, number);
};

/**
 * check if the string is an email
 * @param  {String} value   [description]
 * @param  {Object|true} options [description]
 * @return {Boolean}         [description]
 */
Validator.email = (value, options) => {
  assert((helper.isObject(options) || options === true), 'email\'s options should be object or true');
  value = validator.toString(value);
  if(options === true) {
    return validator.isEmail(value);
  }else {
    return validator.isEmail(value, options);
  }
};

/**
 * check if the string is a fully qualified domain name (e.g. domain.com).
 * @param  {String} value   [description]
 * @param  {Object|true} options [description]
 * @return {Boolean}         [description]
 */
Validator.fqdn = (value, options) => {
  assert((helper.isObject(options) || options === true), 'fqdn\'s options should be object or true');
  value = validator.toString(value);
  if(options === true) {
    return validator.isFQDN(value);
  }else {
    return validator.isFQDN(value, options);
  }
};

/**
 * check if the string is a float.
 * @param  {String} value   [description]
 * @param  {Object|true} options [description]
 * @return {Boolean}         [description]
 */
Validator.float = (value, options) => {
  assert((helper.isObject(options) || options === true), 'float\'s options should be object or true');
  value = validator.toString(value);
  if(options === true) {
    return validator.isFloat(value);
  }else {
    return validator.isFloat(value, options);
  }
};

/**
 * check if the string contains any full-width chars.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.fullWidth = value => {
  value = validator.toString(value);
  return validator.isFullWidth(value);
};

/**
 * check if the string contains any half-width chars.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.halfWidth = value => {
  value = validator.toString(value);
  return validator.isHalfWidth(value);
};

/**
 * check if the string is a hexadecimal color.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.hexColor = value => {
  value = validator.toString(value);
  return validator.isHexColor(value);
};

/**
 * check if the string is a hexadecimal number.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.hex = value => {
  value = validator.toString(value);
  return validator.isHexadecimal(value);
};

/**
 * check if the string is a ip.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.ip = value => {
  value = validator.toString(value);
  return validator.isIP(value, 4) || validator.isIP(value, 6);
};

/**
 * check if the string is a ip4.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.ip4 = value => {
  value = validator.toString(value);
  return validator.isIP(value, 4);
};

/**
 * check if the string is a ip6.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.ip6 = value => {
  value = validator.toString(value);
  return validator.isIP(value, 6);
};

/**
 * check if the string is a isbn.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.isbn = value => {
  value = validator.toString(value);
  return validator.isISBN(value, 10) || validator.isISBN(value, 13);
};

/**
 * check if the string is an ISIN (stock/security identifier).
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.isin = value => {
  value = validator.toString(value);
  return validator.isIn(value);
};

/**
 * check if the string is a valid ISO 8601 date.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.iso8601 = value => {
  value = validator.toString(value);
  return validator.isISO8601(value);
};

/**
 * check if the string is in a array of allowed values.
 * @param  {String} value [description]
 * @param  {Array} options [description]
 * @return {Boolean}       [description]
 */
Validator.in = (value, options) => {
  assert(helper.isArray(options), 'in\'s options should be array');
  value = validator.toString(value);
  return validator.isIn(value, options);
};

/**
 * check if the string is not in a array of allowed values.
 * @param  {String} value [description]
 * @param  {Array} options [description]
 * @return {Boolean}       [description]
 */
Validator.notIn = (value, options) => {
  assert(helper.isArray(options), 'notIn\'s options should be array');

  value = validator.toString(value);
  return !validator.isIn(value, options);
};

/**
 *  check if the string is an integer.
 * @param  {String} value   [description]
 * @param  {Object|true} options [description]
 * @return {Boolean}         [description]
 */
Validator.int = (value, options) => {
  assert((helper.isObject(options) || options === true), 'int\'s options should be object or true');
  value = validator.toString(value);
  if(options === true) {
    return validator.isInt(value, {min: 0});
  }else {
    return validator.isInt(value, options);
  }
};

/**
 * check if the string greater than min value
 * @param  {String} value []
 * @param  {int} min []
 * @return {Boolean}       []
 */
// Validator.minInt = (value, min) => {
//   value = validator.toString(value);
//   return validator.isInt(value, {
//     min: min | 0
//   });
// };

/**
 * check if the string less than max value
 * @param  {String} value []
 * @param  {int} max []
 * @return {Boolean}       []
 */
// Validator.maxInt = (value, max) => {
//   value = validator.toString(value);
//   return validator.isInt(value, {
//     min: 0,
//     max: max | 0
//   });
// };

/**
 * check if the string's length falls in a range.
 * @param  {String} value   [description]
 * @param  {Object|true} options [description]
 * @return {Boolean}         [description]
 */
Validator.length = (value, options) => {
  assert((helper.isObject(options) || options === true), 'length\'s options should be object or true');
  value = validator.toString(value);
  if(options === true) {
    return validator.isLength(value, {min: 0, max: undefined});
  }else {
    return validator.isLength(value, options);
  }
};

/**
 * check if the string's length is max than min
 * @param  {String} value []
 * @param  {Int} min   []
 * @return {Boolean}       []
 */
// Validator.minLength = (value, min) => {
//   value = validator.toString(value);
//   return validator.isLength(value, {min: min | 0, max: undefined});
// };

/**
 * check is the string's length is min than max
 * @param  {String} value []
 * @param  {Int} max   []
 * @return {Boolean}       []
 */
// Validator.maxLength = (value, max) => {
//   value = validator.toString(value);
//   return validator.isLength(value, {min: 0, max: max | undefined});
// };


/**
 * check if the string is lowercase.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.lowercase = value => {
  value = validator.toString(value);
  return validator.isLowercase(value);
};

/**
 * check if the string is uppercase.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.uppercase = value => {
  value = validator.toString(value);
  return validator.isUppercase(value);
};

/**
 * check if the string is a mobile phone number
 * @param  {String} value  [description]
 * @param  {String} locale [description]
 * @return {Boolean}        [description]
 */
Validator.mobile = (value, locale) => {
  value = validator.toString(value);
  if(locale === true) {
    return validator.isMobilePhone(value, 'zh-CN');
  }else {
    return validator.isMobilePhone(value, locale);
  }
};

/**
 * check if the string is a valid hex-encoded representation of a MongoDB ObjectId.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.mongoId = value => {
  value = validator.toString(value);
  return validator.isMongoId(value);
};


/**
 * check if the string contains one or more multibyte chars.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.multibyte = value => {
  value = validator.toString(value);
  return validator.isMultibyte(value);
};


/**
 * check if the string is an URL.
 * @param  {String} value   [description]
 * @param  {Object|true} options [description]
 * @return {Boolean}         [description]
 */
Validator.url = (value, options) => {
  assert((helper.isObject(options) || options === true), 'url\'s options should be object or true');

  value = validator.toString(value);
  if(options === true) {
    return validator.isURL(value);
  }else {
    return validator.isURL(value, options);
  }
};

/**
 * check is sql order string
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.order = value => {
  return value.split(/\s*,\s*/).every(item => {
    return /^\w+\s+(?:ASC|DESC)$/i.test(item);
  });
};

/**
 * check is sql field string
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.field = value => {
  return value.split(/\s*,\s*/).every(item => {
    return item === '*' || /^\w+$/.test(item);
  });
};


/**
 * check is image file
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.image = value => {
  if(helper.isObject(value)){
    value = value.originalFilename;
  }
  return /\.(?:jpeg|jpg|png|bmp|gif|svg)$/i.test(value);
};

/**
 * check is string start with str
 * @param  {String} value []
 * @param  {String} str   []
 * @return {Boolean}       []
 */
Validator.startWith = (value, str) => {
  return value.indexOf(str) === 0;
};

/**
 * check is string end with str
 * @param  {String} value []
 * @param  {String} str   []
 * @return {Boolean}       []
 */
Validator.endWith = (value, str) => {
  return value.lastIndexOf(str) === (value.length - str.length);
};

/**
 * check value is string value
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.string = value => {
  return helper.isString(value);
};

/**
 * check value is array value
 * @param  {Array} value []
 * @return {Boolean}       []
 */
Validator.array = value => {
  return helper.isArray(value);
};

/**
 * check value is true
 * @param  {Boolean} value []
 * @return {Boolean}       []
 */
Validator.boolean = value => {
  return helper.isBoolean(value);
};

/**
 * check value is object
 * @param  {Object} value []
 * @return {Boolean}       []
 */
Validator.object = value => {
  return helper.isObject(value);
};

/**
 * check value with regexp
 * @param  {Mixed} value []
 * @param  {RegExp} reg   []
 * @return {Boolean}       []
 */
Validator.regexp = (value, reg) => {
  return reg.test(value);
};

/**
 * check if the string is an ISSN
 * @param  {String} value [description]
 * @param  {Object|true} value [description]
 * @return {Boolean}       [description]
 */
Validator.issn = (value, options) => {
  assert((helper.isObject(options) || options === true), 'issn\'s options should be object or true');
  value = validator.toString(value);
  if(options === true) {
    return validator.isISSN(value);
  }else {
    return validator.isISSN(value, options);
  }
};

/**
 * check if the string is a UUID (version 3, 4 or 5).
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.uuid = value => {
  value = validator.toString(value);
  return validator.isUUID(value, 3) || validator.isUUID(value, 4) || validator.isUUID(value, 5);
};

/**
 * check if the string is md5.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.md5 = value => {
  value = validator.toString(value);
  return validator.isMD5(value);
};


/**
 * check if the string is macaddress.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.macAddress = value => {
  value = validator.toString(value);
  return validator.isMACAddress(value);
};

/**
 * check if the string contains only numbers.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.numeric = value => {
  value = validator.toString(value);
  return validator.isNumeric(value);
};

/**
 * check if the string is a data uri format.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.dataURI = value => {
  value = validator.toString(value);
  return validator.isDataURI(value);
};

/**
 * check if the string contains a mixture of full and half-width chars.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Validator.variableWidth = value => {
  value = validator.toString(value);
  return validator.isVariableWidth(value);
};



module.exports = Validator;
