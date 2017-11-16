const Validator = require('think-validator');
const helper = require('think-helper');

const VALIDATE_INVOKED = Symbol('think-logic-validate-invoked');

let validatorsRuleAdd = false;

module.exports = {
  /**
   * validate rules
   */
  validate(rules, msgs) {
    if (helper.isEmpty(rules)) return;
    this[VALIDATE_INVOKED] = true;
    // add user defined rules
    if (!validatorsRuleAdd) {
      validatorsRuleAdd = true;
      const rules = think.app.validators.rules || {};
      for (const key in rules) {
        Validator.addRule(key, rules[key]);
      }
    }
    const instance = new Validator(this.ctx);
    msgs = Object.assign({}, think.app.validators.messages, msgs);
    if (helper.isObject(this.scope)) {
      rules = helper.extend(this.scope, rules);
    }
    const ret = instance.validate(rules, msgs);
    if (!helper.isEmpty(ret)) {
      this.validateErrors = ret;
      return false;
    }
    return true;
  },
  /**
   * after magic method
   */
  __after() {
    // check request method is allowed
    let allowMethods = this.allowMethods;
    if (!helper.isEmpty(allowMethods)) {
      if (helper.isString(allowMethods)) {
        allowMethods = allowMethods.split(',').map(e => {
          return e.toUpperCase();
        });
      }
      const method = this.method;
      if (allowMethods.indexOf(method) === -1) {
        this.fail(this.config('validateDefaultErrno'), 'METHOD_NOT_ALLOWED');
        return false;
      }
    }
    // check rules
    if (!this[VALIDATE_INVOKED]) {
      if (helper.isObject(this.scope)) {
        this.rules = helper.extend(this.scope, this.rules);
      }
      if (!helper.isEmpty(this.rules)) {
        const flag = this.validate(this.rules);
        if (!flag) {
          this.fail(this.config('validateDefaultErrno'), this.validateErrors);
          return false;
        }
      }
    }
  }
};
