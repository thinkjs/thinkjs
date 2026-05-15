const helper = require('think-helper');
const RULES = require('./rules.js');
const ERRORS = require('./errors.js');
const METHOD_MAP = require('./method.js');

const VALIDATES = {
  ...RULES
};

/**
 * validator class
 */
class Validator {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * add rules
   */
  static add(name, func) {
    VALIDATES[name] = func;
  }

  /**
   * get error message
   */
  getErrorMsg(name, rule, pargs) {
    let msgs = ERRORS;
    if (helper.isObject(rule)) {
      if (rule.errMsg) return rule.errMsg;
    }
    const msg = msgs[name] || `{name} validate failed`;
    return msg.replace('{name}', name).replace('{args}', pargs).replace('{pargs}', pargs);
  }

  /**
   * get value from ctx
   */
  getValue(name, method) {
    if (!method) method = this.ctx.method;
    const methodMap = METHOD_MAP[method.toUpperCase()] || 'post';
    const value = this.ctx[methodMap](name);
    return value;
  }

  /**
   * parse alias
   */
  parseAlias(rules) {
    const aliasMap = {};
    for (const name in rules) {
      const rule = rules[name];
      if (rule.aliasName) {
        aliasMap[name] = rule.aliasName;
        delete rule.aliasName;
      }
    }
    return aliasMap;
  }

  /**
   * validate
   */
  validate(rules) {
    const aliasMap = this.parseAlias(rules);
    for (const name in rules) {
      const rule = rules[name];
      const aliasName = aliasMap[name] || name;

      // skip all rules if _all:false
      if (name === '_all' && rule === false) {
        return true;
      }

      // get value
      let value = this.getValue(name, rule.method);

      // check required
      if (rule.required) {
        const reqRet = VALIDATES.required(value, rule.required);
        if (!reqRet) {
          this.validateErrors = `${aliasName}: ${this.getErrorMsg('required', rule, rule.required)}`;
          return false;
        }
      } else {
        // if value is empty and not required, skip other validations
        if (value === undefined || value === null || value === '') continue;
      }

      // convert method
      if (rule.method && rule.method.toUpperCase() !== this.ctx.method.toUpperCase()) {
        const newMethodMap = METHOD_MAP[rule.method.toUpperCase()];
        if (newMethodMap) {
          value = this.ctx[newMethodMap](name);
        }
      }

      // parse int/float first
      if (rule.int || rule.float) {
        if (rule.float) {
          value = parseFloat(value);
        } else {
          value = parseInt(value);
        }
      }

      for (const rName in rule) {
        if (rName === 'method' || rName === 'required' || rName === 'int' || rName === 'float' || rName === 'trim' || rName === 'default' || rName === 'errMsg' || rName === 'convert') {
          continue;
        }

        const rValue = rule[rName];
        const fn = VALIDATES[rName];
        if (!fn) continue;

        let valid;
        if (helper.isBoolean(rValue)) {
          valid = fn(value, rValue);
        } else {
          valid = fn(value, rValue);
        }

        if (!valid) {
          this.validateErrors = `${aliasName}: ${this.getErrorMsg(rName, rule, rValue)}`;
          return false;
        }
      }
    }
    return true;
  }
}

module.exports = Validator;
