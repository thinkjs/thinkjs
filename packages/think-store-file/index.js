/*
* @Author: lushijie
* @Date:   2017-03-16 09:50:44
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-19 16:36:37
*/
const helper = require('think-helper');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const debounce = require('think-debounce');
const debounceInst = new debounce();
const readFilePro = helper.promisify(fs.readFile, fs);
const writeFilePro = helper.promisify(fs.writeFile, fs);
const unlinkPro = helper.promisify(fs.unlink, fs);
/**
 * file store
 */
class FileStore {
  constructor(storePath) {
    assert(storePath && path.isAbsolute(storePath), 'storePath need be an absolute path');
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
  _getFilePath(relativePath) {
    let filePath = path.join(this.storePath, relativePath);
    assert(filePath.indexOf(this.storePath) === 0, 'the file should be in storePath');
    return filePath;
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
    return debounceInst.debounce(filePath, () => {
      return readFilePro(filePath, {encoding: 'utf8'}).then(content => {
        // try 3 times when can not get file content
        if(!content && times <= 3){
          return this.get(relativePath, times + 1);
        }
        return content;
      })
    })
  }

  /**
   * set file content
   * @param {String} relativePath     [relativePath]
   * @param {Promise} content [description]
   */
  set(relativePath, content) {
    let filePath = this._getFilePath(relativePath);
    helper.mkdir(path.dirname(filePath));
    return writeFilePro(filePath, content).then(() => {
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
    return unlinkPro(filePath);
  }
}

module.exports = FileStore;
