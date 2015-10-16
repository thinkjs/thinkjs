import fs from 'fs';
import os from 'os';
import path from 'path';
import querystring from 'querystring';

import multiparty from 'multiparty';
/**
 * parse data by form
 * @param  {} http []
 * @return {}      []
 */
think.middleware('parse_form_payload', http => {
  let multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
  //file upload by form or FormData
  if (!multiReg.test(http.req.headers['content-type'])) {
    return;
  }

  let deferred = think.defer();
  let uploadDir = think.config('post.file_upload_path') || (os.tmpdir() + '/thinkjs_upload');
  if (uploadDir) {
    think.mkdir(uploadDir);
  }
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
    deferred.resolve(http);
  });
  form.on('error', () => {
    http.res.statusCode = 400;
    http.end();
  });
  form.parse(http.req);
  return deferred.promise;
});


/**
 * parse upload file by ajax
 * @param  {} http []
 * @return {}      []
 */
think.middleware('parse_single_file_payload', http => {
  let filename = http.req.headers[think.config('post.single_file_header')];
  if(!filename){
    return;
  }
  let deferred = think.defer();
  let uploadDir = think.config('post.file_upload_path') || (os.tmpdir() + '/thinkjs_upload');
  if (uploadDir) {
    think.mkdir(uploadDir);
  }
  let name = think.uuid(20);
  let filepath = uploadDir + '/' + name + path.extname(filename).slice(0, 5);
  let stream = fs.createWriteStream(filepath);
  http.req.pipe(stream);
  stream.on('error', () => {
    http.res.statusCode = 400;
    http.end();
  });
  stream.on('close', () => {
    http._file.file = {
      fieldName: 'file',
      originalFilename: filename,
      path: filepath,
      size: fs.statSync(filepath).size
    };
    deferred.resolve();
  });
  return deferred.promise;
});


/**
 * parse payload
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('parse_json_payload', http => {
  let types = http.config('post.json_content_type');
  if (types.indexOf(http._type) === -1) {
    return;
  }
  return http.getPayload().then(payload => {
    try{
      http._post = JSON.parse(payload);
    }catch(e){}
  });
});


/**
 * parse payload by querystring
 * @param  {Object} http []
 * @return {[type]}      []
 */
think.middleware('parse_querystring_payload', http => {
  if (!think.isEmpty(http._post)) {
    return;
  }
  return http.getPayload().then(payload => {
    try{
      http._post = querystring.parse(payload);
    }catch(e){}
  });
});


/**
 * validate data parsed from payload 
 * @param  {Object} http []
 * @return {}      []
 */
think.middleware('validate_payload', http => {
  let post = http._post;
  let length = Object.keys(post).length;
  if (length > think.config('post.max_fields')) {
    http.res.statusCode = 400;
    http.end();
    return think.prevent();
  }
  let maxFilesSize = think.config('post.max_fields_size');
  for(let name in post){
    if (post[name] && post[name].length > maxFilesSize) {
      http.res.statusCode = 400;
      http.end();
      return think.prevent();
    }
  }
});