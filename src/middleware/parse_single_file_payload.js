'use strict';

import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * parse single file payload, uploaded with ajax
 * @type {}
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  run(){
    let http = this.http;

    if(!http.req.readable){
      return;
    }

    let post = this.config('post');
    let filename = http.header(post.single_file_header);
    if(!filename){
      return;
    }
    
    let uploadDir = post.file_upload_path;
    if(!uploadDir){
      uploadDir = os.tmpdir() + think.sep + 'thinkjs' + think.sep + 'upload';
    }
    think.mkdir(uploadDir);

    return this.getUploadFile(uploadDir, filename);
  }
  /**
   * get upload file
   * @param  {String} uploadDir []
   * @param  {String} filename  []
   * @return {Promise}           []
   */
  getUploadFile(uploadDir, filename){
    let deferred = think.defer();
    let http = this.http;
    let name = think.uuid(20);
    let filepath = uploadDir + think.sep + name + path.extname(filename).slice(0, 5);
    let stream = fs.createWriteStream(filepath);
    http.req.pipe(stream);
    stream.on('error', err => {
      http.res.statusCode = 400;
      http.end();
      //log error
      if(http.config('post.log_error')){
        think.log(err);
      }
    });
    stream.on('close', () => {
      http._file.file = {
        fieldName: 'file',
        originalFilename: filename,
        path: filepath,
        size: fs.statSync(filepath).size
      };
      deferred.resolve(null);
    });
    return deferred.promise;
  }
}