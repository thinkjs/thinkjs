/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-05-14 15:10:55
*/
const validator = require('./rules.js');
const helper = require('think-helper');
const ARRAY_SP = '__array__', OBJECT_SP = '__object__';
const METHOD_MAP = {
  get: 'param',
  post: 'post',
  file: 'file'
};

class Validator {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctxQuery = {};
    this.requiredValidNames = [
      'required',
      'requiredIf',
      'requiredNotIf',
      'requiredWith',
      'requiredWithAll',
      'requiredWithOut',
      'requiredWithOutAll'
    ];
    this.skippedValidNames = ['value', 'default', 'trim', 'method'].concat(this.requiredValidNames);
    this.basicType = ['int', 'string', 'float', 'array', 'object', 'boolean'];
  }

  /**
   * format argName nested array and object
   * @param  {String} argName [description]
   * @return {String}          [description]
   */
  _formatNestedRuleName(argName) {
    let newRuleName = argName;
    if(newRuleName.indexOf(ARRAY_SP) > -1) {
      let tmpRuleName = newRuleName.split(ARRAY_SP);
      newRuleName = tmpRuleName[0] + '[' + tmpRuleName[1]+ ']';
    }
    if(newRuleName.indexOf(OBJECT_SP) > -1) {
      let tmpRuleName = newRuleName.split(OBJECT_SP);
      newRuleName = tmpRuleName[0] + '.' + tmpRuleName[1];
    }
    return newRuleName;
  }

  /**
   * get error message
   * @param  {String} argName        [description]
   * @param  {Object} rule            [description]
   * @param  {String} validName       [description]
   * @param  {Mixed} parsedValidArgs [description]
   * @param  {Object} msgs            [description]
   * @return {String}                 [description]
   */
  _getErrorMessage(argName, rule, validName, parsedValidArgs, msgs) {
    let errMsg = validator.errors[validName];
    if(helper.isObject(msgs)) {
      // eg int: 'error message'
      errMsg = msgs[validName];

      let msgs_RuleName = msgs[argName];
      // eg name: 'error message'
      if(msgs_RuleName && helper.isString(msgs_RuleName)) {
        errMsg = msgs_RuleName;
      }

      // eg name: {int: 'error message'}
      if(msgs_RuleName && helper.isObject(msgs_RuleName) && helper.isString(msgs_RuleName[validName])) {
        errMsg = msgs_RuleName[validName];
      }

      // eg name: {name1,name2: 'error message'}
      // eg name: {name1,name2: {int: 'error message'}}
      if(argName.indexOf(OBJECT_SP) > -1) {
        let parsedResult = argName.split(OBJECT_SP);
        argName = parsedResult[0];
        let msgs_RuleName = msgs[argName];
        let subRuleName = parsedResult[1];
        if(msgs_RuleName) {
          for(let i in msgs_RuleName) {
            if(i.split(',').indexOf(subRuleName) > -1){
              if(helper.isObject(msgs_RuleName[i])){
                errMsg = msgs_RuleName[i][validName];
              }else {
                errMsg = msgs_RuleName[i]
              }
            }
          }
        }
      }
    }

    // format error message rule name
    let originRuleName = this._formatNestedRuleName(argName);

    // set defalut error message
    if(!errMsg) {
      return originRuleName + ' valid failed';
    }

    // argName validName validArgs parsedValidArgs
    let validArgs = rule[argName];
    let lastMsg = errMsg.replace('{name}', originRuleName)
      .replace('{args}', JSON.stringify(validArgs))
      .replace('{pargs}', JSON.stringify(parsedValidArgs));
    return lastMsg;
  }

  /**
   * parse valid args by _validName method
   * @param  {String} validName [description]
   * @param  {Mixed} ruleArgs  [description]
   * @return {Mixed}           [description]
   */
  _parseValidArgs(validName, rule) {
    let ruleArgs = rule[validName];
    let pfn = validator['_' + validName];
    if(helper.isFunction(pfn)){
      // support rewrite back, so just pass this.ctxQuery without clone
      ruleArgs = pfn(ruleArgs, this.ctxQuery);
    }
    return ruleArgs;
  }

  /**
   * convert value by value type
   * @param  {String} argName [description]
   * @param  {Object} rule     [description]
   * @return {Mixed}          [description]
   */
  _convertParamValue(argName, rule) {
    let queryMethod = this._getQueryMethod(rule);
    if((rule.int || rule.float || rule.numeric) && queryMethod) {
      if(argName.indexOf(ARRAY_SP) > -1) {
        let parsedRuleName = argName.split(ARRAY_SP);
        this.ctxQuery[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      }
      else if (argName.indexOf(OBJECT_SP) > -1) {
        let parsedRuleName = argName.split(OBJECT_SP);
        this.ctxQuery[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      }
      else {
        this.ctxQuery[argName] = parseFloat(rule.value);
      }
    }
  }

  /**
   * check the value if is required
   * @param  {Object} rule [description]
   * @return {Boolean}      [description]
   */
  _checkRequired(rule) {
    let isRequired = false;
    for(let i = 0; i <= this.requiredValidNames.length; i++) {
      let validName = this.requiredValidNames[i];
      if(rule[validName]) {
        let fn = validator[validName];
        let parsedValidArgs = this._parseValidArgs(validName, rule);
        if(fn(rule.value, parsedValidArgs)) {
          isRequired = true;
          break;
        };
      }
    }
    return isRequired;
  }

  /**
   * get ctx's method which to get or set the query
   * @param  {Object} rule [description]
   * @return {String}      [methodName]
   */
  _getQueryMethod(rule) {
    let methodName;
    let ctxMethod = this.ctx.method.toLowerCase();
    if(typeof rule.method === 'undefined' || rule.method === '') {
      methodName = ctxMethod;
    }else {
      methodName = rule.method.toLowerCase();
    }
    return METHOD_MAP[methodName];
  }

  /**
   * pre treat rule.value & handle the nested array and object valid
   * @param  {Object} rules [description]
   * @return {Object}       [description]
   */
  _preTreatRules(rules) {
    rules = helper.extend({}, rules);

    // to keep the nested rules split from the array or object
    let childRules = {};

    for(let argName in rules) {
      let rule = rules[argName];

      // basic type check, only one basic type is legal(ok)
      let containTypeNum = this.basicType.reduce((acc, val) => {
        val = rule[val] ? 1 : 0;
        return acc + val;
      }, 0);

      if(containTypeNum > 1) {
        throw new Error('Any rule can\'t contains one more basic type, the param you are validing is ' + argName);
      }

      // set this.ctxQuery
      let queryMethod = this._getQueryMethod(rule);
      this.ctxQuery = this.ctx[queryMethod]();

      // set related value on ctx to rule.value first
      if(!rule.value) {
        rule.value = this.ctxQuery[argName];
      }

      // set default, when rule.value is undefined
      if(typeof(rule.value) === 'undefined' && !helper.isTrueEmpty(rule.default)){
        rule.value = rule.default;
      }

      // trim rule.value, when trim is true
      if(rule.trim && rule.value && rule.value.trim){
        rule.value = rule.value.trim();
      }

      // array convert
      if(rule.array && !helper.isArray(rule.value)) {
        rule.value = [rule.value]
      }

      // boolean convert
      if(rule.boolean) {
        rule.value = ['yes', 'on', '1', 'true', true].indexOf(rule.value) > -1;
      }

      // write back rule.value to ctx, nested children wait for next round to handle
      if(typeof rule.value !== 'undefined' && argName.indexOf(ARRAY_SP) === -1 & argName.indexOf(OBJECT_SP) === -1 && queryMethod){
        this.ctxQuery[argName] = rule.value;
      }

      // array & object children split and set the value
      if(rule.children) {
        let ruleValue = rule.value;
        let ruleChildren = rules[argName].children;
        // delete the argName, like [array|object]: true
        delete rules[argName];

        if(rule.array) {
          for(let i = 0; i < ruleValue.length; i++) {
            let tmpRuleName = argName + ARRAY_SP + i;
            childRules[tmpRuleName] = helper.extend({}, ruleChildren, {value: ruleValue[i]});
          }
        }else {
          for(let key in ruleValue) {
            let tmpRuleName = argName + OBJECT_SP + key;
            childRules[tmpRuleName] = helper.extend({}, ruleChildren, {value: ruleValue[key]});
          }
        }
      }
    }
    let parsedChildRules = {};
    if(Object.keys(childRules).length > 0) {
      parsedChildRules = this._preTreatRules(childRules);
    }
    return helper.extend({}, rules, parsedChildRules);
  }

  /**
   * add custom valid method
   * @param {String}   validName [description]
   * @param {Function} callback  [description]
   * @param {String}   msg       [description]
   */
  add(validName, callback, msg) {
    validator[validName] = callback;
    validator.errors[validName] = msg;
  }

  /**
   * validate rules
   * @param  {Object} rules [description]
   * @param  {Object} msgs  [custom errors]
   * @return {Object}       {argName: errorMessage}
   */
  validate(rules, msgs) {
    let ret = {};
    let parsedRules = this._preTreatRules(rules);

    outerLoop:
    for(let argName in parsedRules){
      let rule = parsedRules[argName];

      // required check
      let isRequired = this._checkRequired(rule);
      if(isRequired && helper.isTrueEmpty(rule.value)) {
        let validName = 'required';
        let parsedValidArgs = this._parseValidArgs(validName, rule);
        let errMsg = this._getErrorMessage(argName, rule, validName, parsedValidArgs, msgs);
        ret[argName] = errMsg;
        continue;
      }else if(!isRequired && helper.isTrueEmpty(rule.value)){
        continue;
      }

      // valid check
      for(let validName in rule){
        if(this.skippedValidNames.indexOf(validName) >= 0) {
          continue;
        }

        // check if the valid method is exsit
        let fn = validator[validName];
        if (!helper.isFunction(fn)) {
          throw new Error(validName + ' valid method is not been configed');
        }

        // get parsed valid options
        let parsedValidArgs = this._parseValidArgs(validName, rule);

        let result = fn(rule.value, parsedValidArgs);
        if(!result){
          let errMsg = this._getErrorMessage(argName, rule, validName, parsedValidArgs, msgs);

          // format error message's rule name
          let newRuleName = this._formatNestedRuleName(argName);
          ret[newRuleName] = errMsg;
          continue outerLoop;
        }else {
          // if this is no error, convert the value
          this._convertParamValue(argName, rule);
        }
      }
    }
    return ret;
  }
}

module.exports = Validator;
