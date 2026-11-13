/*
 * @Author: lushijie
 * @Date:   2017-03-16 09:50:44
 * @Last Modified by:   lushijie
 * @Last Modified time: 2018-04-19 18:42:37
 */
import fs = require('fs');
import path = require('path');
import assert = require('assert');
import helper = require('think-helper');
import Debounce = require('think-debounce');
// The legacy promisifier has only a Function type. Narrow each callback API
// here without replacing the wrapper or changing its receiver/error semantics.
const readFile = helper.promisify(fs.readFile, fs) as
  (file: string, options: {encoding: 'utf8'}) => Promise<string>;
const writeFile = helper.promisify(fs.writeFile, fs) as (file: string, content: string | ArrayBufferView) => Promise<void>;
const unlink = helper.promisify(fs.unlink, fs) as (file: string) => Promise<void>;
const appendFile = helper.promisify(fs.appendFile, fs) as (file: string, content: string | Uint8Array) => Promise<void>;
const access = helper.promisify(fs.access, fs) as (file: string, mode: number) => Promise<void>;
const stat = helper.promisify(fs.stat, fs) as (file: string) => Promise<fs.Stats>;

const debounceInstance = new Debounce();
/** @internal */
const getFilePath = Symbol('think-get-file-path');

/**
 * file store
 */
class FileStore {
  storePath: string;
  /**
     * constructor
     * @param {String} storePath store file root path
     */
  constructor(storePath: string) {
    assert(storePath && path.isAbsolute(storePath), 'storePath need be an absolute path');
    this.storePath = storePath;
  }

  /**
     * get file path
     * @internal
     * @param  {String} relativePath [description]
     * @return {String}     [description]
     */
  [getFilePath](relativePath: string): string {
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
  get(relativePath: string): Promise<string | undefined> {
    const filePath = this[getFilePath](relativePath);
    if (!helper.isFile(filePath)) {
      return Promise.resolve() as Promise<undefined>;
    }

    function getFileContent(times = 1): Promise<string> {
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
  set(relativePath: string, content: string | ArrayBufferView): Promise<boolean> {
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
  delete(relativePath: string): Promise<void> {
    const filePath = this[getFilePath](relativePath);
    if (!helper.isFile(filePath)) {
      return Promise.resolve() as Promise<undefined>;
    }

    // mutiple process will cause error if just unlink(filePath);
    return unlink(filePath).catch(err => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
      return Promise.reject(err);
    });
  }

  /**
     * append file content
     * @param  {String} relativePath [relativePath]
     * @param  {String | Buffer} data [String or Buffer data]
     * @return {Promise}     []
     */
  append(relativePath: string, data: string | Uint8Array): Promise<void> {
    const filePath = this[getFilePath](relativePath);
    if (!helper.isFile(filePath)) {
      return Promise.resolve() as Promise<undefined>;
    }
    return appendFile(filePath, data);
  }

  /**
     * Does the file exist
     * @param  {String} relativePath [relativePath]
     * @return {Promise}     []
     */
  has(relativePath: string): Promise<void> {
    const filePath = this[getFilePath](relativePath);
    return access(filePath, fs.constants.F_OK);
  }

  /**
     * get file info
     * @param  {String} relativePath [relativePath]
     * @return {Promise}     []
     */
  info(relativePath: string): Promise<fs.Stats | undefined> {
    const filePath = this[getFilePath](relativePath);
    if (!helper.isFile(filePath)) {
      return Promise.resolve() as Promise<undefined>;
    }
    return stat(filePath);
  }
}

export = FileStore;
