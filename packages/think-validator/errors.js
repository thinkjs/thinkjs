/**
 * error message
 * @type {Object}
 */
module.exports = {
  validate_required: '{name} can not be blank', //done
  validate_contains: '{name} need contains {options}', //done



  validate_equals: '{name} need match {parsedOptions}', //fail
  validate_different: '{name} need not match {parsedOptions}',//fail
  validate_after: '{name} need a date after {parsedOptions}', //fail
  validate_before: '{name} need a date before {parsedOptions}', //fail




  validate_alpha: '{name} need contains only letters (a-zA-Z)',//done
  validate_alphaDash: '{name} need contains only letters and dashes(a-zA-Z_)',//done
  validate_alphaNumeric: '{name} need contains only letters and numeric(a-zA-Z0-9)',//done
  validate_alphaNumericDash: '{name} need contains only letters, numeric and dash(a-zA-Z0-9_)',//done
  validate_ascii: '{name} need contains ASCII chars only',//done
  validate_base64: '{name} need a valid base64 encoded',//done




  validate_byteLength: '{name} need length (in bytes) between your options', //fail




  validate_creditCard: '{name} need a valid credit card',//done
  validate_currency: '{name} need a valid currency amount',//done
  validate_date: '{name} need a date',//done
  validate_decimal: '{name} need a decimal number',//done
  validate_divisibleBy: '{name} need a number divisible by {options}',//done
  validate_email: '{name} need an email',//done
  validate_fqdn: '{name} need a fully qualified domain name',//done




  validate_float: '{name} need a float between your options', //fail




  validate_fullWidth: '{name} need contains any full-width chars',//done
  validate_halfWidth: '{name} need contains any half-width chars',//done
  validate_hexColor: '{name} need a hexadecimal color',//done
  validate_hex: '{name} need a hexadecimal number',//done
  validate_ip: '{name} need an IP (version 4 or 6)',//done
  validate_ip4: '{name} need an IP (version 4)',//done
  validate_ip6: '{name} need an IP (version 6)',//done
  validate_isbn: '{name} need an ISBN (version 10 or 13)',//done
  validate_isin: '{name} need an ISIN (stock/security identifier)',//done
  validate_iso8601: '{name} need a valid ISO 8601 date',//done
  validate_in: '{name} need in an array of {options}', //done
  validate_notIn: '{name} need not in an array of {options}', //done



  validate_int: '{name} need an integer between your options', //fail



  // validate_minInt: '{name} need an integer greater than {options}',  //done
  // validate_maxInt: '{name} need an integer less than {options}',     //done
  validate_length: '{name} length should between {options}',  //done
  validate_minLength: '{name} length should greater than {options}',//done
  validate_maxLength: '{name} length should less than {options}',//done
  validate_lowercase: '{name} should be lowercase', //done
  validate_uppercase: '{name} should uppercase',//done
  validate_mobile: '{name} need is a mobile phone number',//done
  validate_mongoId: '{name} need is a valid hex-encoded representation of a MongoDB ObjectId',//done
  validate_multibyte: '{name} need contains one or more multibyte chars',//done
  validate_url: '{name} need an URL',//done
  validate_order: '{name} need a valid sql order string',//done
  validate_field: '{name} need a valid sql field string',//done
  validate_image: '{name} need a valid image file',//done
  validate_startWith: '{name} need start with {options}', //done
  validate_endWith: '{name} need end with {options}', //done
  validate_string: '{name} need a string',//done
  validate_array: '{name} need an array',//done
  validate_boolean: '{name} need a boolean',//done
  validate_object: '{name} need an object',//done




  validate_regexp: '{name} need match the custom regexp',//fail




  validate_issn: '{name} need an issn',//done
  validate_uuid: '{name} need an uuid',//done
  validate_md5: '{name} need a md5',//done
  validate_macAddress: '{name} need a macAddress',//done
  validate_numeric: '{name} need a numeric',//done
  validate_dataURI: '{name} need a dataURI',//done
  validate_variableWidth: '{name} need contains a mixture of full and half-width chars',//done
};
