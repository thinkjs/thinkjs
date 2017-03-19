/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:41
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-19 13:56:48
*/
const path = require('path');
const helper = require('think-helper');
const assert = require('assert');
const fs = require('fs');
const debounce = require('think-debounce');
const FileStore = require('./store');
const debounceInst = new debounce();
const readFileFn = helper.promisify(fs.readFile, fs);

/**
 * file cache adapter
 */
class FileCache {
  constructor(config) {
    assert(config.cachePath && helper.isString(config.cachePath), 'config.cachePath must be set');
    this.store = new FileStore(config);
    this.timeout = config.timeout;
    this.fileExt = config.fileExt;
    this.cachePath = config.cachePath;
    this.pathDepth = config.pathDepth || 1;
  }

  /**
   * get file path by the cache key
   * @param  {String} key [description]
   * @return {String}     [description]
   */
  _getFilePath(key) {
    key = helper.md5(key);
    let dir = key.slice(0, this.pathDepth).split('').join(path.sep);
    return path.join(dir, key) + this.fileExt;
  }

  /**
   * get cache content by the cache key
   * @param  {String} key [description]
   * @return {Promise}      [description]
   */
  get(key) {
    let filePath = this._getFilePath(key);
    return debounceInst.debounce(filePath, () => {
      return this.store.get(filePath).then(content => {
        if(!content) {
          return;
        }
        try{
          content = JSON.parse(content);
          if(Date.now() > content.expire){
            return this.store.delete(filePath);
          }else{
            return content.content;
          }
        }catch(e){
          return this.store.delete(filePath);
        }
      }).catch(() => {});
    });
  }

  /**
   * get cache key's content
   * @param {String} key     [description]
   * @param {Mixed} content [description]
   * @return {Promise}      [description]
   */
  set(key, content, timeout = this.timeout) {
    let filePath = this._getFilePath(key);
    let tmp = {
      content: content,
      expire: Date.now() + timeout * 1000
    }
    return this.store.set(filePath, JSON.stringify(tmp)).catch(() => {});
  }

  /**
   * delete cache key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    let filePath = this._getFilePath(key);
    return this.store.delete(filePath).catch(() => {});
  }

  /**
   * delete expired key
   * @return {[type]} [description]
   */
  gc() {
    let now = Date.now();
    return helper.getdirFiles(this.cachePath).map(file => {
      let filePath = path.join(this.cachePath, file);
      return readFileFn(filePath, 'utf8').then((content) => {
        if(content) {
          try{
            content = JSON.parse(content);
            if(now > content.expire){
              fs.unlink(filePath, () => {});
            }
          }catch(e){
            fs.unlink(filePath, () => {});
          }
        }
      })
    })
  }

}

module.exports = FileCache;
