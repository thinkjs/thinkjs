'use strict';

let fs = require('fs');

/**
 * parse payload
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('parse_json_payload', (http) => {
  if (!http.payload) {
    return;
  }
  let types = http.config.post.json_content_type;
  if (types.indexOf(http.contentType) > -1) {
    try{
      http._post = JSON.parse(http.payload);
    }catch(e){}
  }
})
/**
 * output resource
 * @param  {Object} http    []
 * @param  {String} file [file path]
 * @return {}         []
 */
think.middleware('output_resource', (http, file) => {
  let stream = fs.createReadStream(file);
  stream.pipe(http.res);
  stream.on('end', () => http.end());
})
/**
 * rewrite pathname, remove prefix & suffix
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('rewrite_pathname', (http) => {
  let pathname = http.pathname;
  if (!pathname) {
    return;
  }
  let prefix = think.config('pathname_prefix');
  if (prefix && pathname.indexOf(prefix) === 0) {
    pathname = pathname.substr(prefix.length);
  }
  let suffix = think.config('pathname_suffix');
  if (suffix && pathname.substr(0 - suffix.length) === suffix) {
    pathname = pathname.substr(0, pathname.length - suffix.length);
  }
  http.pathname = pathname;
})
/**
 * sub domain deploy
 * @param  {Object} http){} 
 * @return {}
 */
think.middleware('subdomain_deploy', (http) => {
  let subdomain = http.config('subdomain');
  if (think.isEmpty(subdomain)) {
    return;
  }
  let hostname = http.hostname.split('.')[0];
  let value = subdomain[hostname];
  if (!value) {
    return;
  }
  http.pathname = value + '/' + http.pathname;
})
/**
 * send error message
 * @param  {Object}  http
 * @return {}          
 */
think.middleware('send_error', (http, err) => {
  if(think.isPrevent(err)){
    return;
  }
  let error = think.config('error');
  if (error.log) {
    think.log(err);
  }
  if (think.cli) {
    return;
  }
  let code = error.code || 500;
  let msg = err;
  if (think.isError(err)) {
    msg = think.debug ? err.stack : err.message;
  }
  if (http.isAjax()) {
    return http.fail(code, msg);
  }else if (http.isJsonp()) {
    return http.jsonp({
      [error.key]: error.msg,
      [code]: msg
    });
  }
  http.res.statusCode = code;
  http.type('text/html; charset=' + think.config('encoding'));
  if (think.debug) {
    return http.end('<pre style="font-size:14px;line-height:20px;">' + msg + '</pre>');
  }
  http.sendTime();
  //output error file
  let readStream = fs.createReadStream(error.file);
  readStream.pipe(http.res);
  readStream.on('end', () => http.end());
})