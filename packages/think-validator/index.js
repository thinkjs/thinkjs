/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-24 21:02:37
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


let _getValidateRuleArgs = (type, rule, requestData) => {
  let args = rule[type];
  if(thinkHelper.isBoolean(args)){
    args = [];
  }
  else if(!thinkHelper.isArray(args)){
    args = [args];
  }

  //parse args by request data
  let parseArgs = Validator[`_${type}`];
  if(thinkHelper.isFunction(parseArgs)){
    args = parseArgs(args, requestData);
  }

  return args;
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
// let _parseValue = (value, item) => {
//   if(item.int || item.type === 'int'){
//     return parseInt(value);
//   }else if(item.float || item.type === 'float'){
//     return parseFloat(value);
//   }else if(item.boolean || item.type === 'boolean'){
//     return _toBoolean(value);
//   }
//   return value;
// };

/**
 * get all rule values, for default function to get value
 * @param  {Object} rules []
 * @return {Object}       []
 */
let _getRuleValues = rules => {
  let ret = {};
  for(let name in rules){
    // ret[name] = rules[name].value;
    ret[name] = _getValidStyleValue(rules[name]);
  }
  return ret;
};

/**
 * format the rule value for Validator
 * @param  {Object} item   []
 * @param  {Object} values []
 * @return {Mixed}        []
 */
let _getValidStyleValue2 = (rule/*, values, parse*/) => {
  let ruleValue = rule.value;

  // set default value
  let _default = rule.default;
  if(!ruleValue && !thinkHelper.isTrueEmpty(_default)){
    ruleValue = rule.default;
  }

  // ruleValue == function
  // if(thinkHelper.isFunction(ruleValue)){
  //   ruleValue = ruleValue.call(values);
  // }

  // trim value
  if(rule.trim && ruleValue && ruleValue.trim){
    ruleValue = ruleValue.trim();
  }

  // make data to array when type is array
  if(rule.value && rule.array && !thinkHelper.isArray(rule.value)){
    if(thinkHelper.isString(ruleValue)){
      try{
        ruleValue = JSON.parse(ruleValue);
      }catch(e){
        ruleValue = ruleValue.split(/\s*,\s*/);
      }
    }else{
      ruleValue = [ruleValue];
    }
  }

  // make data to object when type is object
  else if(rule.value && rule.object && thinkHelper.isString(ruleValue)){
    try{
      ruleValue = JSON.parse(ruleValue);
    }catch(e){
      ruleValue = {};
    }
  }

  // make data to boolean when type is boolean
  else if(rule.boolean){
    ruleValue = _toBoolean(ruleValue);
  }

  // other to string
  else {
    try{
      ruleValue = JSON.stringify(ruleValue);
    }catch(e){
      ruleValue += '';
    }
  }

  //parse value
  // if(parse){
  //   if(rule.array){
  //     ruleValue = ruleValue.map(it => {
  //       return _parseValue(it, rule);
  //     });
  //   }else{
  //     ruleValue = _parseValue(ruleValue, rule);
  //   }
  // }

  return ruleValue;
};


/**
 * format the rule value for Validator
 * @param  {Object} item   []
 * @param  {Object} values []
 * @return {Mixed}        []
 */
let _getValidStyleValue = (type, value/*, _default, trim*/) => {
  //let ruleValue = value;

  // set default value
  // if(!value && !thinkHelper.isTrueEmpty(_default)){
  //   value = _default;
  // }

  // // trim value
  // if(trim && value && value.trim){
  //   value = value.trim();
  // }

  // make data to array when type is array
  if(value && type === 'array' && !thinkHelper.isArray(value)){
    if(thinkHelper.isString(value)){
      try{
        value = JSON.parse(value);
      }catch(e){
        value = value.split(/\s*,\s*/);
      }
    }else{
      value = [value];
    }
  }

  // make data to object when type is object
  else if(value && type === 'object' && thinkHelper.isString(value)){
    try{
      value = JSON.parse(value);
    }catch(e){
      value = {};
    }
  }

  // make data to boolean when type is boolean
  else if(type === 'boolean'){
    value = _toBoolean(value);
  }

  // other to string
  else {
    try{
      value = JSON.stringify(value);
    }catch(e){
      value += '';
    }
  }

  return value;
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
  let rules = name, msgs = callback;
  return Validate.exec(rules, msgs);
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
    let requestData = rules['_data'] || {};
    // _data is request data
    if(name === '_data') {
      continue;
    }

    let rule = rules[name];

    // when rule.value is undefined , set rule.value = rule.default
    if(typeof(rule.value) === 'undefined' && !thinkHelper.isTrueEmpty(rule.default)){
      rule.value = rule.default;
    }

    // trim rule value
    if(rule.trim && rule.value && rule.value.trim){
      rule.value = rule.value.trim();
    }

    console.log('原始规则-->',rule)
    // let ruleValue = _getValidStyleValue(rule, values);



    for(let vtype in rule){
      // attr don't need valid
      if(vtype === 'value' || vtype === 'default' || vtype === 'trim'){
        continue;
      }

      // let ruleValue;
      // if(vtype !== 'required') {
      //let ruleValue = _getValidStyleValue(vtype, rule.value);
      // }
      console.log('验证类型-->', vtype);
      let ruleValue = _getValidStyleValue(vtype, rule.value);
      console.log('转化之后的-->', ruleValue);


      let fn = Validator[vtype];
      if (!thinkHelper.isFunction(fn)) {
        throw new Error(vtype + ' 校验规则未配置');
      }

      //if has array rule, then foreach check value for every rule
      if(rule.array && vtype !== 'array' && thinkHelper.isArray(ruleValue)){

        let flag = ruleValue.some(ivalue => {
          console.log('-------',ivalue);
          ivalue =_getValidStyleValue(rule);
          console.log('-------',ivalue);
          let args = _getValidateRuleArgs(vtype, rule, requestData);
          if(!fn(ivalue, ...args)){
            //let msg = _getValidateErrorMsg(vtype, name, ivalue, args, msgs);
            //ret[name] = msg;
            console.log(12312332);
            ret[name] = '校验不通过';
            return true;
          }
        });
        // 如果一个验证失败则终止后续的验证
        if(flag){
          break;
        }
      }else{
        let args = _getValidateRuleArgs(vtype, rule, requestData);
        //console.log('ruleValue-->', ruleValue);
        if(!fn(ruleValue, ...args)){
          //let msg = _getValidateErrorMsg(vtype, name, ruleValue, args, msgs);
          //ret[name] = msg;
          ret[name] = '校验不通过';
          break;
        }
      }
    }
  }
  console.log(ret);
  return ret;
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
    let itemValue = _getValidStyleValue(rules[name], values, true);
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


// console.log(Validate('int')('123')) // true
// console.log(Validate('int')(123))   // This library (validator.js) validates strings only

let rules =  {
  // name: {
  //   value: [1, 2, 3],
  //   required: true,
  //   length: [4, 20],
  //   email: true
  // },
  pwd: {
    array: true,
    value: "[1, 5, 3]",
    int: true
    //requiredWith: ['name', 'sex'],
  },
  // confirm_pwd: {
  //   value: '12345678',
  //   required: true,
  //   equals: 'pwd'
  // }
  _data: {
    //name: 'lushijie',
    //sex: 'male'
  }
}

Validate(rules);


module.exports = Validate;
