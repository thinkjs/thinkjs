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
   * compiled error files
   * @type {Array}
   */
  compiledErrorFiles = [];
  /**
   * init
   * @param  {String} srcPath []
   * @param  {String} outPath []
   * @param  {Boolean} log     []
   * @return {}         []
   */
  init(srcPath, outPath, options = {}, callback){
    this.srcPath = srcPath;
    this.outPath = outPath;
    this.options = options;
    this.callback = callback;
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
      let retainLines = this.options.retainLines;
      let data = babel.transform(content, {
        filename: file,
        retainLines: retainLines === undefined ? true : retainLines,
        stage: 0,
        modules: 'common',
        loose: true,
        optional: 'runtime'
      });
      if(this.options.log){
        think.log(`compile file ${file}`, 'BABEL', startTime);
      }
      think.mkdir(path.dirname(`${this.outPath}/${file}`));
      fs.writeFileSync(`${this.outPath}/${file}`, data.code);
      return true;
    }catch(e){

      think.log(colors => {
        return colors.red(`compile file ${file} error`);
      }, 'BABEL');
      think.log(e);

      e.message = 'Babel Compile Error: ' + e.message;
      think.compileError = e;
    }
  }
  /**
   * src file is deleted, but app file also exist
   * then delete app file
   * @return {} []
   */
  getSrcDeletedFiles(srcFiles, appFiles){
    return appFiles.filter(file => {
      let extname = path.extname(file);
      if(extname !== '.js'){
        return;
      }
      //src file not exist
      if(srcFiles.indexOf(file) === -1){
        let filepath = this.outPath + '/' + file;
        fs.unlinkSync(filepath);
        return true;
      }
    }).map(file => {
      return this.outPath + '/' + file;
    });
  }
  /**
   * compile
   * @return {} []
   */
  compile(){
    let files = think.getFiles(this.srcPath, true);
    let appFiles = think.getFiles(this.outPath, true);
    let changedFiles = this.getSrcDeletedFiles(files, appFiles);

    if(!this.compiledErrorFiles.length){
      think.compileError = null;
    }

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
        let ret = this.compileFile(file);
        if(ret){
          changedFiles.push(path.normalize(`${this.outPath}/${file}`));
        }
        
        this.compiledMtime[file] = mTime;

        if(ret){
          let index = this.compiledErrorFiles.indexOf(file);
          if(index > -1){
            this.compiledErrorFiles.splice(index, 1);
          }
        }else{
          this.compiledErrorFiles.push(file);
        }
      }
    });
    //notify auto reload service to clear file cache
    if(changedFiles.length && this.callback){
      this.callback(changedFiles);
    }
    setTimeout(this.compile.bind(this), 100);
  }
  /**
   * run
   * @return {} []
   */
  run(){
    this.compile();
  }
}