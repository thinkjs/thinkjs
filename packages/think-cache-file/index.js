/*
* @Author: lushijie
* @Date:   2017-03-16 09:23:41
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-16 15:50:18
*/
const path = require('path');
const helper = require('think-helper');
const assert = require('assert');
const fs = require('fs');
const FileStore = require('./store');

/**
 * file cache adapter
 */
class FileCache {
  constructor(config) {
    assert(config.dir_path && helper.isString(config.dir_path), 'config.dir_path must be set');
    this.store = new FileStore(config);
    this.timeout = config.timeout;
    this.file_ext = config.file_ext;
    this.dir_path = config.dir_path;
    this.path_depth = config.path_depth || 1;
    setImmediate(this.gc.bind(this));
  }

  /**
   * get file path by the cache key
   * @param  {String} key [description]
   * @return {String}     [description]
   */
  _getFilePath(key) {
    key = helper.md5(key);
    let dir = key.slice(0, this.path_depth).split('').join(path.sep);
    return path.join(dir, key) + this.file_ext;
  }

  /**
   * get cache content by the cache key
   * @param  {String} key [description]
   * @return {Promise}      [description]
   */
  get(key) {
    let filePath = this._getFilePath(key);
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
    helper.getdirFiles(this.dir_path).forEach(file => {
      let filePath = path.join(this.dir_path, file);
      fs.readFile(filePath, 'utf8', (err, content) => {
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
