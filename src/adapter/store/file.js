'use strict';

import fs from 'fs';
import path from 'path';

let BaseStore = think.adapter('store', 'base');

/**
 * file store class
 */
export default class extends BaseStore {
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
    let deferred = think.defer();
    fs.readFile(filepath, {encoding: 'utf8'}, (err, content) => err ? deferred.reject(err) : deferred.resolve(content));
    return deferred.promise;
  }
  /**
   * set file content
   * @param {String} key     []
   * @param {String} content []
   */
  set(key, content){
    let filepath = this.config.path + '/' + key;
    think.mkdir(path.dirname(filepath));
    let deferred = think.defer();
    fs.writeFile(filepath, content, err => {
      think.chmod(filepath);
      return err ? deferred.reject(err) : deferred.resolve();
    });
    return deferred.promise;
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
    let deferred = think.defer();
    fs.unlink(filepath, err => err ? deferred.reject(err) : deferred.resolve());
    return deferred.promise;
  }
  /**
   * get all files
   * @return {Promise} []
   */
  list(){
    return Promise.resolve(think.getFiles(this.config.path));
  }
}