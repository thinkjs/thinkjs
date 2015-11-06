'use strict';

import fs from 'fs';
import path from 'path';

/**
 * auto reload file
 */
export default class extends think.base {
  /**
   * init
   * @param  {String}   srcPath  [source path]
   * @param  {Function} callback [when file has changed, callback will be invoke]
   * @param  {Boolean}  log      [log reload file]
   * @return {}            []
   */
  init(srcPath, callback, showLog){
    this.srcPath = srcPath;
    this.callback = callback;
    this.showLog = showLog;
    this.prevFilesCount = 0;
  }
  /**
   * log file
   * @param  {String} file []
   * @return {}      []
   */
  log(file){
    if(!this.showLog || !file){
      return;
    }
    //only log app files changed
    if(file.indexOf(think.srcPath) === 0){
      file = file.slice(think.srcPath.length);
      think.log(`reload file ${file}`, 'RELOAD');
    }
  }
  /**
   * clear file cache, also clear dependents file cache
   * @return {} []
   */
  clearFileCache(file){

    let mod = require.cache[file];
    //remove children
    if(mod && mod.children){
      mod.children.length = 0;
    }
    //remove require cache
    delete require.cache[file];

    // clear module cache which dependents this module
    for(let fileItem in require.cache){
      let item = require.cache[fileItem];
      if(item && item.children && item.children.indexOf(mod)){
        this.clearFileCache(fileItem);
      }
    }
  }
  /**
   * check file change
   * compare files count
   * @return {} []
   */
  checkFileChange(){
    let filesCount = think.getFiles(this.srcPath).filter(file => {
      let extname = path.extname(file);
      return extname === '.js';
    }).length;
    let flag = this.prevFilesCount && this.prevFilesCount !== filesCount;
    this.prevFilesCount = filesCount;
    return flag;
  }
  /**
   * check cache change
   * @return {} []
   */
  checkCacheChange(){
    let autoReload = thinkCache(thinkCache.AUTO_RELOAD);
    let hasChange = false;
    let nodeModules = `${path.sep}node_modules${path.sep}`;
    for(let file in require.cache){
      //ignore file in node_modules path
      if(file.indexOf(nodeModules) > -1){
        continue;
      }
      if(!think.isFile(file)){
        this.clearFileCache(file);
        continue;
      }
      let mTime = fs.statSync(file).mtime.getTime();
      if(!autoReload[file]){
        autoReload[file] = mTime;
        continue;
      }
      if(mTime > autoReload[file]){
        this.clearFileCache(file);
        autoReload[file] = mTime;
        hasChange = true;
        this.log(file);
      }
    }
    return hasChange;
  }
  /**
   * run
   * @return {} []
   */
  run(){
    this.timer = setInterval(() => {
      let hasChange = this.checkCacheChange() || this.checkFileChange();
      if(hasChange && this.callback){
        this.callback();
      }
    }, 200);
  }
}