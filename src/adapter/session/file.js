'use strict';

import fs from 'fs';
import os from 'os';

/**
 * file session
 */
export default class extends think.adapter.session {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options = {}){
    this.timeout = options.timeout;
    this.key = options.cookie;
    this.path = options.path || (os.tmpdir() + '/thinkjs');
    this.path_depth = options.path_depth || 1;

    this.gcType = `session_file`;
    think.gc(this);
  }
  /**
   * get stored file path
   * @return {String} []
   */
  getFilepath(){
    let name = this.key;
    let dir = name.slice(0, this.path_depth).split('').join('/');
    think.mkdir(`${this.path}/${dir}`);
    return `${this.path}/${dir}/${name}.json`;
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
    if(!think.isFile(filepath)){
      this.data = {};
      return Promise.resolve();
    }
    let deferred = think.defer();
    fs.readFile(filepath, {encoding: 'utf8'}, (err, content) => {
      //has error or no content
      if(err || !content){
        this.data = {};
        return deferred.resolve();
      }
      try{
        let data = JSON.parse(content);
        if(Date.now() > data.expire){
          fs.unlink(filepath, () => {
            this.data = {};
            deferred.resolve();
          });
        }else{
          this.data = data.data;
          deferred.resolve(data.data);
        }
      }catch(e){
        fs.unlink(filepath, () => {
          this.data = {};
          deferred.resolve();
        });
      }
    });
    return deferred.promise;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.getData().then(data => {
      return name ? data[name] : data;
    });
  }
  /**
   * set data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout){
    if(timeout){
      this.timeout = timeout;
    }
    return this.getData().then(() => {
      this.data[name] = value;
    });
  }
  /**
   * remove data
   * @param  {String} name []
   * @return {Promise}      []
   */
  rm(name){
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
    if(!this.data){
      return Promise.resolve();
    }
    let filepath = this.getFilepath();
    let data = {
      data: this.data,
      expire: Date.now() + this.timeout * 1000,
      timeout: this.timeout
    };
    let deferred = think.defer();
    fs.writeFile(filepath, JSON.stringify(data), () => {
      think.chmod(filepath);
      deferred.resolve();
    });
    return deferred.promise;
  }
  /**
   * gc
   * @return {} []
   */
  gc(){
    let files = think.getFiles(this.path);
    files.forEach(file => {
      let filepath = `${this.path}/${file}`;
      let content = fs.readFileSync(filepath, 'utf8');
      try{
        let data = JSON.parse(content);
        if(Date.now() > data.expire){
          fs.unlink(filepath, () => {});
        }
      }catch(e){
        fs.unlink(filepath, () => {});
      }
    });
  }
}