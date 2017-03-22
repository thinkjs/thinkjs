const FileStore = require('think-store-file');
const assert = require('assert');
const helper = require('think-helper');
const path = require('path');
const debug = require('debug')('think-session-file');
const gc = require('think-gc');

const initSessionData = Symbol('think-session-file-init');
const autoSave = Symbol('think-session-save');
/**
 * use file to store session
 */
class FileSession {
  /**
   * constructor
   * @param {Object} options 
   * @param {Object} ctx 
   */
  constructor(options, ctx){
    assert(options.sessionPath && path.isAbsolutePath(options.sessionPath), '.sessionPath required');
    assert(options.cookie, '.cookie required');
    this.options = options;
    this.ctx = ctx;
    this.fileStore = new FileStore(options.sessionPath);
    this.data = {};
    this.status = 0;
    this.gcType = `session_${options.sessionPath}`;
    gc(this, this.options.gcInterval);
  }
  /**
   * init session data
   */
  [initSessionData](){
    if(this.initPromise){
      return this.initPromise;
    }
    if(this.options.fresh){
      return this.initPromise = Promise.resolve();
    }
    this.initPromise = this.fileStore.get(this.options.cookie).then(content => {
      content = JSON.parse(content);
      if(helper.isEmpty(content)) return;
      //session data is expired
      if(content.expires < Date.now()){
        return this.delete();
      }
      this.data = content.data || {};
    }).catch(err => debug(err));
    this[autoSave]();
    return this.initPromise;
  }
  /**
   * auto save session data when is changed
   */
  [autoSave](){
    this.ctx.res.once('finish', () => {
      if(this.status === -1){
        return this.fileStore.delete(this.cookie);
      }else if(this.status === 1){
        return this.fileStore.set(this.cookie, JSON.stringify({
          expires: Date.now() + this.options.maxAge,
          data: this.data
        }));
      }
    });
  }
  /**
   * get session data
   * @param {String} name 
   */
  get(name){
    if(this.options.autoUpdate){
      this.status = 1;
    }
    return this.initPromise().then(() => {
      return name ? this.data[name] : this.data;
    });
  }
  /**
   * 
   * @param {String} name 
   * @param {Mixed} value 
   */
  set(name, value){
    this.status = 1;
    return this.initPromise().then(() => {
      this.data[name] = value;
    });
  }
  /**
   * delete session data
   */
  delete(){
    this.status = -1;
    this.data = {};
  }
  /**
   * gc
   */
  gc(){

  }
}

module.exports = FileSession;