'use strict';

import fs from 'fs';
import path from 'path';

//babel not export default property
//so can not use `import babel from 'babel-core'`
let babel = require('babel-core');

/**
 * watch compile
 */
export default class extends think.base {
  /**
   * store compiled files last mtime
   * @type {Object}
   */
  compiledMtime = {};
  /**
   * init
   * @param  {String} srcPath []
   * @param  {String} outPath []
   * @param  {Boolean} log     []
   * @return {}         []
   */
  init(srcPath, outPath, log){
    if(srcPath === true){
      log = true;
      srcPath = '';
    }
    srcPath = srcPath || `${think.ROOT_PATH}/src`;
    outPath = outPath || `${think.ROOT_PATH}/app`;
    this.srcPath = srcPath;
    this.outPath = outPath;
    this.log = log;
  }
  /**
   * compile single file
   * @param  {String} file     []
   * @param  {Boolean} onlyCopy []
   * @return {}          []
   */
  compileFile(file, onlyCopy){
    let filePath = `${this.srcPath}/${file}`;
    let content = fs.readFileSync(filePath, 'utf8');

    if(!content){
      return;
    }
    if(onlyCopy){
      fs.writeFileSync(`${this.outPath}/${file}`, content);
      return;
    }
    let startTime = Date.now();
    try{
      let data = babel.transform(content, {
        retainLines: true,
        stage: 0,
        modules: 'common',
        loose: true,
        optional: 'runtime'
      });
      if(this.log){
        think.log(`compile file ${file}`, 'BABEL', startTime);
      }
      think.mkdir(path.dirname(`${this.outPath}/${file}`));
      fs.writeFileSync(`${this.outPath}/${file}`, data.code);
    }catch(e){
      think.log(colors => {
        return colors.red(`compile file ${file} error`);
      }, 'BABEL');
      think.log(e);
    }
  }
  /**
   * compile
   * @return {} []
   */
  compile(){
    let files = think.getFiles(this.srcPath);
    files.forEach(file => {
      let extname = path.extname(file);
      //if is not js file, only copy
      if(extname !== '.js'){
        this.compileFile(file, true);
        return;
      }
      let mTime = fs.statSync(`${this.srcPath}/${file}`).mtime.getTime();
      let outFile = `${this.outPath}/${file}`;
      if(think.isFile(outFile)){
        let outmTime = fs.statSync(outFile).mtime.getTime();
        //if compiled file mtime is after than source file, return
        if(outmTime > mTime){
          return;
        }
      }
      if(!this.compiledMtime[file] || mTime > this.compiledMtime[file]){
        this.compileFile(file);
        this.compiledMtime[file] = mTime;
        return;
      }
    });
  }
  /**
   * run
   * @return {} []
   */
  run(){
    if(!think.isDir(this.srcPath)){
      return;
    }
    this.timer = setInterval(this.compile.bind(this), 100);
    return true;
  }
}