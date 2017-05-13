const Validator = require('think-validator');
const helper = require('think-helper');

const VALIDATE_INVOKED = Symbol('think-logic-validate-invoked');

module.exports = {
  /**
   * validate rules
   */
  validate(rules, msgs){
    if(helper.isEmpty(rules)) return;
    this[VALIDATE_INVOKED] = true;
    const instance = new Validator(this.ctx);
    const ret = instance.validate(rules, msgs);
    if(!helper.isEmpty(ret)){
      this.validateErrors = ret;
      return false;
    }
    return true;
  },
  /**
   * after magic method
   */
  __after(){
    //check request method is allowed
    let allowMethods = this.allowMethods;
    if(!helper.isEmpty(allowMethods)){
      if(helper.isString(allowMethods)) {
        allowMethods = allowMethods.split(',');
      }
      const method = this.method();
      if(allowMethods.indexOf(method) === -1){
        this.fail(this.config('validateDefaultErrno'), 'METHOD_NOT_ALLOWED');
        return false;
      }
    }
    //check rules
    if(!helper.isEmpty(this.rules) && !this[VALIDATE_INVOKED]){
      const flag = this.validate(this.rules);
      if(!flag){
        this.fail(this.config('validateDefaultErrno'), this.validateErrors);
        return false;
      }
    }
  }
}