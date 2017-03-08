/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-08 16:49:23
*/
const validator = require('./rules.js');
const helper = require('think-helper');
const ARRAY_SP = '_array_', OBJECT_SP = '_object_';
const METHOD_GET = 'get';

class Validator {
  constructor(ctx) {
    this.ctx = ctx || {};
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
   * format ruleName nested array and object
   * @param  {String} ruleName [description]
   * @return {String}          [description]
   */
  _formatNestedRuleName(ruleName) {
    let newRuleName = ruleName;
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
   * @param  {String} ruleName        [description]
   * @param  {Object} rule            [description]
   * @param  {String} validName       [description]
   * @param  {Mixed} parsedValidArgs [description]
   * @param  {Object} msgs            [description]
   * @return {String}                 [description]
   */
  _getErrorMessage(ruleName, rule, validName, parsedValidArgs, msgs) {
    let errMsg = validator.errors[validName];
    if(helper.isObject(msgs)) {
      // int: 'error'
      errMsg = msgs[validName];

      let msgs_RuleName = msgs[ruleName];
      // name: 'error'
      if(msgs_RuleName && helper.isString(msgs_RuleName)) {
        errMsg = msgs_RuleName;
      }

      // name: {int: 'error'}
      if(msgs_RuleName && helper.isObject(msgs_RuleName) && helper.isString(msgs_RuleName[validName])) {
        errMsg = msgs_RuleName[validName];
      }

      // name: {name1,name2: 'error'}
      // name: {name1,name2: {int: 'error'}}
      if(ruleName.indexOf(OBJECT_SP) > -1) {
        let parsedResult = ruleName.split(OBJECT_SP);
        ruleName = parsedResult[0];
        let msgs_RuleName = msgs[ruleName];
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
    let originRuleName = this._formatNestedRuleName(ruleName);

    // set defalut error message
    if(!errMsg) {
      return originRuleName + ' valid failed';
    }

    // ruleName validName validArgs parsedValidArgs
    // itemValue = _convertParamValue(ruleName, rule)
    let validArgs = rule[ruleName];
    return errMsg.replace('{name}', originRuleName)
                 .replace('{args}', JSON.stringify(validArgs))
                 .replace('{pargs}', JSON.stringify(parsedValidArgs));
  }

  /**
   * parse valid args by _validName method
   * @param  {String} validName [description]
   * @param  {Mixed} ruleArgs  [description]
   * @return {Mixed}           [description]
   */
  _parseValidArgs(validName, rule) {
    let method = rule.method || this.ctx.method;
    let ruleArgs = rule[validName];
    let pfn = validator['_' + validName];
    if(helper.isFunction(pfn)){
      // this.ctx in this method is only read
      ruleArgs = pfn(ruleArgs, Object.assign({}, this.ctx[method]));
    }
    return ruleArgs;
  }

  /**
   * convert value by value type
   * @param  {String} ruleName [description]
   * @param  {Object} rule     [description]
   * @return {Mixed}          [description]
   */
  _convertParamValue(ruleName, rule) {
    let method = rule.method || this.ctx.method || METHOD_GET;
    if(rule.int || rule.float || rule.numeric) {
      if(ruleName.indexOf(ARRAY_SP) > -1) {
        let parsedRuleName = ruleName.split(ARRAY_SP);
        this.ctx[method][parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      }
      else if (ruleName.indexOf(OBJECT_SP) > -1) {
        let parsedRuleName = ruleName.split(OBJECT_SP);
        this.ctx[method][parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      }
      else {
        this.ctx[method][ruleName] = parseFloat(rule.value);
      }
      return parseFloat(rule.value);
    }
    return rule.value;
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
   * pre treat rule.value & handle the nested array and object valid
   * @param  {Object} rules [description]
   * @return {Object}       [description]
   */
  _preTreatRules(rules) {
    rules = Object.assign({}, rules);

    // to keep the nested rules split from the array or object
    let childRules = {};

    for(let ruleName in rules) {
      let rule = rules[ruleName];
      let method = rule.method || this.ctx.method || METHOD_GET;

      // basic type check
      let containTypeNum = this.basicType.reduce((acc, val) => {
        val = rule[val] ? 1 : 0;
        return acc + val;
      }, 0);

      if(containTypeNum > 1) {
        throw new Error('Any rule can\'t contains one more basic type, the param you are validing is ' + ruleName);
      }

      // array & object children with value, skip this operator
      if(!rule.value && this.ctx[method]) {
        // rule.value = this.ctx[ruleName];
        rule.value = this.ctx[method][ruleName];
      }

      // set default
      if(typeof(rule.value) === 'undefined' && !helper.isTrueEmpty(rule.default)){
        rule.value = rule.default;
      }

      // trim rule value if trim is true
      if(rule.trim && rule.value && rule.value.trim){
        rule.value = rule.value.trim();
      }

      // array convert in enter
      if(rule.array && !helper.isArray(rule.value)) {
        rule.value = [rule.value]
      }

      // boolean convert in enter
      if(rule.boolean) {
        rule.value = ['yes', 'on', '1', 'true', true].indexOf(rule.value) > -1;
      }

      // write back to ctx, nested children don't need
      if(typeof rule.value !== 'undefined' && ruleName.indexOf(ARRAY_SP) === -1 & ruleName.indexOf(OBJECT_SP) === -1){
        this.ctx[method] = this.ctx[method] || {};
        this.ctx[method][ruleName] = rule.value;
      }

      // array & object children split and give the value
      if(rule.children) {
        let ruleValue = rule.value;
        let ruleChildren = rules[ruleName].children;
        delete rules[ruleName];

        if(rule.array) {
          for(let i = 0; i < ruleValue.length; i++) {
            let tmpRuleName = ruleName + ARRAY_SP + i;
            childRules[tmpRuleName] = Object.assign({}, ruleChildren, {value: ruleValue[i]});
          }
        }else {
          for(let key in ruleValue) {
            let tmpRuleName = ruleName + OBJECT_SP + key;
            childRules[tmpRuleName] = Object.assign({}, ruleChildren, {value: ruleValue[key]});
          }
        }
      }

    }

    return ({childRules, rules});
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
   * @return {Object}       {ruleName: errorMessage}
   */
  validate(rules, msgs) {
    let ret = {};
    let parsedResult = this._preTreatRules(rules);
    let parsedRules = parsedResult.rules;
    let parsedChildRules = {};
    if(Object.keys(parsedResult.childRules).length > 0) {
      parsedChildRules = this._preTreatRules(parsedResult.childRules).rules;
    }
    parsedRules = Object.assign({}, parsedRules, parsedChildRules);

    outerLoop:
    for(let ruleName in parsedRules){
      let rule = parsedRules[ruleName];

      // required check
      let isRequired = this._checkRequired(rule);
      if(isRequired && helper.isTrueEmpty(rule.value)) {
        let validName = 'required';
        let parsedValidArgs = this._parseValidArgs(validName, rule);
        let errMsg = this._getErrorMessage(ruleName, rule, validName, parsedValidArgs, msgs);
        ret[ruleName] = errMsg;
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
          let errMsg = this._getErrorMessage(ruleName, rule, validName, parsedValidArgs, msgs);

          // format error message's rule name
          let newRuleName = this._formatNestedRuleName(ruleName);
          ret[newRuleName] = errMsg;
          continue outerLoop;
        }else {
          this._convertParamValue(ruleName, rule);
        }
      }
    }

    return ret;
  }
}

module.exports = Validator;
