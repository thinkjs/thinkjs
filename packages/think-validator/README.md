# think-validator
[![Build Status](https://travis-ci.org/thinkjs/think-validator.svg?branch=master)](https://travis-ci.org/thinkjs/think-validator)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-validator/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-validator?branch=master)
[![npm](https://img.shields.io/npm/v/think-validator.svg?style=flat-square)](https://www.npmjs.com/package/think-validator)

- [think-validator](#think-validator)
    + [Useage](#useage)
    + [Add Custom Valid Method](#add-custom-valid-method)
    + [Parse Rule's Arguments](#parse-rules-arguments)
    + [Param Validation Config](#param-validation-config)
    + [Supported Data Type](#supported-data-type)
    + [Nested Validation Type](#nested-validation-type)
      - [Nested array valid, eg](#nested-array-valid-eg)
      - [Nested object valid, eg](#nested-object-valid-eg)
    + [Custom Error Message](#custom-error-message)
    + [Supported Validation Type](#supported-validation-type)
      - [requiredIf: [Array]](#requiredif--array)
      - [requiredNotIf: [Array]](#requirednotif--array)
      - [requiredWith: [Array]](#requiredwith--array)
      - [requiredWithAll: [Array]](#requiredwithall--array)
      - [requiredWithOut: [Array]](#requiredwithout--array)
      - [requiredWithOutAll: [Array]](#requiredwithoutall--array)
      - [contains: [String]](#contains--string)
      - [equals: [String]](#equals--string)
      - [different: [String]](#different--string)
      - [before: [true|date format string]](#before--truedate-format-string)
      - [after: [true|date format string]](#after--truedate-format-string)
      - [alpha: [true]](#alpha--true)
      - [alphaDash: [true]](#alphadash--true)
      - [alphaNumeric: [true]](#alphanumeric--true)
      - [alphaNumericDash: [true]](#alphanumericdash--true)
      - [ascii: [true]](#ascii--true)
      - [base64: [true]](#base64--true)
      - [byteLength: [{min: 0, max: 10}]](#bytelength--min-0-max-10)
      - [creditCard: [true]](#creditcard--true)
      - [currency: [true|options]](#currency--trueoptions)
      - [date: [true]](#date--true)
      - [decimal: [true]](#decimal--true)
      - [divisibleBy: [number]](#divisibleby--number)
      - [email: [true|options]](#email--trueoptions)
      - [fqdn: [true|options]](#fqdn--trueoptions)
      - [float: [true|{min: 0, max: 10}]](#float--truemin-0-max-10)
      - [fullWidth: [true]](#fullwidth--true)
      - [halfWidth: [true]](#halfwidth--true)
      - [hexColor: [true]](#hexcolor--true)
      - [hex: [true]](#hex--true)
      - [ip: [true]](#ip--true)
      - [ip4: [true]](#ip4--true)
      - [ip6: [true]](#ip6--true)
      - [isbn: [true]](#isbn--true)
      - [isin: [true]](#isin--true)
      - [iso8601: [true]](#iso8601--true)
      - [in: [Array]](#in--array)
      - [notIn: [Array]](#notin--array)
      - [int: [true|{min: 0, max: 10}]](#int--truemin-0-max-10)
      - [length: [{min: 0, max: 10}]](#length--min-0-max-10)
      - [lowercase: [true]](#lowercase--true)
      - [uppercase: [true]](#uppercase--true)
      - [mobile: [true|locale]](#mobile--truelocale)
      - [mongoId: [true]](#mongoid--true)
      - [multibyte: [true]](#multibyte--true)
      - [url: [true|options]](#url--trueoptions)
      - [field: [true]](#field--true)
      - [field: [true]](#field--true-1)
      - [image: [true]](#image--true)
      - [startWith: [String]](#startwith--string)
      - [endWith: [String]](#endwith--string)
      - [string: [true]](#string--true)
      - [array: [true]](#array--true)
      - [boolean: [true]](#boolean--true)
      - [object: [true]](#object--true)
      - [regexp: [Regexp]](#regexp--regexp)
      - [issn: [true]](#issn--true)
      - [uuid: [true]](#uuid--true)
      - [md5: [true]](#md5--true)
      - [macAddress: [true]](#macaddress--true)
      - [numeric: [true]](#numeric--true)
      - [dataURI: [true]](#datauri--true)
      - [variableWidth: [true]](#variablewidth--true)

### Useage

```js
import Validator from 'think-validator';

let instance = new Validator(ctx);
let ret = instance.validate(rules, msgs);

```
* `ctx`: the request data.
* `rules`: the validation rules.
* `msgs`: the custom error messages.

If valid ok, the `ret` is {}, else `ret` is output like {param1: 'error message', ...}.


### Add Custom Valid Method
```
let instance = new Validator(ctx);
instance.add('custom-valid', function(value, options) {
  return value === 'thinkjs';
}, 'this id default error message');
let ret = instance.validate(rules);
```


### Parse Rule's Arguments

You can parse the rule's arguments with ctx before validation.
Just like this to add parse function for custom-valid:

```
let instance = new Validator(ctx);
instance.add('_custom-valid', function(arg, ctx) {
  return newarg
};
```


### Param Validation Config

Validation rules is written in json like this:
```
let rules = {
  id: {
    int: true,
    required: true,
    trim: true,
    default: 12,
    method: 'get'
  }
}
```
Param is not `required` by default, so if you need param not empty, you should assign `required` with `true`.
If you want `trim` the space for the param you should assign `trim` with `true`,for example, if the id's value is '12   ' and `trim: true` then `id` is an integer, but it won't with `trim: false`.
With `default` you can give the param default value, if param's value is true empty, it will be the default value.
With `method` you can assign in which type we get the param, `get`,`post`,`file` is supported.



### Supported Data Type

The supported data types include boolean,string,int,float,array,object. And the default type is string.
When valid type `int` is true, if pass the validation the param's value will auto convert into integer.
When valid type `float` is true, if pass the validation the param's value will auto convert into float.
When valid type `boolean` is true, `['yes', 'on', '1', 'true', true]` will auto convert into `true`, and others to `false`.
When valid type `array` is true and param's value is not array, it will convert param's value to `[param's value]`.


### Nested Validation Type

Nested validation will valid the item in array or in object. But it only support the first layer child validation.

#### Nested array valid, eg

```
let rules = {
  array: true,
  children: {
    int: true,
    trim: true,
    required: true
  }
}
```

#### Nested object valid, eg

```
let rules = {
  object: true,
  children: {
    int: true,
    trim: true,
    required: true
  }
}
```

### Custom Error Message

```
let rules = {
  id: {
    int: true
  }
}
```
It will find the matched error message with valid failed by order:

* 1. 'int': 'error message'
* 2. 'id': 'error message'
* 3. 'id': {
     int: 'error message'
    }

when the rule is object nested,

* 4. 'param': {
      'param1[,param2]': 'error message'
   }
* 5. 'param': {
      'param1[,param2]': {
        int: 'error message'
      }
   }

And the priority is 5 > 4 > 3 > 2 > 1.


### Supported Validation Type

####  requiredIf:  [Array]
If the `requiredIf`'s argument's first item has value in request data, let the first item is the value(in request data).
If the `requiredIf`'s argument's first item does not have value in request data, let the first item keep intact.
If the first item is in the last items, the param's value is required.

####  requiredNotIf:  [Array]
If the `requiredNotIf`'s argument's first item has value in request data, let the first item is the value(in request data).
If the `requiredNotIf`'s argument's first item does not have value in request data, let the first item keep intact.
If the first item is not in the last items, the param's value is required.

####  requiredWith:  [Array]
When some items of `requiredWith`'s arugument is not true empty in request data, the param's value is required.

####  requiredWithAll:  [Array]
When all items of `requiredWithAll`'s arugument is not true empty in request data, the param's value is required.

####  requiredWithOut:  [Array]
When some items of `requiredWithOut`'s arugument is true empty in request data, the param's value is required.

####  requiredWithOutAll:  [Array]
When all items of `requiredWithOutAll`'s arugument is true empty in request data, the param's value is required.

####  contains:  [String]
If the `contains`'s argument has value in request data, the rule will check if aram's value contains the value(in request data).
If the `contains`'s argument does not have value in request data, the rule will check if param's value contains `equals`'s argument.

####  equals:  [String]
If the `equals`'s argument has value in request data, the rule will check if the value(in request data) equal param's value.
If the `equals`'s argument does not have value in request data, the rule will check if `equals`'s argument equal param's value.

####  different:  [String]
If the `equals`'s argument has value in request data, the rule will check if the value(in request data) not equal param's value.
If the `equals`'s argument does not have value in request data, the rule will check if `equals`'s argument not equal param's value.

####  before:  [true|date format string]
Check if param's value before the giving date.
If `before` = true, the giving date is `now`.

####  after:  [true|date format string]
Check if param's value after the giving date.
If `after` = true, the giving date is `now`.

####  alpha:  [true]
Check if param's value contains only letters (a-zA-Z).

####  alphaDash:  [true]
Check if param's value contains only letters (a-zA-Z_).

####  alphaNumeric:  [true]
Check if param's value contains only letters, numbers.

####  alphaNumericDash:  [true]
Check if param's value contains only letters, numbers and _.

####  ascii:  [true]
Check if param's value is ascii.

####  base64:  [true]
Check if param's value is base64.

####  byteLength:  [{min: 0, max: 10}]
Check if param's value length(in bytes) falls in a range.

####  creditCard:  [true]
Check if param's value is creditCard.

####  currency:  [true|options]
Check if param's value is currency format.
`options` please see [validator.js](https://github.com/chriso/validator.js).

####  date:  [true]
Check if param's value is date format.

####  decimal:  [true]
Check if param's value represents a decimal number, such as 0.1, .3, 1.1, 1.00003, 4.0, etc.

####  divisibleBy:  [number]
Check if param's value is a number that's divisible by the giving one.

####  email:  [true|options]
Check if param's value is an email.
`options` please see [validator.js](https://github.com/chriso/validator.js).

####  fqdn:  [true|options]
Check if param's value is fqdn.
`options` please see [validator.js](https://github.com/chriso/validator.js).

####  float:  [true|{min: 0, max: 10}]
If `float` = true, check if param's value is a float.
If `float` = {min: 0, max: 10}, check if param's value is a float between `min` and 'max'.

####  fullWidth:  [true]
Check if param's value contains any full-width chars.

####  halfWidth:  [true]
Check if param's value contains any half-width chars.

####  hexColor:  [true]
Check if param's value is a hexadecimal color.

####  hex:  [true]
Check if param's value is a hexadecimal number.

####  ip:  [true]
Check if param's value is an ip4 or ip6.

####  ip4:  [true]
Check if param's value is an ip4.

####  ip6:  [true]
Check if param's value is an ip6.

####  isbn:  [true]
Check if param's value is an isbn.

####  isin:  [true]
Check if param's value is an ISIN (stock/security identifier).

####  iso8601:  [true]
Check if param's value is a valid ISO 8601 date.

####  in:  [Array]
Check if param's value is in a array of allowed values.

####  notIn:  [Array]
Check if param's value is not in a array of allowed values.

####  int:  [true|{min: 0, max: 10}]
If `int` = true, check if param's value is an integer.
If `int` = {min: 0, max: 10}, check if param's value is an integer between `min` and 'max'.

####  length:  [{min: 0, max: 10}]
Check if param's value length falls in a range.

####  lowercase:  [true]
Check if param's value is lowercase.

####  uppercase:  [true]
Check if param's value is uppercase.

####  mobile:  [true|locale]
Check if param's value is a mobile phone number.
`locale` please see [validator.js](https://github.com/chriso/validator.js).

####  mongoId:  [true]
Check if param's value is a valid hex-encoded representation of a MongoDB ObjectId.

####  multibyte:  [true]
Check if param's value contains one or more multibyte chars.

####  url:  [true|options]
Check if param's value is an URL.
`options` please see [validator.js](https://github.com/chriso/validator.js).

####  field:  [true]
Check if param's value is a sql order string.

####  field:  [true]
Check if param's value is a sql field string.

####  image:  [true]
Check if param's value is an image file.

####  startWith:  [String]
Check if param's value start with the giving string.

####  endWith:  [String]
Check if param's value end with the giving string.

####  string:  [true]
Check if param's value is string.

####  array:  [true]
Check if param's value is array.
If param's value is not array, it will convert to `[param's value]`.

####  boolean:  [true]
Check if param's value is boolean.
If param's value is one of ['yes', 'on', '1', 'true', true], it will convert to `true`, and others will convert to `false`.

####  object:  [true]
Check if param's value is object.

####  regexp:  [Regexp]
Check if param's value match the regexp.

####  issn:  [true]
Check if param's value is an ISSN.

####  uuid:  [true]
Check if param's value is a UUID (version 3, 4 or 5).

####  md5:  [true]
Check if param's value is md5.

####  macAddress:  [true]
Check if param's value is macaddress.

####  numeric:  [true]
Check if param's value contains only numbers.

####  dataURI:  [true]
Check if param's value is a data uri format.

####  variableWidth:  [true]
Check if param's value contains a mixture of full and half-width chars.
