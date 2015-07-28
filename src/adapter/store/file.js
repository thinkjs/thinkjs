'use strict';

import fs from 'fs';
import path from 'path';

/**
 * file store class
 */
export default class extends think.adapter.store {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    this.config = think.extend({
      path: ''
    }, config);

    if(!think.isDir(config.path)){
      think.mkdir(config.path);
    }
  }
  /**
   * get data
   * @param  {String} key []
   * @return {Promise}     []
   */
  get(key){
    let filepath = this.config.path + '/' + key;
    if(!think.isFile(filepath)){
      return Promise.resolve();
    }
    return think.promisify(fs.readFile, fs)(filepath, {encoding: 'utf8'});
  }
  /**
   * set file content
   * @param {String} key     []
   * @param {String} content []
   */
  set(key, content){
    let filepath = this.config.path + '/' + key;
    think.mkdir(path.dirname(filepath));
    let fn = think.promisify(fs.writeFile, fs);
    return fn(filepath, content).then(() => {
      think.chmod(filepath);
    });
  }
  /**
   * delete file
   * @param  {String} key []
   * @return {Promise}     []
   */
  delete(key){
    let filepath = this.config.path + '/' + key;
    if(!think.isFile(filepath)){
      return Promise.resolve();
    }
    return think.promisify(fs.unlink, fs)(filepath);
  }
  /**
   * get all files
   * @return {Promise} []
   */
  list(){
    return Promise.resolve(think.getFiles(this.config.path));
  }
}