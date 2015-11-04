'use strict';

import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * file store
 * @type {Class}
 */
let FileStore = think.adapter('store', 'file');

/**
 * file session
 */
export default class extends think.adapter.session {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options){
    
    options = think.mergeConfig(options);

    this.timeout = options.timeout;
    this.cookie = options.cookie;
    this.path = options.path || path.normalize(os.tmpdir() + '/thinkjs');
    this.path_depth = options.path_depth || 1;

    this.store = new FileStore({
      path: this.path
    });

    this.gcType = this.path;
    think.gc(this);
  }
  /**
   * get stored file path
   * @return {String} []
   */
  getFilepath(){
    let name = this.cookie;
    let dir = name.slice(0, this.path_depth).split('').join('/');
    return `${dir}/${name}.json`;
  }
  /**
   * get session data
   * @return {Promise} []
   */
  getData(){
    if(this.data){
      return Promise.resolve(this.data);
    }
    let filepath = this.getFilepath();
    return this.store.get(filepath).then(data => {
      this.data = {};
      if(!data){
        return;
      }
      data = JSON.parse(data);
      if(Date.now() > data.expire){
        return this.store.delete(filepath);
      }else{
        this.data = data.data || {};
      }
    }).catch(() => {
      this.data = {};
    }).then(() => {
      return this.data;
    });
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.getData().then(() => {
      return name ? this.data[name] : this.data;
    });
  }
  /**
   * set data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout = this.timeout){
    this.timeout = timeout;
    return this.getData().then(() => {
      this.data[name] = value;
    });
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    return this.getData().then(() => {
      if(name){
        delete this.data[name];
      }else{
        this.data = {};
      }
    });
  }
  /**
   * flush data to file
   * @return {Promise} []
   */
  flush(){
    let filepath = this.getFilepath();
    return this.getData().then(() => {
      let data = {
        data: this.data,
        expire: Date.now() + this.timeout * 1000,
        timeout: this.timeout
      };
      return this.store.set(filepath, JSON.stringify(data));
    });
  }
  /**
   * gc
   * @return {} []
   */
  gc(){
    let now = Date.now();
    return this.store.list().then(files => {
      files.forEach(file => {
        let filepath = `${this.path}/${file}`;
        let content = fs.readFileSync(filepath, 'utf8');
        try{
          let data = JSON.parse(content);
          if(now > data.expire){
            fs.unlink(filepath, () => {});
          }
        }catch(e){
          fs.unlink(filepath, () => {});
        }
      });
    });
  }
}