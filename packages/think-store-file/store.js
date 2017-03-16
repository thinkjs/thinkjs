/*
* @Author: lushijie
* @Date:   2017-03-16 09:50:44
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-16 20:11:06
*/
const helper = require('think-helper');
const path = require('path');
const fs = require('fs');

/**
 * file store
 */
class FileStore {
  constructor(config) {
    this.storePath = config.cachePath;
    if(!helper.isDirectory) {
      helper.mkdir(this.storePath);
    }
  }

  /**
   * get file path
   * @param  {String} key [description]
   * @return {String}     [description]
   */
  _getFilePath(key) {
    return path.join(this.storePath, key);
  }

  /**
   * get file data
   * @param  {String} key   [fileName]
   * @param  {Number} times [try times when can not get file content]
   * @return {Promise}       [description]
   */
  get(key, times = 1) {
    let filePath = this._getFilePath(key);
    if(times === 1 && !helper.isFile(filePath)){
      return Promise.resolve();
    }
    // try 3 times when can not get file content
    return helper.promisify(fs.readFile, fs)(filePath, {encoding: 'utf8'}).then(content => {
      if(!content && times <= 3){
        return this.get(key, times + 1);
      }
      return content;
    });
  }

  /**
   * set file content
   * @param {String} key     [fileName]
   * @param {Promise} content [description]
   */
  set(key, content) {
    let filePath = this._getFilePath(key);
    helper.mkdir(path.dirname(filePath));
    return helper.promisify(fs.writeFile, fs)(filePath, content).then(() => {
      helper.chmod(filePath);
      return true;
    });
  }

  /**
   * delete file
   * @param  {String} key [fileName]
   * @return {Promise}     [description]
   */
  delete(key) {
    let filePath = this._getFilePath(key);
    if(!helper.isFile(filePath)){
      return Promise.resolve();
    }
    return helper.promisify(fs.unlink, fs)(filePath);
  }
}

module.exports = FileStore;
