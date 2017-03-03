/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-03 20:12:12
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

  _getErrorMessage(ruleName, rule, validName, parsedValidArgs, msgs) {
    //ruleName = ruleName.replace(/_array_\d/, '');

    let errMsg = validator.errors[validName];
    if(helper.isObject(msgs)) {
      let msgsRuleName = msgs[ruleName];

      if(msgsRuleName && helper.isString(msgsRuleName)) {
        errMsg = msgsRuleName;
      }

      if(msgsRuleName && helper.isObject(msgsRuleName) && helper.isString(msgsRuleName[validName])) {
        errMsg = msgsRuleName[validName];
      }

      if(msgs[ruleName + '_' + validName] && helper.isString(msgs[ruleName + '_' + validName])) {
        errMsg = msgs[ruleName + '_' + validName]
      }
    }

    if(!errMsg) {
      return ruleName + ' valid failed';
    }

    let validArgs = rule[ruleName];
    return errMsg.replace('{name}', ruleName)
                 .replace('{args}', JSON.stringify(validArgs))
                 .replace('{pargs}', JSON.stringify(parsedValidArgs));
  }

  _parseRuleArgs(validName, ruleArgs) {
    let pfn = validator['_' + validName];
    if(helper.isFunction(pfn)){
      ruleArgs = pfn(ruleArgs, this.ctx);
    }
    return ruleArgs;
  }

  _convertParamItemValue(ruleName, rule) {
    if(ruleName.indexOf('_array_') > -1 && (rule.int || rule.float || rule.numeric)) {
      let parsedRuleName = ruleName.split('_array_');
      this.ctx[parsedRuleName[0]][parsedRuleName[1]] = parseFloat(rule.value);
      return;
    }

    if(rule.int || rule.float || rule.numeric) {
       this.ctx[ruleName] = parseFloat(rule.value);
    }
  }

  _checkValueRequired(rule) {
    let isRequired = false;
    for(let i = 0; i <= this.requiredValidNames.length; i++) {
      let validName = this.requiredValidNames[i];
      if(rule[validName]) {
        let fn = validator[validName];
        let parsedValidArgs = this._parseRuleArgs(validName, rule[validName], this.ctx);
        if(fn(rule.value, parsedValidArgs)) {
          isRequired = true;
          break;
        };
      }
    }
    return isRequired;
  }

  _preTreatRules(rules) {
    rules = helper.extend({}, rules);
    let isNest = false;

    for(let ruleName in rules) {
      let rule = rules[ruleName];

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

      let ruleValue = rule.value;

      // array children
      if(rule.array && rule.children) {
        let ruleChildren = rules[ruleName].children;
        delete rules[ruleName];
        isNest = true;

        for(let i = 0; i < ruleValue.length; i++) {
          let tmpRuleName = ruleName + '_array_' + i;
          rules[tmpRuleName] = helper.extend({}, ruleChildren, {value: ruleValue[i]});
        }
      }

      // object children
      if(rule.object && rule.children) {
        let ruleChildren = rules[ruleName].children;
        delete rules[ruleName];
        isNest = true;

        for(let key in ruleValue) {
          let tmpRuleName = ruleName + '_object_' + key;
          rules[tmpRuleName] = helper.extend({}, ruleChildren, {value: ruleValue[key]});
        }
      }
    }
    return ({isNest, rules});
  }

  add(validName, callback) {
    validator[validName] = callback;
  }

  validate(rules, msgs) {
    let ret = {};

    let parsedResult = this._preTreatRules(rules);
    let parsedRules = parsedResult.rules;

    // pretreat for array/object child
    if(parsedResult.isNest) {
      parsedRules = this._preTreatRules(parsedRules).rules;
    }

    console.log('rules-->', parsedRules, '\n');


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

      // valid method check
      for(let validName in rule){
        if(this.skipedValidNames.indexOf(validName) >= 0) {
          continue;
        }

        // check if the valid method is exsit
        let fn = validator[validName];
        if (!helper.isFunction(fn)) {
          throw new Error(validName + ' valid method is not been configed');
        }

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
    console.log('resp-->', ret, '\n');
    console.log('ctx-->', this.ctx, '\n')
    return ret;
  }
}

module.exports = Validator;







// let ctx = {
//   name: '123'
// };

// let rules2 = {
//   name: {
//     int: true,
//     required: true
//   }
// }

// let msgs2 = {
//   int: 'int valid failed'
// }
// const instance = new Validator(ctx);
// let resp = instance.validate(rules2, msgs2);



// let ctx = {
//   name: ['123', '12 ', '666 ']
// };

// let rules2 = {
//   name: {
//     array: true,
//     children: {
//       int: true,
//       default: 12,
//       trim: true
//     }
//   }
// }

// let msgs2 = {
//   int: 'int valid failed'
// }
// const instance = new Validator(ctx);
// let resp = instance.validate(rules2, msgs2);


let ctx = {
  name: {
    a: 123,
    b: '3245     '
  }
};

let rules2 = {
  name: {
    object: true,
    children: {
      int: true,
      default: 12,
      trim: true
    }
  }
}

let msgs2 = {
  int: 'int valid failed'
}
const instance = new Validator(ctx);
let resp = instance.validate(rules2, msgs2);
