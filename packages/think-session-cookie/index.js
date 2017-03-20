const Keygrip = require('./keygrip.js');
const assert = require('assert');
const helper = require('think-helper');

/**
 * use cookie to store session
 */
class CookieSession {
  /**
   * constructor
   * @param {Object} options cookie options
   * @param {Object} ctx koa ctx
   */
  constructor(options = {}, ctx){
    options.encrypt = true;
    if(options.encrypt){
      assert(options.keys && helper.isArray(options.keys), '.keys required when encrypt is set');
      options.sign = false; //disable sign when set encrypt
      this.keygrip = new Keygrip(options.keys);
    }
    options.overwrite = true; 
    this.options = options;
    this.ctx = ctx;
    this.fresh = true; //session data is fresh
    this.data = {}; //session data
    this.initSessionData();
  }
  /**
   * init session data
   */
  initSessionData(){
    let data = this.ctx.cookie(this.options.name);
    if(data){
      if(this.keygrip){
        data = new Buffer(data, 'base64');
        data = this.keygrip.decrypt(data);
        if(data && data[0]){
          data = data[0].toString();
        }
      }
      if(data){
        try{
          this.data = JSON.parse(data) || {};
          this.fresh = false;
        }catch(e){}
      }
    }
  }
  /**
   * get session data
   * @param {String} name 
   */
  get(name){
    if(name) return Promise.resolve(this.data[name]);
    return Promise.resolve(this.data);
  }
  /**
   * set session data
   * @param {String} name 
   * @param {Mixed} value 
   */
  set(name, value){
    this.data[name] = value;
    let data = JSON.stringify(this.data);
    if(this.keygrip){
      data = this.keygrip.encrypt(data).toString('base64');
    }
    this.ctx.cookie(this.options.name, data, this.options);
    return Promise.resolve();
  }
  /**
   * delete session data
   */
  delete(){
    if(!this.fresh){
      this.ctx.cookie(this.options.name, '');
    }
    return Promise.resolve();
  }
}

CookieSession.onlyCookie = true;

module.exports = CookieSession;