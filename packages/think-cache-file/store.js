/*
* @Author: lushijie
* @Date:   2017-03-16 09:50:44
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-19 14:16:45
*/
const helper = require('think-helper');
const path = require('path');
const fs = require('fs');

/**
 * file store
 */
class FileStore {
  constructor(storePath) {
    this.storePath = storePath;
    if(!helper.isDirectory(this.storePath)) {
      helper.mkdir(this.storePath);
    }
  }

  /**
   * get file path
   * @param  {String} relativePath [description]
   * @return {String}     [description]
   */
  _getFilePath(relativePath = '') {
    return path.join(this.storePath, relativePath);
  }

  /**
   * get file data
   * @param  {String} relativePath   [relativePath]
   * @param  {Number} times [try times when can not get file content]
   * @return {Promise}       [description]
   */
  get(relativePath, times = 1) {
    let filePath = this._getFilePath(relativePath);
    if(times === 1 && !helper.isFile(filePath)){
      return Promise.resolve();
    }
    // try 3 times when can not get file content
    return helper.promisify(fs.readFile, fs)(filePath, {encoding: 'utf8'}).then(content => {
      if(!content && times <= 3){
        return this.get(relativePath, times + 1);
      }
      return content;
    });
  }

  /**
   * set file content
   * @param {String} relativePath     [relativePath]
   * @param {Promise} content [description]
   */
  set(relativePath, content) {
    let filePath = this._getFilePath(relativePath);
    helper.mkdir(path.dirname(filePath));
    return helper.promisify(fs.writeFile, fs)(filePath, content).then(() => {
      helper.chmod(filePath);
      return true;
    });
  }

  /**
   * delete file
   * @param  {String} relativePath [relativePath]
   * @return {Promise}     [description]
   */
  delete(relativePath) {
    let filePath = this._getFilePath(relativePath);
    if(!helper.isFile(filePath)){
      return Promise.resolve();
    }
    return helper.promisify(fs.unlink, fs)(filePath);
  }
}

module.exports = FileStore;
