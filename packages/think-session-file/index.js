const FileStore = require('think-store-file');
const assert = require('assert');
const helper = require('think-helper');
const path = require('path');
const debug = require('debug')('think-session-file');
const gc = require('think-gc');
const fs = require('fs');

const readFile = helper.promisify(fs.readFile, fs);
const unlink = helper.promisify(fs.unlink, fs);

const initSessionData = Symbol('think-session-file-init');

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
    assert(options.sessionPath && path.isAbsolute(options.sessionPath), '.sessionPath required');
    assert(options.cookie, '.cookie required');

    this.options = options;
    this.ctx = ctx;
    this.fileStore = new FileStore(options.sessionPath);
    this.data = {};
    this.status = 0;

    this.gcType = `session_${options.sessionPath}`;
    gc(this, this.options.gcInterval);
    
    //flush session when request finish
    this.ctx.res.once('finish', () => {
      this.flush();
    });
  }
  /**
   * init session data
   */
  [initSessionData](){
    if(this.initPromise){
      return this.initPromise;
    }
    if(this.options.fresh || this.status === -1){
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
    return this.initPromise;
  }
  /**
   * get session data
   * @param {String} name 
   */
  get(name){
    return this[initSessionData]().then(() => {
      if(this.options.autoUpdate){
        this.status = 1;
      }
      return name ? this.data[name] : this.data;
    });
  }
  /**
   * set session data
   * @param {String} name 
   * @param {Mixed} value 
   */
  set(name, value){
    return this[initSessionData]().then(() => {
      this.status = 1;
      this.data[name] = value;
    });
  }
  /**
   * delete session data
   */
  delete(){
    this.status = -1;
    this.data = {};
    return Promise.resolve();
  }
  /**
   * flush session data to store
   */
  flush(){
    if(this.status === -1){
      this.status = 0;
      return this.fileStore.delete(this.options.cookie);
    }else if(this.status === 1){
      this.status = 0;
      return this.fileStore.set(this.options.cookie, JSON.stringify({
        expires: Date.now() + helper.ms(this.options.maxAge || 0),
        data: this.data
      }));
    }
    return Promise.resolve();
  }
  /**
   * gc
   */
  gc(){
    let files = helper.getdirFiles(this.options.sessionPath);
    files.forEach(file => {
      let filePath = path.join(this.options.sessionPath, file);
      readFile(filePath, 'utf8').then(content => {
        if(!content) return Promise.reject(new Error('content empty'));
        content = JSON.parse(content);
        if(Date.now() > content.expires){
          return Promise.reject(new Error('session file expired'));
        }
      }).catch(() => {
        return unlink(filePath);
      });
    })
  }
}

module.exports = FileSession;
