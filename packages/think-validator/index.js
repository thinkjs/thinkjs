/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2018-03-16 16:36:58
*/

// let rules = {             // rules
//   name: {                 // argName: rule
//     required: true,       // validName: validValue
//     method: 'GET'
//     trim: true,
//     defalut: 'thinkjs'
//   }
// }

const assert = require('assert');
const helper = require('think-helper');
const preRules = require('./rules.js');
const preErrors = require('./errors.js');
const ARRAY_SP = '__array__';
const OBJECT_SP = '__object__';
const WITHOUT_ERR_MESSAGE = ' valid failed';
const METHOD_MAP = {
  GET: 'param',
  POST: 'post',
  FILE: 'file',
  PUT: 'post',
  DELETE: 'post',
  PATCH: 'post',
  LINK: 'post',
  UNLINK: 'post',
  WEBSOCKET: 'param',
  CLI: 'param'
};

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
    this.skippedValidNames = ['value', 'default', 'trim', 'method', 'aliasName'].concat(this.requiredValidNames);
    this.basicType = ['int', 'string', 'float', 'array', 'object', 'boolean'];
    this.errors = helper.extend({}, preErrors);
  }

  /**
   * format argName nested array and object
   * @param  {String} argName [description]
   * @return {String}          [description]
   */
  _formatNestedRuleName(argName) {
    let newArgName = argName;
    if (newArgName.indexOf(ARRAY_SP) > -1) {
      const tmpRuleName = newArgName.split(ARRAY_SP);
      newArgName = tmpRuleName[0] + '[' + tmpRuleName[1] + ']';
    }
    if (newArgName.indexOf(OBJECT_SP) > -1) {
      const tmpRuleName = newArgName.split(OBJECT_SP);
      newArgName = tmpRuleName[0] + '.' + tmpRuleName[1];
    }
    return newArgName;
  }

  /**
   * [_checkCustomMessage error should be function or string]
   * @param  {[type]} error [description]
   * @return {[type]}       [description]
   */
  _checkCustomMessage(error) {
    return error && (helper.isString(error) || helper.isFunction(error));
  }

  /**
   * get error message
   * @param  {String} argName        [description]
   * @param  {Object} rule            [description]
   * @param  {String} validName       [description]
   * @param  {Mixed} parsedValidValue [description]
   * @return {String}                 [description]
   */
  _getErrorMessage({ argName, rule, validName, parsedValidValue }) {
    let errMsg = '';

    // all required style error map to `requied error message`
    if (this.requiredValidNames.indexOf(validName) > -1) {
      validName = 'required';
    }

    // cacl argName first, array use normal custom error style
    if (argName.indexOf(ARRAY_SP) > -1) {
      argName = argName.split(ARRAY_SP)[0];
    }

    // [error message]: { string: 'the error message' }
    const validNameError = this.errors[validName];
    if (this._checkCustomMessage(validNameError)) {
      errMsg = validNameError;
    }

    // [error message]: { username: 'the error message' }
    let argNameError = this.errors[argName];
    if (this._checkCustomMessage(argNameError)) {
      errMsg = argNameError;
    }

    // [error message]: { username: { string: 'the error message' } }
    if (helper.isObject(argNameError)) {
      const validArgNameError = this.errors[argName][validName];
      if (this._checkCustomMessage(validArgNameError)) {
        errMsg = validArgNameError;
      }
    }

    // nested object error config
    // eg: { address: { object: true, children: { // ... } } }
    // data: { address: { province: '山东', city: '济南' } }
    if (argName.indexOf(OBJECT_SP) > -1) {
      const parsedResult = argName.split(OBJECT_SP); // eg: argName: address__object__province after pretreating(just one rule split from address)
      argName = parsedResult[0]; // eg: address
      const subRuleName = parsedResult[1]; // eg: province
      argNameError = this.errors[argName]; // eg: address

      if (helper.isObject(argNameError)) {
        // [error message]: { address: {required: 'error message'} }
        errMsg = argNameError[validName];
        for (const i in argNameError) {
          if (i.split(',').indexOf(subRuleName) > -1) {
            if (helper.isObject(argNameError[i])) {
              // [error message]: { address: {'procince,city': {required: 'the error message'}} }
              if (this._checkCustomMessage(argNameError[i][validName])) {
                errMsg = argNameError[i][validName];
              }
            } else {
              // [error message]: { address: {'procince,city': 'the error message'} }
              if (this._checkCustomMessage(argNameError[i])) {
                errMsg = argNameError[i];
              }
            }
          }
        }
      } else {
        if (this._checkCustomMessage(argNameError)) {
          // [error message]: { address: 'address valid error' }
          errMsg = argNameError;
        }
      }

      // [error message]: {required: 'the error message', address: null }
      errMsg = errMsg || this.errors[validName];
    }

    const originRuleName = this._formatNestedRuleName(argName);
    if (!errMsg) {
      return (rule.aliasName || originRuleName) + WITHOUT_ERR_MESSAGE;
    }

    const validValue = rule[validName];

    // support function as the custom message
    if (helper.isFunction(errMsg)) {
      const lastErrorMsg = errMsg({
        name: originRuleName,
        validName: validName,
        rule: rule,
        args: validValue,
        pargs: parsedValidValue
      });
      assert(helper.isString(lastErrorMsg), 'custom error function should return string.');
      return lastErrorMsg;
    }

    // string as the custom message
    const lastErrorMsg = errMsg.replace('{name}', (rule.aliasName || originRuleName))
      .replace('{args}', helper.isString(validValue) ? validValue : JSON.stringify(validValue))
      .replace('{pargs}', helper.isString(parsedValidValue) ? parsedValidValue : JSON.stringify(parsedValidValue));
    return lastErrorMsg;
  }

  /**
   * parse valid args by _validName method
   * @return {Mixed}           [description]
   */
  _parseValidArgs(validName, rule, cloneRules, argName) {
    let validValue = rule[validName];
    const _fn = preRules['_' + validName];

    // support rewrite back, so just pass reference style data without clone
    if (helper.isFunction(_fn)) {
      validValue = _fn(validValue, {
        argName,
        validName,
        currentQuery: this.ctx[this._getRuleMethod(rule)](),
        ctx: this.ctx,
        rule: rule,
        rules: cloneRules
      });
    }
    return validValue;
  }

  /**
   * convert value by value type
   * @param  {String} argName [description]
   * @param  {Object} rule     [description]
   * @return {Mixed}          [description]
   */
  _convertParamValue(argName, rule) {
    const queryMethod = this._getRuleMethod(rule);
    const ruleCtxQuery = this.ctx[queryMethod]();
    if ((rule.int || rule.float || rule.numeric) && queryMethod) {
      if (argName.indexOf(ARRAY_SP) > -1) {
        const parsedRuleName = argName.split(ARRAY_SP);
        ruleCtxQuery[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      } else if (argName.indexOf(OBJECT_SP) > -1) {
        const parsedRuleName = argName.split(OBJECT_SP);
        ruleCtxQuery[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      } else {
        ruleCtxQuery[argName] = parseFloat(rule.value);
      }
    }
  }

  /**
   * check the value if is required
   * @return {Boolean}      [description]
   */
  _checkRequired(rule, rules, argName) {
    let isRequired = false;
    const cloneRules = helper.extend({}, rules);
    for (let i = 0; i <= this.requiredValidNames.length; i++) {
      const validName = this.requiredValidNames[i];
      if (rule[validName]) {
        const fn = preRules[validName];
        const parsedValidValue = this._parseValidArgs(validName, rule, cloneRules, argName);
        if (fn(rule.value, {
          argName,
          validName,
          validValue: rule[validName],
          parsedValidValue,
          currentQuery: this.ctx[this._getRuleMethod(rule)](),
          ctx: this.ctx,
          rule,
          rules: cloneRules // prevent to write
        })) {
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
  _getRuleMethod(rule) {
    if (typeof rule.method === 'undefined' || rule.method === '') {
      rule.method = this.ctx.method.toUpperCase();
    } else {
      rule.method = rule.method.toUpperCase();
    }
    return METHOD_MAP[rule.method];
  }

  /**
   * pre treat rule.value & handle the nested array and object valid
   * @param  {Object} rules [description]
   * @return {Object}       [description]
   */
  _preTreatRules(rules) {
    // to keep the nested rules split from the array or object
    const childRules = {};

    rules = helper.extend({}, rules);
    for (const argName in rules) {
      const rule = rules[argName];
      const queryMethod = this._getRuleMethod(rule);
      const ruleCtxQuery = this.ctx[queryMethod]();

      // basic type check, only one basic type is legal(ok)
      const containTypeNum = this.basicType.reduce((acc, val) => {
        val = rule[val] ? 1 : 0;
        return acc + val;
      }, 0);
      if (containTypeNum > 1) {
        throw new Error('Any rule can\'t contains one more basic type, the param you are validing is ' + argName);
      }

      // set related value on ctx to rule.value first
      if (!rule.value) {
        rule.value = ruleCtxQuery[argName];
      }

      // set default, when rule.value is undefined
      if (typeof (rule.value) === 'undefined' && !helper.isTrueEmpty(rule.default)) {
        rule.value = rule.default;
      }

      // trim rule.value, when trim is true
      if (rule.trim && rule.value && rule.value.trim) {
        rule.value = rule.value.trim();
      }

      // array convert
      if (rule.array && !helper.isArray(rule.value)) {
        if (rule.value && helper.isString(rule.value) && rule.value.indexOf(',') > -1) {
          rule.value = rule.value.split(',');
        } else {
          rule.value = [rule.value];
        }
      }

      // boolean convert
      if (rule.boolean) {
        rule.value = ['yes', 'on', '1', 'true', true].indexOf(rule.value) > -1;
      }

      // write back rule.value to ctx
      if (typeof rule.value !== 'undefined') {
        if (argName.indexOf(ARRAY_SP) !== -1 || argName.indexOf(OBJECT_SP) !== -1) {
          const parsedRuleName = argName.split(argName.indexOf(ARRAY_SP) === -1 ? OBJECT_SP : ARRAY_SP);
          ruleCtxQuery[parsedRuleName[0]][parsedRuleName[1]] = rule.value;
        } else {
          ruleCtxQuery[argName] = rule.value;
        }
      }

      // array & object children split and set the value
      if (rule.children) {
        // delete the argName, like [array|object]: true
        delete rules[argName];

        const ruleValue = rule.value;
        const ruleChildren = rule.children;
        if (rule.array) {
          for (let i = 0; i < ruleValue.length; i++) {
            const tmpRuleName = argName + ARRAY_SP + i;
            childRules[tmpRuleName] = helper.extend({}, ruleChildren, {value: ruleValue[i]});
          }
        } else {
          for (const key in ruleValue) {
            const tmpRuleName = argName + OBJECT_SP + key;
            childRules[tmpRuleName] = helper.extend({}, ruleChildren, {value: ruleValue[key]});
          }
        }
      }
    }
    let parsedChildRules = {};
    if (Object.keys(childRules).length > 0) {
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
  static addRule(validName, callback) {
    preRules[validName] = callback;
  }

  /**
   * validate rules
   * @param  {Object} rules [description]
   * @param  {Object} msgs  [custom errors]
   * @return {Object}       {argName: errorMessage}
   */
  validate(rules, msgs) {
    const ret = {};
    const cloneRules = helper.extend({}, rules);
    const parsedRules = this._preTreatRules(rules);
    this.errors = helper.extend(this.errors, msgs);

    for (const argName in parsedRules) {
      const rule = parsedRules[argName];

      // required check
      const isRequired = this._checkRequired(rule, rules, argName);
      if (helper.isTrueEmpty(rule.value)) {
        if (isRequired) {
          let validName;
          for (let i = 0; i < this.requiredValidNames.length; i++) {
            if (rule[this.requiredValidNames[i]]) {
              validName = this.requiredValidNames[i];
              break;
            }
          }

          const parsedValidValue = this._parseValidArgs(validName, rule, cloneRules, argName);
          const errMsg = this._getErrorMessage({ argName, rule, validName, parsedValidValue });
          ret[argName] = errMsg;
          continue;
        } else {
          continue;
        }
      }

      // valid check
      for (const validName in rule) {
        if (this.skippedValidNames.indexOf(validName) >= 0) {
          continue;
        }

        // check if the valid method is exsit
        const fn = preRules[validName];
        if (!helper.isFunction(fn)) {
          throw new Error(validName + ' valid method is not been configed');
        }

        // get parsed valid options
        const parsedValidValue = this._parseValidArgs(validName, rule, cloneRules, argName);

        const result = fn(rule.value, {
          argName,
          validName,
          validValue: rule[validName],
          parsedValidValue,
          currentQuery: this.ctx[this._getRuleMethod(rule)](),
          ctx: this.ctx,
          rule,
          rules: helper.extend({}, rules) // prevent to write
        });
        if (!result) {
          const errMsg = this._getErrorMessage({ argName, rule, validName, parsedValidValue });
          // format error message's rule name
          const newRuleName = this._formatNestedRuleName(argName);
          ret[newRuleName] = errMsg;
          break; // go to first for loop
        } else {
          // if this is no error, convert the value
          this._convertParamValue(argName, rule);
        }
      }
    }
    return ret;
  }
}

module.exports = Validator;
