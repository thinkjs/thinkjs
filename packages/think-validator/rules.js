/*
* @Author: lushijie
* @Date:   2017-02-27 19:11:47
* @Last Modified by:   lushijie
* @Last Modified time: 2018-02-04 17:46:11
*/
'use strict';
const helper = require('think-helper');
const validator = require('validator');
const assert = require('assert');
const METHOD_MAP = {
  GET: 'param',
  POST: 'post',
  FILE: 'file',
  PUT: 'post',
  DELETE: 'post',
  PATCH: 'post',
  LINK: 'post',
  UNLINK: 'post',
  WEBSOCKET: 'param',
  CLI: 'param'
};
const Rules = {};

/**
 * check value is set
 * @param  {String}  value []
 * @param  {Boolean} validValue []
 * @return {Boolean}       []
 */
Rules.required = (value, validValue) => {
  return validValue;
};

/**
 * parse requiredIf rule validValue
 * @param  {Array}  validValue []
 * @param  {Object} []
 * @return {Array}  []
 */
Rules._requiredIf = (validValue, { currentQuery, ctx, rules }) => {
  assert(helper.isArray(validValue), 'requiredIf\'s value should be array');
  validValue = validValue.slice();
  const first = validValue[0];
  if (rules && rules[first] && rules[first]['method']) {
    currentQuery = helper.extend({}, currentQuery);
    const method = rules[first]['method'].toUpperCase();
    currentQuery = ctx[METHOD_MAP[method]]();
  }
  // just parse the first param
  validValue[0] = currentQuery[first];
  return validValue;
};

/**
 * The field under validation must be present if the otherFields field is equal to any value.
 * @param  {String}    value       [description]
 * @param  {Array}     parsedValidValue     [description]
 * @return {Boolean}               [description]
 */
Rules.requiredIf = (value, { parsedValidValue }) => {
  const first = parsedValidValue[0];
  const others = parsedValidValue.slice(1);
  return others.indexOf(first) > -1;
};

/**
 * parse requiredNotIf rule validValue
 * @param  {Array} validValue      []
 * @param  {Object} []
 * @return {Array}      []
 */
Rules._requiredNotIf = (validValue, { currentQuery, ctx, rules }) => {
  assert(helper.isArray(validValue), 'requiredNotIf\'s value should be array');
  return Rules._requiredIf(validValue, { currentQuery, ctx, rules });
};

/**
 * The field under validation must be present not if the otherFileds field is equal to any value.
 * @param  {String}    value        []
 * @param  {Array}     parsedValidValue       []
 * @return {Boolean}                 []
 */
Rules.requiredNotIf = (value, { parsedValidValue }) => {
  const first = parsedValidValue[0];
  const others = parsedValidValue.slice(1);
  return (others.indexOf(first) === -1);
};

/**
 * parse required rule validValue
 * @param  {Array}  validValue []
 * @param  {Object} []
 * @return {Array}      []
 */
Rules._requiredWith = (validValue, { currentQuery, rules, ctx }) => {
  assert(helper.isArray(validValue), 'requiredWith\'s value should be array');
  validValue = validValue.slice();

  // parsed all the param
  return validValue.map(item => {
    if (rules && rules[item] && rules[item]['method']) {
      currentQuery = helper.extend({}, currentQuery);
      const method = rules[item]['method'].toUpperCase();
      currentQuery = ctx[METHOD_MAP[method]]();
    }
    return !helper.isTrueEmpty(currentQuery[item]) ? currentQuery[item] : '';
  });
};

/**
 * The field under validation must be present only if any of the other specified fields are present.
 * @param  {String} value         []
 * @param  {Array}  parsedValidValue  []
 * @return {Boolean}              []
 */
Rules.requiredWith = (value, { parsedValidValue }) => {
  return parsedValidValue.some(item => {
    return !helper.isTrueEmpty(item);
  });
};

/**
 * parse requiredWithAll rule validValue
 * @param  {Array}  validValue []
 * @param  {Object} []
 * @return {Array}      []
 */
Rules._requiredWithAll = (validValue, { currentQuery, rules, ctx }) => {
  assert(helper.isArray(validValue), 'requiredWithAll\'s value should be array');
  return Rules._requiredWith(validValue, { currentQuery, rules, ctx });
};

/**
 * The field under validation must be present only if all of the other specified fields are present.
 * @param  {String}    value         []
 * @param  {Array}     parsedValidValue       []
 * @return {Boolean}                 []
 */
Rules.requiredWithAll = (value, { parsedValidValue }) => {
  return parsedValidValue.every(item => {
    return !helper.isTrueEmpty(item);
  });
};

/**
 * parse requiredWithOut rule validValue
 * @param  {Array} validValue []
 * @param  {Object} []
 * @return {Array}      []
 */
Rules._requiredWithOut = (validValue, { currentQuery, rules, ctx }) => {
  assert(helper.isArray(validValue), 'requiredWithOut\'s value should be array');
  return Rules._requiredWith(validValue, { currentQuery, rules, ctx });
};

/**
 * The field under validation must be present only when any of the other specified fields are not present.
 * @param  {String}    value          []
 * @param  {Array} parsedValidValue            []
 * @return {Boolean}                  []
 */
Rules.requiredWithOut = (value, { parsedValidValue }) => {
  return parsedValidValue.some(item => {
    return helper.isTrueEmpty(item);
  });
};

/**
 * parse requiredWithOutAll rule validValue
 * @param  {Array} validValue []
 * @param  {Object} []
 * @return {Array}      []
 */
Rules._requiredWithOutAll = (validValue, { currentQuery, rules, ctx }) => {
  assert(helper.isArray(validValue), 'requiredWithOutAll\'s value should be array');
  return Rules._requiredWith(validValue, { currentQuery, rules, ctx });
};

/**
 * The field under validation must be present only when all of the other specified fields are not present.
 * @param  {String}    value         []
 * @param  {Array}     parsedValidValue []
 * @return {Boolean}                  []
 */
Rules.requiredWithOutAll = (value, { parsedValidValue }) => {
  return parsedValidValue.every(item => {
    return helper.isTrueEmpty(item);
  });
};

/**
 * check if the string contains the validValue.
 * @param  {String} value []
 * @param  {String} validValue   []
 * @return {Boolean}       []
 */
Rules.contains = (value, { validValue }) => {
  value = validator.toString(value);
  return validator.contains(value, validValue);
};

/**
 * parse equal rule validValue
 * @param  {String} validValue []
 * @param  {Object} []
 * @return {String}      []
 */
Rules._equals = (validValue, { currentQuery, rules, ctx }) => {
  if (rules && rules[validValue] && rules[validValue]['method']) {
    currentQuery = helper.extend({}, currentQuery);
    const method = rules[validValue]['method'].toUpperCase();
    currentQuery = ctx[METHOD_MAP[method]]();
  }
  return currentQuery[validValue];
};

/**
 * check if the string matches the parsedValidValue.
 * @param  {String} value      []
 * @param  {String} parsedValidValue []
 * @return {Boolean}            []
 */
Rules.equals = (value, { parsedValidValue }) => {
  value = validator.toString(value);
  return validator.equals(value, parsedValidValue);
};

/**
 * parse different rule validValue
 * @param  {Array}  validValue []
 * @param  {Object} []
 * @return {Array}  []
 */
Rules._different = (validValue, { currentQuery, rules, ctx }) => {
  return Rules._equals(validValue, { currentQuery, rules, ctx });
};

/**
 * check if the string not matches the parsedValidValue.
 * @param  {String} value      [description]
 * @param  {String} parsedValidValue [description]
 * @return {Boolean}            [description]
 */
Rules.different = (value, { parsedValidValue }) => {
  value = validator.toString(value);
  return !validator.equals(value, parsedValidValue);
};

/*
 * pretreat before rule validValue
 * @param  {Date String|true} validValue []
 * @return {Array}      []
*/
Rules._before = (validValue) => {
  if (validValue === true) {
    const now = new Date();
    const nowTime = now.getFullYear() + '-' +
                  (now.getMonth() + 1) + '-' +
                  now.getDate() + ' ' +
                  now.getHours() + ':' +
                  now.getMinutes() + ':' +
                  now.getSeconds();
    return nowTime;
  }
  assert(Rules.date(validValue), 'validValue should be date');
  return validValue;
};

/*
 * check if the string is a date that's before the specified date.
 * @param  {String} value []
 * @param  {Date String} parsedValidValue  []
 * @return {Boolean}       []
*/
Rules.before = (value, { parsedValidValue }) => {
  value = validator.toString(value);
  return validator.isBefore(value, parsedValidValue);
};

/*
 * pretreat after rule validValue
 * @param  {Date String | true} validValue []
 * @return {Array}      []
*/
Rules._after = (validValue) => {
  return Rules._before(validValue);
};

/*
 * check if the string is a date that's after the specified date (defaults to now).
 * @param  {String} value []
 * @param  {Date String} parsedValidValue  []
 * @return {Boolean}       []
*/
Rules.after = (value, { parsedValidValue }) => {
  value = validator.toString(value);
  return validator.isAfter(value, parsedValidValue);
};

/**
 * check value is string value
 * @param  {String} value []
 * @return {Boolean}       []
 */
Rules.alpha = value => {
  value = validator.toString(value);
  return validator.isAlpha(value);
};

/**
 * check if the string contains letters (a-zA-Z_).
 * @param  {String} value []
 * @return {Boolean}       []
 */
Rules.alphaDash = value => {
  value = validator.toString(value);
  return /^[A-Z_]+$/i.test(value);
};

/**
 * check value is true
 * @param  {Boolean} value []
 * @return {Boolean}       []
 */
Rules.alphaNumeric = value => {
  value = validator.toString(value);
  return validator.isAlphanumeric(value);
};

/**
 * check if the string contains only letters, numbers and _.
 * @param  {String} value []
 * @param  {String|true} locale default:en-US
 * @return {Boolean}       []
 */
Rules.alphaNumericDash = value => {
  value = validator.toString(value);
  return /^\w+$/i.test(value);
};

/**
 * check is image file
 * @param  {String} value []
 * @return {Boolean}       []
 */
Rules.ascii = value => {
  value = validator.toString(value);
  return validator.isAscii(value);
};

/**
 * check is sql order string
 * @param  {String} value []
 * @return {Boolean}       []
 */
Rules.base64 = value => {
  value = validator.toString(value);
  return validator.isBase64(value);
};

/**
 * check if the string contains only letters or numbers or dash.
 * @param  {String} value []
 * @param  {Object} validValue []
 * @return {Boolean}       []
 */
Rules.byteLength = (value, { validValue }) => {
  assert(helper.isObject(validValue) || helper.isInt(validValue), 'byteLength\'s value should be object or integer');
  value = validator.toString(value);
  if (helper.isObject(validValue)) {
    return validator.isByteLength(value, {min: validValue.min | 0, max: validValue.max});
  } else {
    assert(value > 0, 'byteLength\'s value should be integer larger than zero');
    return validator.isByteLength(value, {min: validValue, max: validValue});
  }
};

/**
 * check if the string not matches the comparison.
 * @type {Boolean}
 */
Rules.creditCard = value => {
  value = validator.toString(value);
  return validator.isCreditCard(value);
};

/**
 * check if the string is a valid currency amount
 * @param  {String} value   []
 * @param  {Object|true} validValue []
 * @return {Boolean}         []
 */
Rules.currency = (value, { validValue }) => {
  assert((helper.isObject(validValue) || validValue === true), 'currency\'s value should be object or true');
  value = validator.toString(value);
  if (validValue === true) {
    return validator.isCurrency(value);
  } else {
    return validator.isCurrency(value, validValue);
  }
};

/**
 * check is string date format
 * @param  {String} value []
 * @param  {Number} min   []
 * @return {Boolean}       []
 */
Rules.date = value => {
  if (isNaN(Date.parse(value))) {
    return false;
  }
  return true;
};

/**
 * check if the string represents a decimal number, such as 0.1, .3, 1.1, 1.00003, 4.0, etc.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.decimal = value => {
  value = validator.toString(value);
  return validator.isDecimal(value);
};

/**
 * check if the string is a number that's divisible by another.
 * @param  {String} value  [description]
 * @param  {Number} validValue [description]
 * @return {Boolean}        [description]
 */
Rules.divisibleBy = (value, { validValue }) => {
  value = validator.toString(value);
  return validator.isDivisibleBy(value, validValue);
};

/**
 * check if the string is an email
 * @param  {String} value   [description]
 * @param  {Object|true} validValue [description]
 * @return {Boolean}         [description]
 */
Rules.email = (value, { validValue }) => {
  assert((helper.isObject(validValue) || validValue === true), 'email\'s value should be object or true');
  value = validator.toString(value);
  if (validValue === true) {
    return validator.isEmail(value);
  } else {
    return validator.isEmail(value, validValue);
  }
};

/**
 * check if the string is a fully qualified domain name (e.g. domain.com).
 * @param  {String} value   [description]
 * @param  {Object|true} validValue [description]
 * @return {Boolean}         [description]
 */
Rules.fqdn = (value, { validValue }) => {
  assert((helper.isObject(validValue) || validValue === true), 'fqdn\'s value should be object or true');
  value = validator.toString(value);
  if (validValue === true) {
    return validator.isFQDN(value);
  } else {
    return validator.isFQDN(value, validValue);
  }
};

/**
 * check if the string is a float.
 * @param  {String} value   [description]
 * @param  {Object|true} validValue [description]
 * @return {Boolean}         [description]
 */
Rules.float = (value, { validValue }) => {
  assert((helper.isObject(validValue) || validValue === true), 'float\'s value should be object or true');
  value = validator.toString(value);
  if (validValue === true) {
    return validator.isFloat(value);
  } else {
    return validator.isFloat(value, validValue);
  }
};

/**
 * check if the string contains any full-width chars.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.fullWidth = value => {
  value = validator.toString(value);
  return validator.isFullWidth(value);
};

/**
 * check if the string contains any half-width chars.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.halfWidth = value => {
  value = validator.toString(value);
  return validator.isHalfWidth(value);
};

/**
 * check if the string is a hexadecimal color.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.hexColor = value => {
  value = validator.toString(value);
  return validator.isHexColor(value);
};

/**
 * check if the string is a hexadecimal number.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.hex = value => {
  value = validator.toString(value);
  return validator.isHexadecimal(value);
};

/**
 * check if the string is a ip.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.ip = value => {
  value = validator.toString(value);
  return validator.isIP(value, 4) || validator.isIP(value, 6);
};

/**
 * check if the string is a ip4.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.ip4 = value => {
  value = validator.toString(value);
  return validator.isIP(value, 4);
};

/**
 * check if the string is a ip6.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.ip6 = value => {
  value = validator.toString(value);
  return validator.isIP(value, 6);
};

/**
 * check if the string is a isbn.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.isbn = value => {
  value = validator.toString(value);
  return validator.isISBN(value, 10) || validator.isISBN(value, 13);
};

/**
 * check if the string is an ISIN (stock/security identifier).
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.isin = value => {
  value = validator.toString(value);
  return validator.isISIN(value);
};

/**
 * check if the string is a valid ISO 8601 date.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.iso8601 = value => {
  value = validator.toString(value);
  return validator.isISO8601(value);
};

/**
 * check if the string is in a array of allowed values.
 * @param  {String} value [description]
 * @param  {Array} validValue [description]
 * @return {Boolean}       [description]
 */
Rules.in = (value, { validValue }) => {
  assert(helper.isArray(validValue), 'in\'s value should be array');
  value = validator.toString(value);
  return validator.isIn(value, validValue);
};

/**
 * check if the string is not in a array of allowed values.
 * @param  {String} value [description]
 * @param  {Array} validValue [description]
 * @return {Boolean}       [description]
 */
Rules.notIn = (value, { validValue }) => {
  assert(helper.isArray(validValue), 'notIn\'s value should be array');

  value = validator.toString(value);
  return !validator.isIn(value, validValue);
};

/**
 *  check if the string is an integer.
 * @param  {String} value   [description]
 * @param  {Object|true} validValue [description]
 * @return {Boolean}         [description]
 */
Rules.int = (value, { validValue }) => {
  assert((helper.isObject(validValue) || validValue === true), 'int\'s value should be object or true');
  value = validator.toString(value);
  if (validValue === true) {
    return validator.isInt(value);
  } else {
    return validator.isInt(value, validValue);
  }
};

/**
 * check if the string's length falls in a range.
 * @param  {String} value   [description]
 * @param  {Object|true} validValue [description]
 * @return {Boolean}         [description]
 */
Rules.length = (value, { validValue }) => {
  assert(helper.isObject(validValue) || helper.isInt(validValue), 'length\'s value should be object or integer');
  value = validator.toString(value);
  if (helper.isObject(validValue)) {
    return validator.isLength(value, {min: validValue.min | 0, max: validValue.max});
  } else {
    assert(validValue > 0, 'length\'s value should be integer larger than zero');
    return validator.isLength(value, {min: validValue, max: validValue});
  }
};

/**
 * check if the string is lowercase.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.lowercase = value => {
  value = validator.toString(value);
  return validator.isLowercase(value);
};

/**
 * check if the string is uppercase.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.uppercase = value => {
  value = validator.toString(value);
  return validator.isUppercase(value);
};

/**
 * check if the string is a mobile phone number
 * @param  {String} value  [description]
 * @param  {String} validValue [description]
 * @return {Boolean}        [description]
 */
Rules.mobile = (value, { validValue }) => {
  value = validator.toString(value);
  if (validValue === true) {
    return validator.isMobilePhone(value, 'zh-CN');
  } else {
    return validator.isMobilePhone(value, validValue);
  }
};

/**
 * check if the string is a valid hex-encoded representation of a MongoDB ObjectId.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.mongoId = value => {
  value = validator.toString(value);
  return validator.isMongoId(value);
};

/**
 * check if the string contains one or more multibyte chars.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.multibyte = value => {
  value = validator.toString(value);
  return validator.isMultibyte(value);
};

/**
 * check if the string is an URL.
 * @param  {String} value   [description]
 * @param  {Object|true} validValue [description]
 * @return {Boolean}         [description]
 */
Rules.url = (value, { validValue }) => {
  assert((helper.isObject(validValue) || validValue === true), 'url\'s validValue should be object or true');

  value = validator.toString(value);
  if (validValue === true) {
    return validator.isURL(value);
  } else {
    return validator.isURL(value, validValue);
  }
};

/**
 * check is sql order string
 * @param  {String} value []
 * @return {Boolean}       []
 */
Rules.order = value => {
  return value.split(/\s*,\s*/).every(item => {
    return /^\w+\s+(?:ASC|DESC)$/i.test(item);
  });
};

/**
 * check is sql field string
 * @param  {String} value []
 * @return {Boolean}       []
 */
Rules.field = value => {
  return value.split(/\s*,\s*/).every(item => {
    return item === '*' || /^\w+$/.test(item);
  });
};

/**
 * check is image file
 * @param  {String} value []
 * @return {Boolean}       []
 */
Rules.image = value => {
  if (helper.isObject(value)) {
    value = value.name;
  }
  return /\.(?:jpeg|jpg|png|bmp|gif|svg)$/i.test(value);
};

/**
 * check is string start with str
 * @param  {String} value []
 * @param  {String} validValue   []
 * @return {Boolean}       []
 */
Rules.startWith = (value, { validValue }) => {
  return value.indexOf(validValue) === 0;
};

/**
 * check is string end with str
 * @param  {String} value []
 * @param  {String} validValue   []
 * @return {Boolean}       []
 */
Rules.endWith = (value, { validValue }) => {
  return value.lastIndexOf(validValue) === (value.length - validValue.length);
};

/**
 * check value is string value
 * @param  {String} value []
 * @return {Boolean}       []
 */
Rules.string = value => {
  return helper.isString(value);
};

/**
 * check value is array value
 * @param  {Array} value []
 * @return {Boolean}       []
 */
Rules.array = value => {
  return helper.isArray(value);
};

/**
 * check value is true
 * @param  {Boolean} value []
 * @return {Boolean}       []
 */
Rules.boolean = value => {
  return helper.isBoolean(value);
};

/**
 * check value is object
 * @param  {Object} value []
 * @return {Boolean}       []
 */
Rules.object = value => {
  return helper.isObject(value);
};

/**
 * check value with regexp
 * @param  {Mixed} value []
 * @param  {RegExp} validValue   []
 * @return {Boolean}       []
 */
Rules.regexp = (value, { validValue }) => {
  assert(helper.isRegExp(validValue), 'argument should be regexp');
  return validValue.test(value);
};

/**
 * check if the string is an ISSN
 * @param  {String} value [description]
 * @param  {Object|true} value [description]
 * @return {Boolean}       [description]
 */
Rules.issn = (value, { validValue }) => {
  assert((helper.isObject(validValue) || validValue === true), 'issn\'s validValue should be object or true');
  value = validator.toString(value);
  if (validValue === true) {
    return validator.isISSN(value);
  } else {
    return validator.isISSN(value, validValue);
  }
};

/**
 * check if the string is a UUID (version 3, 4 or 5).
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.uuid = value => {
  value = validator.toString(value);
  return validator.isUUID(value, 3) || validator.isUUID(value, 4) || validator.isUUID(value, 5);
};

/**
 * check if the string is md5.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.md5 = value => {
  value = validator.toString(value);
  return validator.isMD5(value);
};

/**
 * check if the string is macaddress.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.macAddress = value => {
  value = validator.toString(value);
  return validator.isMACAddress(value);
};

/**
 * check if the string is a data uri format.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.dataURI = value => {
  value = validator.toString(value);
  return validator.isDataURI(value);
};

/**
 * check if the string contains a mixture of full and half-width chars.
 * @param  {String} value [description]
 * @return {Boolean}       [description]
 */
Rules.variableWidth = value => {
  value = validator.toString(value);
  return validator.isVariableWidth(value);
};

module.exports = Rules;
