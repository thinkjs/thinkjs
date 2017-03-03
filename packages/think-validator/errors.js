/**
 * error message
 * @type {Object}
 */
module.exports = {
  required: '{name} can not be blank', //done
  contains: '{name} need contains {args}', //done



  equals: '{name} need match {pargs}', //fail
  different: '{name} need not match {pargs}',//fail
  after: '{name} need a date after {pargs}', //fail
  before: '{name} need a date before {pargs}', //fail




  alpha: '{name} need contains only letters (a-zA-Z)',//done
  alphaDash: '{name} need contains only letters and dashes(a-zA-Z_)',//done
  alphaNumeric: '{name} need contains only letters and numeric(a-zA-Z0-9)',//done
  alphaNumericDash: '{name} need contains only letters, numeric and dash(a-zA-Z0-9_)',//done
  ascii: '{name} need contains ASCII chars only',//done
  base64: '{name} need a valid base64 encoded',//done




  byteLength: '{name} need length (in bytes) between your options', //fail




  creditCard: '{name} need a valid credit card',//done
  currency: '{name} need a valid currency amount',//done
  date: '{name} need a date',//done
  decimal: '{name} need a decimal number',//done
  divisibleBy: '{name} need a number divisible by {args}',//done
  email: '{name} need an email',//done
  fqdn: '{name} need a fully qualified domain name',//done




  float: '{name} need a float between your options', //fail




  fullWidth: '{name} need contains any full-width chars',//done
  halfWidth: '{name} need contains any half-width chars',//done
  hexColor: '{name} need a hexadecimal color',//done
  hex: '{name} need a hexadecimal number',//done
  ip: '{name} need an IP (version 4 or 6)',//done
  ip4: '{name} need an IP (version 4)',//done
  ip6: '{name} need an IP (version 6)',//done
  isbn: '{name} need an ISBN (version 10 or 13)',//done
  isin: '{name} need an ISIN (stock/security identifier)',//done
  iso8601: '{name} need a valid ISO 8601 date',//done
  in: '{name} need in an array of {args}', //done
  notIn: '{name} need not in an array of {args}', //done



  int: '{name} need an integer between your options', //fail



  // minInt: '{name} need an integer greater than {args}',  //done
  // maxInt: '{name} need an integer less than {args}',     //done
  length: '{name} length should between {args}',  //done
  minLength: '{name} length should greater than {args}',//done
  maxLength: '{name} length should less than {args}',//done
  lowercase: '{name} should be lowercase', //done
  uppercase: '{name} should uppercase',//done
  mobile: '{name} need is a mobile phone number',//done
  mongoId: '{name} need is a valid hex-encoded representation of a MongoDB ObjectId',//done
  multibyte: '{name} need contains one or more multibyte chars',//done
  url: '{name} need an URL',//done
  order: '{name} need a valid sql order string',//done
  field: '{name} need a valid sql field string',//done
  image: '{name} need a valid image file',//done
  startWith: '{name} need start with {args}', //done
  endWith: '{name} need end with {args}', //done
  string: '{name} need a string',//done
  array: '{name} need an array',//done
  boolean: '{name} need a boolean',//done
  object: '{name} need an object',//done




  regexp: '{name} need match the custom regexp',//fail




  issn: '{name} need an issn',//done
  uuid: '{name} need an uuid',//done
  md5: '{name} need a md5',//done
  macAddress: '{name} need a macAddress',//done
  numeric: '{name} need a numeric',//done
  dataURI: '{name} need a dataURI',//done
  variableWidth: '{name} need contains a mixture of full and half-width chars',//done
};
