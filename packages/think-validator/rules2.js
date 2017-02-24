/*
* @Author: lushijie
* @Date:   2017-02-24 14:48:45
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-24 15:24:04
*/
const net = require('net');
const thinkHelper = require('think-helper');
//https://github.com/chriso/validator.js
const validator = require('validator');

/**
 * Validator
 * @type {Object}
 */
let Validator = {};

/**
 * check if the string is an integer.
 * options is an object which can contain the keys min and/or max to check the integer is within boundaries (e.g. { min: 10, max: 99 }).
 * @type {Boolean}
 */
Validator.int = (value, min, max) => {
  if(!value){
    return true;
  }
  let options = {};
  if(min){
    options.min = min | 0;
  }
  if(max){
    options.max = max | 0;
  }
  return !isNaN(value) && validator.isInt(value, options);
};

Validator.object = value => {
  return thinkHelper.isObject(value);
};


module.exports = Validator;
