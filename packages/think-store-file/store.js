/*
* @Author: lushijie
* @Date:   2017-03-16 09:50:44
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-17 14:03:15
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
    if(!helper.isDirectory(this.storePath)) {
      helper.mkdir(this.storePath);
    }
  }

  /**
   * get file path
   * @param  {String} fileName [description]
   * @return {String}     [description]
   */
  _getFilePath(fileName) {
    return path.join(this.storePath, fileName);
  }

  /**
   * get file data
   * @param  {String} fileName   [fileName]
   * @param  {Number} times [try times when can not get file content]
   * @return {Promise}       [description]
   */
  get(fileName, times = 1) {
    let filePath = this._getFilePath(fileName);
    if(times === 1 && !helper.isFile(filePath)){
      return Promise.resolve();
    }
    // try 3 times when can not get file content
    return helper.promisify(fs.readFile, fs)(filePath, {encoding: 'utf8'}).then(content => {
      if(!content && times <= 3){
        return this.get(fileName, times + 1);
      }
      return content;
    });
  }

  /**
   * set file content
   * @param {String} fileName     [fileName]
   * @param {Promise} content [description]
   */
  set(fileName, content) {
    let filePath = this._getFilePath(fileName);
    helper.mkdir(path.dirname(filePath));
    return helper.promisify(fs.writeFile, fs)(filePath, content).then(() => {
      helper.chmod(filePath);
      return true;
    });
  }

  /**
   * delete file
   * @param  {String} fileName [fileName]
   * @return {Promise}     [description]
   */
  delete(fileName) {
    let filePath = this._getFilePath(fileName);
    if(!helper.isFile(filePath)){
      return Promise.resolve();
    }
    return helper.promisify(fs.unlink, fs)(filePath);
  }
}

module.exports = FileStore;
