'use strict';

import os from 'os';
import multiparty from 'multiparty';


const MULTIPARTY_REG = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;

/**
 * parse form payload
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

    //file upload by form or FormData
    //can not use http.type method
    if (!MULTIPARTY_REG.test(http.headers['content-type'])) {
      return;
    }

    //make upload file path
    let uploadDir = think.config('post.file_upload_path');
    if(!uploadDir){
      uploadDir = os.tmpdir() + think.sep + 'thinkjs' + think.sep + 'upload';
    }
    think.mkdir(uploadDir);

    return this.getFormData(uploadDir);
  }
  /**
   * get form data
   * @return {Promise} []
   */
  getFormData(uploadDir){
    let http = this.http;
    let deferred = think.defer();
    let postConfig = think.config('post');
    let form = new multiparty.Form({
      maxFieldsSize: postConfig.max_fields_size,
      maxFields: postConfig.max_fields,
      maxFilesSize: postConfig.max_file_size,
      uploadDir: uploadDir
    });
    //support for file with multiple="multiple"
    let files = http._file;
    form.on('file', (name, value) => {
      if (name in files) {
        if (!think.isArray(files[name])) {
          files[name] = [files[name]];
        }
        files[name].push(value);
      }else{
        files[name] = value;
      }
    });
    form.on('field', (name, value) => {
      http._post[name] = value;
    });
    form.on('close', () => {
      deferred.resolve(null);
    });
    form.on('error', err => {
      http.req.resume();
      http.res.statusCode = 400;
      http.end();
      //log error
      if(http.config('post.log_error')){
        think.log(err);
      }
    });
    form.parse(http.req);
    return deferred.promise;
  }
}