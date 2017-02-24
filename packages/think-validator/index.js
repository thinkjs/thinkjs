/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-22 11:23:08
*/
const Validator = require('./rules.js');
const thinkHelper = require('think-helper');
const util = require('util');
const ERRMSG = require('./error.js');

//get error message
let _getValidateErrorMsg = (type, name, value, args, msgs) => {
  let key = `validate_${type}`;
  let keyWithName = `${key}_${name}`;
  let msg = msgs[keyWithName];
  // if(!msg && think.locale(keyWithName) !== keyWithName){
  //   msg = think.locale(keyWithName);
  // }
  if(!msg && ERRMSG[keyWithName] !== keyWithName){
    msg = ERRMSG[keyWithName];
  }
  msg = msg || msgs[key];
  // if(!msg && think.locale(key) !== key){
  //   msg = think.locale(key);
  // }
  if(!msg && ERRMSG[key] !== key){
    msg = ERRMSG[key];
  }
  // msg = msg || think.locale('PARAMS_NOT_VALID');
  msg = msg || ERRMSG['PARAMS_NOT_VALID'];
  // return msg.replace('{name}', name).replace('{value}', value).replace('{args}', args.join(','));
  return msg.replace('{name}', name).replace('{value}', value).replace('{args}', args.join(','));
  //return 'ERROR MSG';
};

let _getValidateRuleFnAndArgs = (type, args, rules) => {
  let fn = Validator[type];
  if (!thinkHelper.isFunction(fn)) {
    // throw new Error(think.locale('CONFIG_NOT_FUNCTION', `${type} type`));
    throw new Error(util.format('config `%s` is not a function', `${type} type`));
  }
  if(thinkHelper.isBoolean(args)){
    args = [];
  }else if(!thinkHelper.isArray(args)){
    args = [args];
  }
  let parseArgs = Validator[`_${type}`];
  //parse args
  if(thinkHelper.isFunction(parseArgs)){
    args = parseArgs(args, rules);
  }
  return {fn, args};
};

/**
 * get all rule values, for default function to get value
 * @param  {Object} rules []
 * @return {Object}       []
 */
let _getRuleValues = rules => {
  let ret = {};
  for(let name in rules){
    ret[name] = rules[name].value;
  }
  return ret;
};

/**
 * to boolean
 * @param  {Mixed} value []
 * @return {Boolean}       []
 */
let _toBoolean = value => {
  return ['yes', 'on', '1', 'true', true].indexOf(value) > -1;
};

/**
 * parse value
 * @param  {Mixed} value []
 * @param  {Object} item  []
 * @return {Mixed}       []
 */
let _parseValue = (value, item) => {
  if(item.int || item.type === 'int'){
    return parseInt(value);
  }else if(item.float || item.type === 'float'){
    return parseFloat(value);
  }else if(item.boolean || item.type === 'boolean'){
    return _toBoolean(value);
  }
  return value;
};
/**
 * get item value
 * @param  {Object} item   []
 * @param  {Object} values []
 * @return {Mixed}        []
 */
let _getItemValue = (item, values, parse) => {
  //get item value
  //avoid default is undefined, but check type is string
  let itemValue = item.value;
  //trim value
  if(item.trim && itemValue && itemValue.trim){
    itemValue = itemValue.trim();
  }
  let _default = item.default;
  if(!itemValue && !thinkHelper.isTrueEmpty(_default)){
    itemValue = item.default;
  }
  if(thinkHelper.isFunction(itemValue)){
    itemValue = itemValue.call(values);
  }

  //make data to array when type is array
  if(item.value && item.array && !thinkHelper.isArray(item.value)){
    if(thinkHelper.isString(itemValue)){
      try{
        itemValue = JSON.parse(itemValue);
      }catch(e){
        itemValue = itemValue.split(/\s*,\s*/);
      }
    }else{
      itemValue = [itemValue];
    }
  }
  //make data to object when type is object
  else if(item.value && item.object && thinkHelper.isString(itemValue)){
    try{
      itemValue = JSON.parse(itemValue);
    }catch(e){}
  }
  else if(item.boolean){
    itemValue = _toBoolean(itemValue);
  }

  //parse value
  if(parse){
    if(item.array){
      itemValue = itemValue.map(it => {
        return _parseValue(it, item);
      });
    }else{
      itemValue = _parseValue(itemValue, item);
    }
  }

  return itemValue;
};


let Validate = (name, callback) => {
  // register validate callback
  if (thinkHelper.isString(name)) {
    if (thinkHelper.isFunction(callback)) {
      Validator[name] = callback;
      return;
    }
    // get validator callback
    return Validator[name];
  }
  return Validate.exec(name, callback);
};


/**
 * get new values for rules
 * @param  {Object} rules []
 * @return {Object}       []
 */
Validate.values = rules => {
  let ret = {};
  let values = _getRuleValues(rules);
  for(let name in rules){
    let itemValue = _getItemValue(rules[name], values, true);
    ret[name] = itemValue;
  }
  return ret;
};

/**
 * parse string rule to object
 * @param  {String} rule []
 * @return {Object}      []
 */
Validate.parse = rule => {
  let rules = rule.split('|');
  let ret = {};
  rules.forEach(item => {
    item = item.trim();
    if(!item){
      return;
    }
    let pos = item.indexOf(':');
    if(pos > -1){
      let name = item.substr(0, pos);
      let args = item.substr(pos + 1).trim();
      if(args[0] === '{' || args[0] === '['){
        let value = (new Function('', `return ${args}`))();
        args = name === 'default' ? value : [value];
      }else if(name !== 'default'){
        args = args.split(/\s*,\s*/);
      }
      ret[name] = args;
    }else{
      ret[item] = true;
    }
  });
  return ret;
};

/**
 * exec validate
 * @param  {Object} rules []
 * @param  {Object} msgs  []
 * @return {Object}       []
 */
Validate.exec = (rules, msgs = {}) => {
  let ret = {};
  let values = _getRuleValues(rules);

  for(let name in rules){
    let item = rules[name];
    let itemValue = _getItemValue(item, values);
    for(let vtype in item){
      if(vtype === 'value' || vtype === 'default' || vtype === 'trim'){
        continue;
      }
      //if has array rule, then foreach check value for every rule
      if(item.array && vtype !== 'array' && thinkHelper.isArray(itemValue)){
        let flag = itemValue.some(ivalue => {
          let {fn, args} = _getValidateRuleFnAndArgs(vtype, item[vtype], rules);
          let result = fn(ivalue, ...args);
          if(!result){
            let msg = _getValidateErrorMsg(vtype, name, ivalue, args, msgs);
            ret[name] = msg;
            return true;
          }
        });
        if(flag){
          break;
        }
      }else{
        let {fn, args} = _getValidateRuleFnAndArgs(vtype, item[vtype], rules);
        let result = fn(itemValue, ...args);
        if(!result){
          let msg = _getValidateErrorMsg(vtype, name, itemValue, args, msgs);
          ret[name] = msg;
          break;
        }
      }
    }
  }
  return ret;
};

module.exports = Validate;
