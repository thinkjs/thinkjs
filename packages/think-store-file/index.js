/*
 * @Author: lushijie
 * @Date:   2017-03-16 09:50:44
 * @Last Modified by:   lushijie
 * @Last Modified time: 2018-04-19 18:42:37
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const helper = require('think-helper');
const Debounce = require('think-debounce');
const readFile = helper.promisify(fs.readFile, fs);
const writeFile = helper.promisify(fs.writeFile, fs);
const unlink = helper.promisify(fs.unlink, fs);
const appendFile = helper.promisify(fs.appendFile, fs);
const access = helper.promisify(fs.access, fs);
const stat = helper.promisify(fs.stat, fs);

const debounceInstance = new Debounce();
const getFilePath = Symbol('think-get-file-path');

/**
 * file store
 */
class FileStore {
  /**
     * constructor
     * @param {String} storePath store file root path
     */
  constructor(storePath) {
    assert(storePath && path.isAbsolute(storePath), 'storePath need be an absolute path');
    this.storePath = storePath;
  }

  /**
     * get file path
     * @param  {String} relativePath [description]
     * @return {String}     [description]
     */
  [getFilePath](relativePath) {
    const filePath = path.join(this.storePath, relativePath);
    assert(filePath.indexOf(this.storePath) === 0, 'the file should be in storePath');
    return filePath;
  }

  /**
     * get file data
     * @param  {String} relativePath   [relativePath]
     * @param  {Number} times [try times when can not get file content]
     * @return {Promise}       []
     */
  get(relativePath) {
    const filePath = this[getFilePath](relativePath);
    if (!helper.isFile(filePath)) {
      return Promise.resolve();
    }

    function getFileContent(times = 1) {
      return readFile(filePath, { encoding: 'utf8' }).then(content => {
        if (!content && times <= 3) {
          return Promise.reject(new Error(`content empty, file path is ${filePath}`));
        }
        return content;
      }).catch(err => {
        if (times <= 3) {
          return helper.timeout(10).then(() => {
            return getFileContent(times + 1);
          });
        }
        return Promise.reject(err);
      });
    }

    return debounceInstance.debounce(filePath, () => getFileContent());
  }

  /**
     * set file content
     * @param {String} relativePath     [relativePath]
     * @param {String} content []
     */
  set(relativePath, content) {
    const filePath = this[getFilePath](relativePath);
    helper.mkdir(path.dirname(filePath));
    return writeFile(filePath, content).then(() => {
      return helper.chmod(filePath);
    });
  }

  /**
     * delete file
     * @param  {String} relativePath [relativePath]
     * @return {Promise}     []
     */
  delete(relativePath) {
    const filePath = this[getFilePath](relativePath);
    if (!helper.isFile(filePath)) {
      return Promise.resolve();
    }

    // mutiple process will cause error if just unlink(filePath);
    return unlink(filePath).catch(err => {
      if (err.code === 'ENOENT') return;
      return Promise.reject(err);
    });
  }

  /**
     * append file content
     * @param  {String} relativePath [relativePath]
     * @param  {String | Buffer} data [String or Buffer data]
     * @return {Promise}     []
     */
  append(relativePath, data) {
    const filePath = this[getFilePath](relativePath);
    if (!helper.isFile(filePath)) {
      return Promise.resolve();
    }
    return appendFile(filePath, data);
  }

  /**
     * Does the file exist
     * @param  {String} relativePath [relativePath]
     * @return {Promise}     []
     */
  has(relativePath) {
    const filePath = this[getFilePath](relativePath);
    return access(filePath, fs.constants.F_OK);
  }

  /**
     * get file info
     * @param  {String} relativePath [relativePath]
     * @return {Promise}     []
     */
  info(relativePath) {
    const filePath = this[getFilePath](relativePath);
    if (!helper.isFile(filePath)) {
      return Promise.resolve();
    }
    return stat(filePath);
  }
}

module.exports = FileStore;
