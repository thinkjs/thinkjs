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
 * file cache
 */
export default class extends think.adapter.cache {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options = {}){
    this.timeout = options.timeout;
    this.file_ext = options.file_ext;
    this.path = options.path || path.normalize(os.tmpdir() + '/thinkjs');
    this.path_depth = options.path_depth || 1;

    this.store = new FileStore({
      path: this.path
    })

    this.gcType = 'cache_file';
    think.gc(this);
  }
  /**
   * get stored file path
   * @return {String} []
   */
  getFilepath(name){
    name = think.md5(name);
    let dir = name.slice(0, this.path_depth).split('').join('/');
    return `${dir}/${name}${this.file_ext}`;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    let filepath = this.getFilepath(name);
    return this.store.get(filepath).then(data => {
      if(!data){
        return;
      }
      try{
        data = JSON.parse(data);
        if(data.expire && Date.now() > data.expire){
          return this.store.delete(filepath);
        }else{
          return data.data;
        }
      }catch(e){
        return this.store.delete(filepath);
      }
    }).catch(err => {})
  }
  /**
   * set data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout = this.timeout){
    if (think.isObject(name)) {
      timeout = value || timeout;
      let key = Object.keys(name)[0];
      value = name[key];
      name = key;
    }
    let filepath = this.getFilepath(name);
    let data = {
      data: value,
      expire: Date.now() + timeout * 1000,
      timeout: timeout
    };
    return this.store.set(filepath, JSON.stringify(data)).catch(err => {});
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    let filepath = this.getFilepath(name);
    return this.store.delete(filepath).catch(err => {});
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