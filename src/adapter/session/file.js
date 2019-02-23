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
export default class extends think.adapter.base {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options){
    
    options = think.parseConfig(think.config('session'), options);

    this.timeout = options.timeout;
    this.cookie = options.cookie;
    this.newCookie = options.newCookie;
    this.path = options.path || path.normalize(os.tmpdir() + path.sep + 'thinkjs');
    this.path_depth = options.path_depth || 1;

    this.store = new FileStore({
      path: this.path
    });

    this.gcType = this.path;
    think.gc(this);

    this.data = null;
    this.dataEmpty = false;
  }
  /**
   * get stored file path
   * @return {String} []
   */
  getFilepath(){
    let name = this.cookie;
    let dir = name.slice(0, this.path_depth).split('').join(path.sep);
    return `${dir}${path.sep}${name}.json`;
  }
  /**
   * get init data
   * @return {} []
   */
  async getInitData(){
    //when session cookie is not exist, return direct
    if(this.newCookie){
      return {};
    }
    let filepath = this.getFilepath();
    //ignore error
    let data = await think.await(`session_${this.cookie}`, () => {
      return this.store.get(filepath).catch(() => {});
    });
    if(!data){
      return {};
    }
    try{
      data = JSON.parse(data);
    }catch(e){
      return {};
    }
    if(Date.now() > data.expire){
      await this.store.delete(filepath);
    }else{
      return data.data || {};
    }
    return {};
  }
  /**
   * get session data
   * @return {Promise} []
   */
  async getData(){
    if(this.data){
      return this.data;
    }
    let data = await this.getInitData();
    if(think.isEmpty(data)){
      this.dataEmpty = true;
    }
    this.data = data;
    return this.data;
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
  async flush(){
    let data = await this.getData();
    //if data not changed and initial data is empty, then ignore it
    if(this.dataEmpty && think.isEmpty(data)){
      return;
    }
    let saveData = {
      data: this.data,
      expire: Date.now() + this.timeout * 1000,
      timeout: this.timeout
    };
    let filepath = this.getFilepath();
    return this.store.set(filepath, JSON.stringify(saveData));
  }
  /**
   * gc
   * @return {} []
   */
  gc(){
    let now = Date.now();
    return this.store.list().then(files => {
      files.forEach(file => {
        let filepath = `${this.path}${path.sep}${file}`;
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