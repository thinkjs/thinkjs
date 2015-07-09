'use strict';

import fs from 'fs';
import os from 'os';
import path from 'path';

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
    think.mkdir(`${this.path}/${dir}`);
    return `${this.path}/${dir}/${name}${this.file_ext}`;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    let filepath = this.getFilepath(name);
    if (!think.isFile(filepath)) {
      return Promise.resolve();
    }
    let deferred = think.defer();
    fs.readFile(filepath, {encoding: 'utf8'}, (err, content) => {
      //has error or no content
      if(err || !content){
        return deferred.resolve();
      }
      try{
        let data = JSON.parse(content);
        if(data.expire && Date.now() > data.expire){
          fs.unlink(filepath, () => {
            deferred.resolve();
          });
        }else{
          deferred.resolve(data.data);
        }
      }catch(e){
        fs.unlink(filepath, () => {
          deferred.resolve();
        });
      }
    });
    return deferred.promise;
  }
  /**
   * set data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout = this.timeout){
    if (think.isObject(name)) {
      timeout = value;
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
    let deferred = think.defer();
    fs.writeFile(filepath, JSON.stringify(data), () => {
      think.chmod(filepath);
      deferred.resolve();
    });
    return deferred.promise;
  }
  /**
   * remove data
   * @param  {String} name []
   * @return {Promise}      []
   */
  rm(name){
    let filepath = this.getFilepath(name);
    if (think.isFile(filepath)) {
      let deferred = think.defer();
      fs.unlink(filepath, () => {
        deferred.resolve();
      });
      return deferred.promise;
    }
    return Promise.resolve();
  }
  /**
   * gc
   * @return {} []
   */
  gc(){
    let files = think.getFiles(this.path);
    let now = Date.now();
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
  }
}