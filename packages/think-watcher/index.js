const helper = require('think-helper');
const assert = require('assert');
const fs = require('fs');
const debug = require('debug')('think-watcher');
const path = require('path');

/**
 * default options
 * @type {Object}
 */
const defaultOptions = {
  allowExts: ['js', 'es', 'ts'],
  filter: (fileInfo, options) => {
    const seps = fileInfo.file.split(path.sep);
    // filter hidden file
    const flag = seps.some(item => {
      return item[0] === '.';
    });
    if (flag) {
      return false;
    }
    const ext = path.extname(fileInfo.file).slice(1);
    return options.allowExts.indexOf(ext) !== -1;
  }
};

/**
 * watcher class
 */
class Watcher {
  /**
   * constructor
   * @param {Object} options  watch options
   * @param {Function} cb callback when files changed
   */
  constructor(options, cb) {
    assert(helper.isFunction(cb), 'callback must be a function');
    options = this.buildOptions(options);

    debug(`srcPath: ${options.srcPath}`);
    debug(`diffPath: ${options.diffPath}`);

    this.options = options;
    this.cb = cb;
    this.lastMtime = {};
  }
  /**
   * build Options
   * @param {Object} options 
   */
  buildOptions(options = {}) {
    if (helper.isString(options)) {
      options = {srcPath: options};
    }
    let srcPath = options.srcPath;
    assert(srcPath, 'srcPath can not be blank');
    if (!helper.isArray(srcPath)) {
      srcPath = [srcPath];
    }
    let diffPath = options.diffPath || [];
    if (!helper.isArray(diffPath)) {
      diffPath = [diffPath];
    }
    options.srcPath = srcPath;
    options.diffPath = diffPath;
    if (!options.filter) {
      options.filter = defaultOptions.filter;
    }
    if (!options.allowExts) {
      options.allowExts = defaultOptions.allowExts;
    }
    return options;
  }
  /**
   * get changed files
   */
  getChangedFiles() {
    const changedFiles = [];
    const options = this.options;
    options.srcPath.forEach((srcPath, index) => {
      assert(path.isAbsolute(srcPath), 'srcPath must be an absolute path');
      const diffPath = options.diffPath[index];
      const srcFiles = helper.getdirFiles(srcPath).filter(file => {
        return options.filter({path: srcPath, file}, options);
      });
      let diffFiles = [];
      if (diffPath) {
        diffFiles = helper.getdirFiles(diffPath).filter(file => {
          return options.filter({path: diffPath, file}, options);
        });
        this.removeDeletedFiles(srcFiles, diffFiles, diffPath);
      }
      srcFiles.forEach(file => {
        const mtime = fs.statSync(path.join(srcPath, file)).mtime.getTime();
        if (diffPath) {
          let diffFile = '';
          diffFiles.some(dfile => {
            if (this.removeFileExtName(dfile) === this.removeFileExtName(file)) {
              diffFile = dfile;
              return true;
            }
          });
          const diffFilePath = path.join(diffPath, diffFile);
          // compiled file exist
          if (diffFile && helper.isFile(diffFilePath)) {
            const diffmtime = fs.statSync(diffFilePath).mtime.getTime();
            // if compiled file mtime is after than source file, return
            if (diffmtime > mtime) {
              return;
            }
          }
        }
        if (!this.lastMtime[file] || mtime > this.lastMtime[file]) {
          this.lastMtime[file] = mtime;
          changedFiles.push({path: srcPath, file});
        }
      });
    });
    return changedFiles;
  }
  /**
   * remove files in srcPath when is deleted in diffPath
   * @param {Array} srcFiles
   * @param {Array} diffFiles
   * @param {String} diffPath
   */
  removeDeletedFiles(srcFiles, diffFiles, diffPath) {
    const srcFilesWithoutExt = srcFiles.map(file => {
      return this.removeFileExtName(file);
    });
    diffFiles.forEach(file => {
      const fileWithoutExt = this.removeFileExtName(file);
      if (srcFilesWithoutExt.indexOf(fileWithoutExt) === -1) {
        const filepath = path.join(diffPath, file);
        if (helper.isFile(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    });
  }
  /**
   * remove file extname
   * @param {String} file
   */
  removeFileExtName(file) {
    return file.replace(/\.\w+$/, '');
  }
  /**
   * watch files change
   */
  watch() {
    const detectFiles = () => {
      const changedFiles = this.getChangedFiles();
      if (changedFiles.length) {
        changedFiles.forEach(item => {
          debug(`file changed: path=${item.path}, file=${item.file}`);
          this.cb(item);
        });
      }
      setTimeout(detectFiles, this.options.interval || 100);
    };
    detectFiles();
  }
}

module.exports = Watcher;
