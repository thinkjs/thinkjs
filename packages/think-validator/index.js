/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-03 10:43:30
*/
const _validator = require('./rules.js');
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
    this.skipedValidNames = ['value', 'default', 'trim', 'errmsg'].concat(this.requiredValidNames);
  }

  _getErrorMessage(rule, ruleName, validName,  parsedValidArgs) {
    // if(rule.errmsg) {
    //   return rule.errmsg;
    // }
    //let ruleName = Object.keys(rule)[0];
    let validArgs = rule[validName];
    let errmsg = _validator.errors['validate_' + validName];
    return errmsg.replace('{name}', ruleName)
                 .replace('{parsedOptions}', JSON.stringify(parsedValidArgs))
                 .replace('{options}', JSON.stringify(validArgs));

  }

  _parseRuleArgs(validName, ruleArgs) {
    let pfn = _validator['_' + validName];
    if(helper.isFunction(pfn)){
      ruleArgs = pfn(ruleArgs, this.ctx);
    }
    return ruleArgs;
  }

  _convertParamItemValue(rule, ruleName) {
    if(rule.int || rule.float || rule.numeric) {
       this.ctx[ruleName] = parseFloat(rule.value);
    }
  }

  _checkValueRequired(rule) {
    let isRequired = false;
    //let validName;
    for(var i = 0; i <= this.requiredValidNames.length; i++) {
      let validName = this.requiredValidNames[i];
      if(rule[validName]) {
        let fn = _validator[validName];
        let parsedValidArgs = this._parseRuleArgs(validName, rule[validName], this.ctx);
        if(fn(rule.value, parsedValidArgs)) {
          isRequired = true;
          break;
        };
      }
    }
    return isRequired;
  }

  validate(rules, msgs) {
    let ret = {};

    outerLoop:
    for(let ruleName in rules){

      let rule = rules[ruleName];
      rule.value = this.ctx[ruleName];

      // set default
      if(typeof(rule.value) === 'undefined' && !helper.isTrueEmpty(rule.default)){
        rule.value = rule.default;
      }

      // trim rule value if trim is true
      if(rule.trim && rule.value && rule.value.trim){
        rule.value = rule.value.trim();
      }

      // 数组
      if(rule.array && !helper.isArray(rule.value)) {
        rule.value = [rule.value]
      }

      // required check
      let isRequired = this._checkValueRequired(rule);
      if(isRequired && helper.isTrueEmpty(rule.value)) {
        let validName = 'required';
        let parsedValidArgs = this._parseRuleArgs(validName, rule[validName]);
        let errMsg = this._getErrorMessage(rule, ruleName, validName, parsedValidArgs);
        ret[ruleName] = errMsg;
        continue outerLoop;
      }else if(!isRequired && helper.isTrueEmpty(rule.value)){
        continue outerLoop;
      }

      for(let validName in rule){
        // skip the attr don't need valid
        if(this.skipedValidNames.indexOf(validName) >= 0) {
          continue;
        }

        // check if the valid method is exsit
        let fn = _validator[validName];
        if (!helper.isFunction(fn)) {
          throw new Error(validName + ' valid method is not been configed');
        }

        let parsedValidArgs = this._parseRuleArgs(validName, rule[validName]);
        let result = fn(rule.value, parsedValidArgs);

        if(!result){
          let errMsg = this._getErrorMessage(rule, ruleName, validName, parsedValidArgs);
          ret[ruleName] = errMsg;
          break outerLoop;
        }else {
          this._convertParamItemValue(rule, ruleName);
        }
      } // end inner for

    } // end outer for
    console.log('resp-->', ret);
    console.log('ctx-->', this.ctx)
    return ret;
  }
}

let ctx = {
  name: '123.00'
};

let rules2 = {
  name: {
    int: true,
    required: true
  }
}

let msgs2 = {
  int: 'int valid failed'
}
const instance = new Validator(ctx);
let resp = instance.validate(rules2, msgs2);


module.exports = Validator;
