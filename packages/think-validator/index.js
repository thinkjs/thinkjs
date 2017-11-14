/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-11-14 16:50:40
*/

// let rules = {             // rules
//   name: {                 // argName: rule
//     required: true,       // validName: validValue
//     method: 'GET'
//     trim: true,
//     defalut: 'thinkjs'
//   }
// }

const helper = require('think-helper');
const ARRAY_SP = '__array__';
const OBJECT_SP = '__object__';
const NOERROR = ' valid failed';
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
const preRules = require('./rules.js');
const preErrors = require('./errors.js');

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
   * get error message
   * @param  {String} argName        [description]
   * @param  {Object} rule            [description]
   * @param  {String} validName       [description]
   * @param  {Mixed} parsedValidValue [description]
   * @return {String}                 [description]
   */
  _getErrorMessage({ argName, rule, validName, parsedValidValue }) {
    let errMsg;

    // all required style error map to `requied error message`
    if (this.requiredValidNames.indexOf(validName) > -1) {
      validName = 'required';
    }

    // cacl argName first, array use normal custom error style
    if (argName.indexOf(ARRAY_SP) > -1) {
      argName = argName.split(ARRAY_SP)[0];
    }

    // set valid and arg error
    const validNameError = this.errors[validName];
    let argNameError = this.errors[argName];

    // eg int: 'error message'
    if (helper.isString(validNameError)) {
      errMsg = validNameError;
    }

    // eg name: 'error message'
    if (helper.isString(argNameError)) {
      errMsg = argNameError;
    }

    // eg name: {int: 'error message'}
    if (helper.isObject(argNameError) && helper.isString(argNameError[validName])) {
      errMsg = this.errors[argName][validName];
    }

    // eg name: {name1,name2: 'error message'}
    // eg name: {name1,name2: {int: 'error message'}}
    if (argName.indexOf(OBJECT_SP) > -1) {
      const parsedResult = argName.split(OBJECT_SP);
      const subRuleName = parsedResult[1];
      argName = parsedResult[0];
      argNameError = this.errors[argName];

      if (helper.isObject(argNameError)) {
        // eg: arg: {int: 'error message', 'a,b': 'error message'}
        errMsg = argNameError[validName]; // int

        for (const i in argNameError) {
          if (i.split(',').indexOf(subRuleName) > -1) {
            if (helper.isObject(argNameError[i])) {
              errMsg = argNameError[i][validName];
            } else if (helper.isString(argNameError[i])) {
              errMsg = argNameError[i];
            }
          }
        }
      } else if (helper.isString(argNameError)) {
        // eg: arg: 'arg object valid error'
        errMsg = argNameError;
      }

      // eg: {int: 'error message', arg: {...}}
      errMsg = errMsg || this.errors[validName]; // int
    }

    // format error message rule name
    const originRuleName = rule.aliasName || this._formatNestedRuleName(argName);

    // set defalut error message
    if (!errMsg) {
      return originRuleName + NOERROR;
    }

    const validValue = rule[validName];
    const lastMsg = errMsg.replace('{name}', originRuleName)
      .replace('{args}', helper.isString(validValue) ? validValue : JSON.stringify(validValue))
      .replace('{pargs}', helper.isString(parsedValidValue) ? parsedValidValue : JSON.stringify(parsedValidValue));
    return lastMsg;
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
        currentQuery: this.ctxQuery,
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
    const queryMethod = this._getQueryMethod(rule);
    if ((rule.int || rule.float || rule.numeric) && queryMethod) {
      if (argName.indexOf(ARRAY_SP) > -1) {
        const parsedRuleName = argName.split(ARRAY_SP);
        this.ctxQuery[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      } else if (argName.indexOf(OBJECT_SP) > -1) {
        const parsedRuleName = argName.split(OBJECT_SP);
        this.ctxQuery[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      } else {
        this.ctxQuery[argName] = parseFloat(rule.value);
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
          currentQuery: this.ctxQuery,
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
  _getQueryMethod(rule) {
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
    rules = helper.extend({}, rules);

    // to keep the nested rules split from the array or object
    const childRules = {};

    for (const argName in rules) {
      const rule = rules[argName];

      const queryMethod = this._getQueryMethod(rule);

      // set this.ctxQuery
      this.ctxQuery = this.ctx[queryMethod]();

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
        rule.value = this.ctxQuery[argName];
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
      if (typeof rule.value !== 'undefined' && queryMethod) {
        if (argName.indexOf(ARRAY_SP) !== -1 || argName.indexOf(OBJECT_SP) !== -1) {
          const parsedRuleName = argName.split(argName.indexOf(ARRAY_SP) === -1 ? OBJECT_SP : ARRAY_SP);
          this.ctxQuery[parsedRuleName[0]][parsedRuleName[1]] = rule.value;
        } else {
          this.ctxQuery[argName] = rule.value;
        }
      }

      // array & object children split and set the value
      if (rule.children) {
        const ruleValue = rule.value;
        const ruleChildren = rule.children;

        // delete the argName, like [array|object]: true
        delete rules[argName];

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
          currentQuery: this.ctxQuery,
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
