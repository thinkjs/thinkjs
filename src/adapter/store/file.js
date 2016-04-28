'use strict';

import fs from 'fs';
import path from 'path';

/**
 * lock files
 * @type {Object}
 */
let lockFiles = {};

/**
 * file store class
 */
export default class extends think.adapter.base {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    this.config = think.extend({
      path: ''
    }, config);

    if(!this.config.path){
      throw new Error('config.path must be set');
    }

    if(!think.isDir(this.config.path)){
      think.mkdir(this.config.path);
    }
  }
  /**
   * get file path
   * @param  {String} key []
   * @return {String}     []
   */
  getFilePath(key){
    return this.config.path + path.sep + key;
  }
  /**
   * get data
   * @param  {String} key []
   * @return {Promise}    []
   */
  async get(key){
    let filePath = this.getFilePath(key);
    if(!think.isFile(filePath)){
      return Promise.resolve();
    }

    await lockFiles[filePath];
    return think.promisify(fs.readFile, fs)(filePath, {encoding: 'utf8'});
  }
  /**
   * set file content
   * @param {String} key     []
   * @param {String} content []
   */
  async set(key, content){
    let filePath = this.getFilePath(key);
    think.mkdir(path.dirname(filePath));
    let fn = think.promisify(fs.writeFile, fs);

    let promise = fn(filePath, content).then(() => {
      think.chmod(filePath);
      delete lockFiles[filePath];
    });
    lockFiles[filePath] = promise;
    return promise;
  }
  /**
   * delete file
   * @param  {String} key []
   * @return {Promise}     []
   */
  delete(key){
    let filepath = this.getFilePath(key);
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