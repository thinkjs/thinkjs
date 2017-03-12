const helper = require('think-helper');

const PARAM = Symbol('context-param');


module.exports = {
  /**
   * get or set configs
   */
  config: (name, value, m = this.module) => {
    return think.config(name, value, m);
  },
  /**
   * get querystring
   * ps: query or get is used in koa
   */
  param: (name, value) => {
    if(!this[PARAM]){
      this[PARAM] = Object.assign({}, this.query);
    }
    if(helper.isObject(name)){
      this[PARAM] = Object.assign(this[PARAM], name);
      return this;
    }
    assert(name && helper.isString(name), 'param.name must be a string');
    if(value === undefined){
      return this[PARAM][name];
    }
    this[PARAM][name] = value;
    return this;
  },
  /**
   * get or set cookie
   * @param {String} name 
   * @param {String} value 
   * @param {Object} options 
   */
  cookie(name, value, options = {}){
    assert(name && helper.isString(name), 'cookie.name must be a string');
    options = Object.assign({}, this.config('cookie'), options);
    //get cookie
    if(value === undefined){
      return this.cookies.get(name, options);
    }
    //remove cookie
    if(value === null){
      return this.cookies.set(name, '', {
        maxAge: -1
      });
    }
    //set cookie
    return this.cookies.set(name, value, options);
  }
}