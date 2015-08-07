'use strict';

import net from 'net';

//https://github.com/chriso/validator.js
import validator from 'validator';


/**
 * Validator
 * @type {Object}
 */
let Validator = {};
/**
 * check value is set
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.required = value => {
  return !think.isEmpty(value);
};
/**
 * The field under validation must be present if the anotherfield field is equal to any value.
 * @param  {String}    value        []
 * @param  {Stromg}    anotherfield []
 * @param  {Array} values       []
 * @return {Boolean}                 []
 */
Validator.requiredIf = (value, anotherField, ...values) => {
  if(values.indexOf(anotherField) > -1){
    return Validator.required(value);
  }
  return true;
};
/**
 * parse requiredIf args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._requiredIf = (args, data) => {
  let arg0 = args[0];
  args[0] = data[arg0].value;
  return args;
};
/**
 * The field under validation must be present not if the anotherfield field is equal to any value.
 * @param  {String}    value        []
 * @param  {Stromg}    anotherfield []
 * @param  {Array} values       []
 * @return {Boolean}                 []
 */
Validator.requiredNotIf = (value, anotherField, ...values) => {
  if(values.indexOf(anotherField) === -1){
    return Validator.required(value);
  }
  return true;
};
/**
 * parse requiredNotIf args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._requiredNotIf = (args, data) => {
  return Validator._requiredIf(args, data);
};
/**
 * The field under validation must be present only if any of the other specified fields are present.
 * @param  {String}    value         []
 * @param  {Array} anotherFields []
 * @return {Boolean}                  []
 */
Validator.requiredWith = (value, ...anotherFields) => {
  let flag = anotherFields.some(item => {
    return Validator.required(item);
  });
  if(flag){
    return Validator.required(value);
  }
  return true;
};
/**
 * parse required with args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._requiredWith = (args, data) => {
  return args.map(item => {
    return data[item].value;
  });
};
/**
 * The field under validation must be present only if all of the other specified fields are present.
 * @param  {String}    value         []
 * @param  {Array} anotherFields []
 * @return {Boolean}                  []
 */
Validator.requiredWithAll = (value, ...anotherFields) => {
  let flag = anotherFields.every(item => {
    return Validator.required(item);
  });
  if(flag){
    return Validator.required(value);
  }
  return true;
};
/**
 * parse required with all args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._requiredWithAll = (args, data) => {
  return Validator._requiredWith(args, data);
};
/**
 * The field under validation must be present only when any of the other specified fields are not present.
 * @param  {String}    value         []
 * @param  {Array} anotherFields []
 * @return {Boolean}                  []
 */
Validator.requiredWithout = (value, ...anotherFields) => {
  let flag = anotherFields.some(item => {
    return !Validator.required(item);
  });
  if(flag){
    return Validator.required(value);
  }
  return true;
};
/**
 * parse required without args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._requiredWithout = (args, data) => {
  return Validator._requiredWith(args, data);
};
/**
 * The field under validation must be present only when all of the other specified fields are not present.
 * @param  {String}    value         []
 * @param  {Array} anotherFields []
 * @return {Boolean}                  []
 */
Validator.requiredWithoutAll = (value, ...anotherFields) => {
  let flag = anotherFields.every(item => {
    return !Validator.required(item);
  });
  if(flag){
    return Validator.required(value);
  }
  return true;
};
/**
 * parse required without all args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._requiredWithoutAll = (args, data) => {
  return Validator._requiredWith(args, data);
};
/**
 * check if the string contains the seed.
 * @param  {String} value []
 * @param  {String} str   []
 * @return {Boolean}       []
 */
Validator.contains = (value, str) => {
  return validator.contains(value, str);
};
/**
 *  check if the string matches the comparison.
 * @param  {String} value      []
 * @param  {String} comparison []
 * @return {Boolean}            []
 */
Validator.equals = (value, comparison) => {
  return validator.equals(value, comparison);
};
/**
 * parse equal args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._equals = (args, data) => {
  return [data[args[0]].value];
};
/**
 * check if the string not matches the comparison.
 * @type {Boolean}
 */
Validator.different = (value, comparison) => {
  return value !== comparison;
};
/**
 * parse different args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._different = (args, data) => {
  return Validator._equals(args, data);
};
/**
 * check if the string is a date that's after the specified date (defaults to now).
 * @param  {String} value []
 * @param  {String} date  []
 * @return {Boolean}       []
 */
Validator.after = (value, date) => {
  return validator.isAfter(value, date);
};
/**
 * parse after args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._after = (args, data) => {
  let arg = args[0];
  if(arg in data){
    return [data[arg].value];
  }
  return args;
};
/**
 * check if the string contains only letters (a-zA-Z).
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.alpha = value => {
  return validator.isAlpha(value);
};
/**
 * check if the string contains only letters and dashes(a-zA-Z_).
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.alphaDash = value => {
  return /^[A-Z_]+$/i.test(value);
};
/**
 * check if the string contains only letters and numbers.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.alphaNumeric = value => {
  return validator.isAlphanumeric(value);
};
/**
 * check if the string contains only letters or numbers or dash.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.alphaNumericDash = value => {
  return /^\w+$/i.test(value);
};
/**
 * check if the string contains ASCII chars only.
 * @param  {String} value []
 * @return {Boolean}      []
 */
Validator.ascii = value => {
  return validator.isAscii(value);
};
/**
 * check if a string is base64 encoded.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.base64 = value => {
  return validator.isBase64(value);
};
/**
 * check if the string is a date that's before the specified date.
 * @param  {String} value []
 * @param  {String} date  []
 * @return {Boolean}       []
 */
Validator.before = (value, date) => {
  return validator.isBefore(value, date);
};
/**
 * parse before args
 * @param  {Array} args []
 * @param  {Object} data []
 * @return {Array}      []
 */
Validator._before = (args, data) => {
  return Validator._after(args, data);
};
/**
 * check if the string's length (in bytes) falls in a range.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.byteLength = (value, min, max) => {
  return validator.isByteLength(value, min, max);
};
/**
 *  check if the string is a credit card.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.creditcard = value => {
  return validator.isCreditCard(value);
};
/**
 * check if the string is a valid currency amount. options is an object which defaults to
 * @param  {String} value   []
 * @param  {Object} options []
 * @return {Boolean}         []
 */
Validator.currency = (value, options) => {
  return validator.isCurrency(value, options);
};
/**
 * check if the string is a date.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.date = value => {
  return validator.isDate(value);
};
/**
 * check if the string represents a decimal number, such as 0.1, .3, 1.1, 1.00003, 4.0, etc.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.decimal = value => {
  return validator.isDecimal(value);
};
/**
 * check if the string is a number that's divisible by another.
 * @param  {Number} value  []
 * @param  {Number} number []
 * @return {Boolean}        []
 */
Validator.divisibleBy = (value, number) => {
  return validator.isDivisibleBy(value, number);
};
/**
 * check if the string is an email. 
 * options is an object which defaults to { 
 *   allow_display_name: false, 
 *   allow_utf8_locale_part: true, 
 *   require_tld: true 
 *  }. 
 *  If allow_display_name is set to true, the validator will also match Display Name <email-address>. 
 *  If allow_utf8_locale_part is set to false, the validator will not allow any non-English UTF8 character in email address' locale part. 
 *  If require_tld is set to false, e-mail addresses without having TLD in their domain will also be matched.
 * @param  {String} value   []
 * @param  {Object} options []
 * @return {Boolean}         []
 */
Validator.email = (value, options) => {
  return validator.isEmail(value, options);
};
/**
 * check if the string is a fully qualified domain name (e.g. domain.com). 
 * options is an object which defaults to { 
 *   require_tld: true, 
 *   allow_underscores: false, 
 *   allow_trailing_dot: false 
 * }.
 * @param  {String} value   []
 * @param  {Object} options []
 * @return {Boolean}         []
 */
Validator.fqdn = (value, options) => {
  return validator.isFQDN(value, options);
};
/**
 *  check if the string is a float. 
 *  options is an object which can contain the keys min and/or max to validate the float is within boundaries 
 *  (e.g. { min: 7.22, max: 9.55 }).
 * @param  {String} value   []
 * @param  {Object} options []
 * @return {Boolean}         []
 */
Validator.float = (value, min, max) => {
  let options = {};
  if(min){
    options.min = min;
  }
  if(max){
    options.max = max;
  }
  return validator.isFloat(value, options);
};
/**
 * check if the string contains any full-width chars.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.fullWidth = value => {
  return validator.isFullWidth(value);
};
/**
 * check if the string contains any half-width chars.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.halfWidth = value => {
  return validator.isHalfWidth(value);
};
/**
 * check if the string is a hexadecimal color.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.hexColor = value => {
  return validator.isHexColor(value);
};
/**
 * check if the string is a hexadecimal number.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.hex = value => {
  return validator.isHexadecimal(value);
};
/**
 * check if the string is an IP (version 4 or 6).
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.ip = value => {
  return !!net.isIP(value);
};
/**
 * check if the string is an IP v4
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.ip4 = value => {
  return net.isIPv4(value);
};
/**
 * check if the string is an IP v6
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.ip6 = value => {
  return net.isIPv6(value);
};
/**
 * check if the string is an ISBN (version 10 or 13).
 * @param  {String} value   []
 * @param  {Number} version []
 * @return {Boolean}         []
 */
Validator.isbn = (value, version) => {
  return validator.isISBN(value, version);
};
/**
 * check if the string is an ISIN (stock/security identifier).
 * https://en.wikipedia.org/wiki/International_Securities_Identification_Number
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.isin = value => {
  return validator.isISIN(value);
};
/**
 * check if the string is a valid ISO 8601 date.
 * https://en.wikipedia.org/wiki/ISO_8601
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.iso8601 = value => {
  return validator.isISO8601(value);
};
/**
 * check if the string is in a array of allowed values.
 * @type {Boolean}
 */
Validator.in = (value, ...values) => {
  return validator.isIn(value, values);
};
/**
 * check if the string is not in a array of allowed values.
 * @type {Boolean}
 */
Validator.notIn = (value, ...values) => {
  return !validator.isIn(value, values);
};
/**
 * check if the string is an integer. 
 * options is an object which can contain the keys min and/or max to check the integer is within boundaries (e.g. { min: 10, max: 99 }).
 * @type {Boolean}
 */
Validator.int = (value, min, max) => {
  let options = {};
  if(min){
    options.min = min | 0;
  }
  if(max){
    options.max = max | 0;
  }
  return validator.isInt(value, options);
};
/**
 * check if the string greater than min value
 * @param  {String} value []
 * @param  {Number} min   []
 * @return {Boolean}       []
 */
Validator.min = (value, min) => {
  return validator.isInt(value, {
    min: min | 0
  });
};
/**
 * check if the string less than max value
 * @param  {String} value []
 * @param  {Number} max   []
 * @return {Boolean}       []
 */
Validator.max = (value, max) => {
  return validator.isInt(value, {
    min: 0,
    max: max | 0
  });
};
/**
 * check if the string's length falls in a range. Note: this function takes into account surrogate pairs.
 * @param  {String} value []
 * @param  {Number} min   []
 * @param  {Number} max   []
 * @return {Boolean}       []
 */
Validator.length = (value, min, max) => {
  if(min){
    min = min | 0;
  }else{
    min = 1;
  }
  if(max){
    max = max | 0;
  }
  return validator.isLength(value, min, max);
};
/**
 * check if the string's length is max than min
 * @param  {String} value []
 * @param  {Number} min   []
 * @return {Boolean}       []
 */
Validator.minLength = (value, min) => {
  return validator.isLength(value, min | 0);
};
/**
 * check is the string's length is min than max
 * @param  {String} value []
 * @param  {Number} max   []
 * @return {Boolean}       []
 */
Validator.maxLength = (value, max) => {
  return validator.isLength(value, 0, max | 0);
};
/**
 * check if the string is lowercase.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.lowercase = value => {
  return validator.isLowercase(value);
};
/**
 * check if the string is a mobile phone number, 
 * (locale is one of ['zh-CN', 'en-ZA', 'en-AU', 'en-HK', 'pt-PT', 'fr-FR', 'el-GR', 'en-GB', 'en-US', 'en-ZM', 'ru-RU']).
 * @param  {String} value []
 * @param  {[type]} locale []
 * @return {Boolean}       []
 */
Validator.mobile = (value, locale = 'zh-CN') => {
  return validator.isMobilePhone(value, locale);
};
/**
 *  check if the string is a valid hex-encoded representation of a MongoDB ObjectId.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.mongoId = value => {
  return validator.isMongoId(value);
};
/**
 * check if the string contains one or more multibyte chars.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.multibyte = value => {
  return validator.isMultibyte(value);
};
/**
 * check if the string contains only numbers.
 * @param  {String} value []
 * @return {Boolean}       []
 */
// Validator.number = value => {
//   return validator.isNumeric(value);
// };
/**
 * check if the string is an URL. 
 * options is an object which defaults to { 
 *   protocols: ['http','https','ftp'], 
 *   require_tld: true, 
 *   require_protocol: false, 
 *   require_valid_protocol: true, 
 *   allow_underscores: false, 
 *   host_whitelist: false, 
 *   host_blacklist: false, 
 *   allow_trailing_dot: false, 
 *   allow_protocol_relative_urls: false 
 * }.
 * @type {Boolean}
 */
Validator.url = (value, options) => {
  options = think.extend({
    require_protocol: true,
    protocols: ['http', 'https']
  }, options);
  return validator.isURL(value, options);
};
/**
 * check if the string is uppercase.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.uppercase = value => {
  return validator.isUppercase(value);
};
/**
 * check if the string contains a mixture of full and half-width chars.
 * @param  {String} value []
 * @return {Boolean}       []
 */
Validator.variableWidth = value => {
  return validator.isVariableWidth(value);
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
  if(think.isObject(value)){
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
  return think.isString(value);
};
/**
 * check value is array value
 * @param  {Array} value []
 * @return {Boolean}       []
 */
Validator.array = value => {
  return think.isArray(value);
};
/**
 * check value is true
 * @param  {Boolean} value []
 * @return {Boolean}       []
 */
Validator.boolean = value => {
  return value === true;
};
/**
 * check value is object
 * @param  {Object} value []
 * @return {Boolean}       []
 */
Validator.object = value => {
  return think.isObject(value);
};

export default Validator;