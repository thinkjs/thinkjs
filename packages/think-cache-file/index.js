/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:41
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-24 10:45:34
*/
const path = require('path');
const helper = require('think-helper');
const assert = require('assert');
const fs = require('fs');
const readFile = helper.promisify(fs.readFile, fs);
const gc = require('think-gc');
const FileStore = require('think-store-file');
let _getRelativePath = Symbol('getRelativePath');

let defaultConfig = {
  timeout: 24 * 3600 * 1000,
  cachePath: '',
  pathDepth: 1
};

/**
 * file cache adapter
 */
class FileCache {
  constructor(config) {
    this.config = helper.extend({}, defaultConfig, config);

    this.timeout = this.config.timeout;
    this.cachePath = this.config.cachePath;
    this.pathDepth = this.config.pathDepth;
    this.store = new FileStore(this.cachePath);
    assert(this.cachePath && helper.isString(this.cachePath), 'config.cachePath must be set');

    //gc interval by 1 hour
    this.gcType = `cache-${this.cachePath}`;
    gc(this, 3600 * 1000);
  }

  /**
   * get file path by the cache key
   * @param  {String} key [description]
   * @return {String}     [description]
   */
  [_getRelativePath](key) {
    key = helper.md5(key);
    let dir = key.slice(0, this.pathDepth).split('').join(path.sep);
    return path.join(dir, key);
  }

  /**
   * get cache by the cache key
   * @param  {String} key [description]
   * @return {Promise}      [description]
   */
  get(key) {
    let relativePath = this[_getRelativePath](key);
    return this.store.get(relativePath).then(content => {
      if(!content) {
        return;
      }
      try{
        content = JSON.parse(content);
        if(Date.now() > content.expire){
          return this.store.delete(relativePath);
        }else{
          return content.content;
        }
      }catch(e){
        return this.store.delete(relativePath);
      }
    }).catch(() => {});
  }

  /**
   * set cache
   * @param {String} key     [description]
   * @param {String} content [description]
   * @param {Number} timeout [millisecond]
   * @return {Promise}      [description]
   */
  set(key, content, timeout = this.timeout) {
    let relativePath = this[_getRelativePath](key);
    let tmp = {
      content: content,
      expire: Date.now() + timeout
    }
    return this.store.set(relativePath, JSON.stringify(tmp)).catch(() => {});
  }

  /**
   * delete cache by the cache key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    let relativePath = this[_getRelativePath](key);
    return this.store.delete(relativePath).catch(() => {});
  }

  /**
   * delete expired key
   * @return {[type]} [description]
   */
  gc() {
    let now = Date.now();
    return helper.getdirFiles(this.cachePath).map(file => {
      let relativePath = path.join(this.cachePath, file);
      return readFile(relativePath, 'utf8').then((content) => {
        if(content) {
          try{
            content = JSON.parse(content);
            if(now > content.expire){
              fs.unlink(relativePath, () => {});
            }
          }catch(e){
            fs.unlink(relativePath, () => {});
          }
        }
      })
    })
  }

}

module.exports = FileCache;
