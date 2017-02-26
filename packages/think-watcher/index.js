const helper = require('think-helper');
const assert = require('assert');
const fs = require('fs');
const debug = require('debug')('think-watcher');
const path = require('path');

/**
 * last file modified time
 * @type {Object}
 */
let lastMtime = {};

/**
 * default options
 * @type {Object}
 */
const defaultOptions = {
  allowExts: ['js', 'es', 'ts'],
  filter: (fileInfo, options) => {
    let seps = fileInfo.file.split(path.sep);
    //filter hidden file
    let flag = seps.some(item => {
      if(item[0] === '.'){
        return true;
      }
    });
    if(flag){
      return false;
    }
    let ext = path.extname(fileInfo.file).slice(1);
    if(options.allowExts.indexOf(ext) === -1){
      return false;
    }
    return true;
  }
}
/**
 * build options
 * @type {Function}
 */
const buildOptions = (options = {}) => {
  if(helper.isString(options)){
    options = {srcPath: options};
  }
  let srcPath = options.srcPath;
  assert(srcPath, 'srcPath can not be blank');
  if(!helper.isArray(srcPath)){
    srcPath = [srcPath];
  }
  let diffPath = options.diffPath || [];
  if(!helper.isArray(diffPath)){
    diffPath = [diffPath];
  }
  options.srcPath = srcPath;
  options.diffPath = diffPath;
  if(!options.filter){
    options.filter = defaultOptions.filter;
  }
  if(!options.allowExts){
    options.allowExts = defaultOptions.allowExts;
  }
  return options;
}

/**
 * remove file extname
 * @param  {String} file []
 * @return {String}      []
 */
const removeFileExtName = file => {
  return file.replace(/\.\w+$/, '');
}
/**
 * delete diff file when src file is removed
 * @param  {Array} srcFiles  [source files]
 * @param  {Array} diffFiles [diff files]
 * @return {Array}           [changed files]
 */
const removeDeletedFiles = (srcFiles, diffFiles, diffPath) => {
  let srcFilesWithoutExt = srcFiles.map(file => {
    return removeFileExtName(file);
  });
  diffFiles.forEach(file => {
    let fileWithoutExt = removeFileExtName(file);
    if(srcFilesWithoutExt.indexOf(fileWithoutExt) === -1){
      let filepath = path.join(diffPath, file);
      if(helper.isFile(filepath)){
        fs.unlinkSync(filepath);
      }
    }
  });
}
/**
 * get changed files
 * @param  {Object} options []
 * @return {Array}         []
 */
const getChangedFiles = options => {
  let changedFiles = [];
  options.srcPath.forEach((srcPath, index) => {
    let diffPath = options.diffPath[index];
    let srcFiles = helper.getdirFiles(srcPath).filter(file => {
      return options.filter({path: srcPath, file}, options);
    });
    let diffFiles = [];
    if(diffPath){
      diffFiles = helper.getdirFiles(diffPath).filter(file => {
        return options.filter({path: diffPath, file}, options);
      });
      removeDeletedFiles(srcFiles, diffFiles, diffPath);
    }
    srcFiles.forEach(file => {
      let mtime = fs.statSync(path.join(srcPath, file)).mtime.getTime();
      if(diffPath){
        let diffFile = '';
        diffFiles.some(dfile => {
          if(removeFileExtName(dfile) === removeFileExtName(file)){
            diffFile = dfile;
            return true;
          }
        });
        let diffFilePath = path.join(diffPath, diffFile);
        //compiled file exist
        if(diffFile && helper.isFile(diffFilePath)){
          let diffmtime = fs.statSync(diffFilePath).mtime.getTime();
          //if compiled file mtime is after than source file, return
          if(diffmtime > mtime){
            return;
          }
        }
      }
      if(!lastMtime[file] || mtime > lastMtime[file]){
        lastMtime[file] = mtime;
        changedFiles.push({path: srcPath, file});
      }
    });
  });
  return changedFiles;
}
/**
 * watch file changed
 * @param  {Object}   options []
 * @param  {Function} cb      []
 * @return {}           []
 */
module.exports = (options, cb) => {
  assert(helper.isFunction(cb), 'callback must be a function');
  options = buildOptions(options);

  debug(`srcPath: ${options.srcPath}`);
  debug(`diffPath: ${options.diffPath}`);

  const detectFiles = () => {
    let changedFiles = getChangedFiles(options);
    if(changedFiles.length){
      changedFiles.forEach(item => {
        debug(`file changed: path=${item.path}, file=${item.file}`);
        cb(item);
      });
    }
    setTimeout(detectFiles, options.interval || 100);
  };

  detectFiles();
}