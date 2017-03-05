/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-05 17:34:41
*/
const validator = require('./rules.js');
const helper = require('think-helper');


class Validator {
  constructor(ctx) {
    this.ctx = ctx;
    this.requiredValidNames = [
      'required',
      'requiredIf',
      'requiredNotIf',
      'requiredWith',
      'requiredWithAll',
      'requiredWithOut',
      'requiredWithOutAll'
    ];
    this.skipedValidNames = ['value', 'default', 'trim'].concat(this.requiredValidNames);
  }

  /**
   * get error message
   * @param  {String} ruleName        [description]
   * @param  {Object} rule            [description]
   * @param  {String} validName       [description]
   * @param  {} parsedValidArgs [description]
   * @param  {Object} msgs            [description]
   * @return {}                 [description]
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
      if(ruleName.indexOf('_object_') > -1) {
        let parsedResult = ruleName.split('_object_');
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

    // set defalut error message
    if(!errMsg) {
      return ruleName + ' valid failed';
    }

    // ruleName validName validArgs parsedValidArgs
    // itemValue = _convertParamItemValue(ruleName, rule)
    let validArgs = rule[ruleName];
    return errMsg.replace('{name}', ruleName)
                 .replace('{args}', JSON.stringify(validArgs))
                 .replace('{pargs}', JSON.stringify(parsedValidArgs));
  }

  _parseRuleArgs(validName, ruleArgs) {
    let pfn = validator['_' + validName];
    if(helper.isFunction(pfn)){
      // this.ctx in this method is only read
      ruleArgs = pfn(ruleArgs, Object.assign({}, this.ctx));
    }
    return ruleArgs;
  }

  /**
   * convert value by value type
   * @param  {String} ruleName [description]
   * @param  {Object} rule     [description]
   * @return {}          [description]
   */
  _convertParamItemValue(ruleName, rule) {
    if(rule.int || rule.float || rule.numeric) {
      if(ruleName.indexOf('_array_') > -1) {
        let parsedRuleName = ruleName.split('_array_');
        this.ctx[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      }
      else if (ruleName.indexOf('_object_') > -1) {
        let parsedRuleName = ruleName.split('_object_');
        this.ctx[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      }
      else {
        this.ctx[ruleName] = parseFloat(rule.value);
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
  _checkValueRequired(rule) {
    let isRequired = false;
    for(let i = 0; i <= this.requiredValidNames.length; i++) {
      let validName = this.requiredValidNames[i];
      if(rule[validName]) {
        let fn = validator[validName];
        let parsedValidArgs = this._parseRuleArgs(validName, rule[validName]);
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

      // array & object children with value, skip this operator
      if(!rule.value) {
        rule.value = this.ctx[ruleName];
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

      // write back to ctx
      if(typeof rule.value !== 'undefined'){
        this.ctx[ruleName] = rule.value;
      }

      // array & object children
      if(rule.children) {
        let ruleValue = rule.value;
        let ruleChildren = rules[ruleName].children;
        delete rules[ruleName];

        if(rule.array) {
          for(let i = 0; i < ruleValue.length; i++) {
            let tmpRuleName = ruleName + '_array_' + i;
            childRules[tmpRuleName] = Object.assign({}, ruleChildren, {value: ruleValue[i]});
          }
        }else {
          for(let key in ruleValue) {
            let tmpRuleName = ruleName + '_object_' + key;
            childRules[tmpRuleName] = Object.assign({}, ruleChildren, {value: ruleValue[key]});
          }
        }
      }

    }
    return ({childRules, rules});
  }

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
    // console.log('parsedRules', parsedRules);

    let parsedChildRules = {};
    if(Object.keys(parsedResult.childRules).length > 0) {
      // pretreat for array/object child
      parsedChildRules = this._preTreatRules(parsedResult.childRules).rules;
      // console.log('parsedChildRules', parsedChildRules);
    }

    parsedRules = Object.assign({}, parsedRules, parsedChildRules);
    // console.log('last parsedRules', parsedRules, '\n');

    outerLoop:
    for(let ruleName in parsedRules){
      let rule = parsedRules[ruleName];

      // required check
      let isRequired = this._checkValueRequired(rule);
      if(isRequired && helper.isTrueEmpty(rule.value)) {
        let validName = 'required';
        let parsedValidArgs = this._parseRuleArgs(validName, rule[validName]);
        let errMsg = this._getErrorMessage(ruleName, rule, validName, parsedValidArgs, msgs);
        ret[ruleName] = errMsg;
        continue;
      }else if(!isRequired && helper.isTrueEmpty(rule.value)){
        continue;
      }

      // valid check
      for(let validName in rule){
        if(this.skipedValidNames.indexOf(validName) >= 0) {
          continue;
        }

        // check if the valid method is exsit
        let fn = validator[validName];
        if (!helper.isFunction(fn)) {
          throw new Error(validName + ' valid method is not been configed');
        }

        // get parsed valid options
        let parsedValidArgs = this._parseRuleArgs(validName, rule[validName]);

        let result = fn(rule.value, parsedValidArgs);
        if(!result){
          let errMsg = this._getErrorMessage(ruleName, rule, validName, parsedValidArgs, msgs);
          ret[ruleName] = errMsg;
          continue outerLoop;
        }else {
          this._convertParamItemValue(ruleName, rule);
        }
      }

    }

    // delete nested children in ctx
    for(let key in this.ctx) {
      if(key.indexOf('_object_') > -1 || key.indexOf('_array_') > -1) {
        delete this.ctx[key];
      }
    }
    // console.log('resp err-->', ret, '\n');
    // console.log('ctx transform-->', this.ctx, '\n')
    return ret;
  }
}

module.exports = Validator;
