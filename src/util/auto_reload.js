'use strict';

import fs from 'fs';
import path from 'path';

//can not use import from
let sys_module = require('module');

//rewriteSysModuleLoad flag
let _rewriteSysModuleLoad = false;

const NODE_MODULES = `${path.sep}node_modules${path.sep}`;

/**
 * auto reload file
 */
export default class {
  /**
   * constructor
   * @param  {Array} args []
   * @return {}         []
   */
  constructor(...args){
    this.init(...args);
  }
  /**
   * init
   * @param  {String}   srcPath  [source path]
   * @param  {Function} callback [when file has changed, callback will be invoke]
   * @param  {Boolean}  log      [log reload file]
   * @return {}            []
   */
  init(srcPath, callback){
    this.srcPath = path.normalize(srcPath);
    this.callback = callback;
    this.prevFilesCount = 0;
  }
  /**
   * log file
   * @param  {String} file []
   * @return {}      []
   */
  // log(file){
  //   //only log app files changed
  //   if(file.indexOf(this.srcPath) === 0){
  //     file = file.slice(this.srcPath.length);
  //     think.log(`reload file ${file}`, 'RELOAD');
  //   }
  // }
  /**
   * clear file cache, also clear dependents file cache
   * @return {} []
   */
  clearFileCache(file){
    if(file.indexOf(NODE_MODULES) > -1 || file.indexOf(this.srcPath) !== 0){
      return;
    }
    let mod = require.cache[file];
    if(!mod){
      return;
    }
    //think.log(`reload file ${file.slice(this.srcPath.length)}`, 'RELOAD');
    //remove children
    if(mod && mod.children){
      mod.children.length = 0;
    }

    // clear module cache which dependents this module
    for(let fileItem in require.cache){
      if(fileItem === file || fileItem.indexOf(NODE_MODULES) > -1){
        continue;
      }
      let item = require.cache[fileItem];
      if(item && item.children && item.children.indexOf(mod) > -1){
        this.clearFileCache(fileItem);
      }
    }
    //remove require cache
    delete require.cache[file];
  }
  /**
   * clear files cache
   * @param  {Array} files []
   * @return {}       []
   */
  clearFilesCache(files){
    files.forEach(file => {
      this.clearFileCache(file);
    });
    if(this.callback){
      this.callback();
    }
  }
  /**
   * check file change
   * compare files count
   * @return {} []
   */
  checkFileChange(){
    let filesCount = think.getFiles(this.srcPath, true).filter(file => {
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
    for(let file in require.cache){
      //ignore file in node_modules path
      if(file.indexOf(NODE_MODULES) > -1){
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
      }
    }
    return hasChange;
  }
  /**
   * run
   * @return {} []
   */
  run(){
    let hasChange = this.checkCacheChange() || this.checkFileChange();
    if(hasChange && this.callback){
      this.callback();
    }
    setTimeout(this.run.bind(this), 200);
  }
  /**
   * rewrite sys module load method
   * @return {} []
   */
  static rewriteSysModuleLoad(){

    if(_rewriteSysModuleLoad){
      return;
    }
    _rewriteSysModuleLoad = true;

    let load = sys_module._load;
    
    //rewrite Module._load method
    sys_module._load = (request, parent, isMain) => {
      let exportsObj = load(request, parent, isMain);
      if(!parent){
        return exportsObj;
      }
      if(isMain || parent.filename.indexOf(NODE_MODULES) > -1){
        return exportsObj;
      }
      if(request === 'internal/repl' || request === 'repl'){
        return exportsObj;
      }
      try{
        let filename = sys_module._resolveFilename(request, parent);
        let cachedModule = sys_module._cache[filename];
        if(cachedModule && parent.children.indexOf(cachedModule) === -1){
          parent.children.push(cachedModule);
        }
      }catch(e){}
      return exportsObj;
    };
  }
}