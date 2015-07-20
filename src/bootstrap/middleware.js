'use strict';

import fs from 'fs';

/**
 * parse payload
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('parse_json_payload', http => {
  if (!http.payload) {
    return;
  }
  let types = http.config('post.json_content_type');
  if (types.indexOf(http.contentType) > -1) {
    try{
      http._post = JSON.parse(http.payload);
    }catch(e){}
  }
});
/**
 * output file
 * @param  {Object} http    []
 * @param  {String} file [file path]
 * @return {}         []
 */
think.middleware('output_resource', (http, file) => {
  let deferred = think.defer();
  let stream = fs.createReadStream(file);
  stream.pipe(http.res);
  stream.on('end', () => {
    http.end();
    deferred.resolve(file);
  });
  stream.on('error', err => {
    deferred.reject(err);
  });
  return deferred.promise;
});
/**
 * rewrite pathname, remove prefix & suffix
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('rewrite_pathname', http => {
  let pathname = http.pathname;
  if (!pathname) {
    return;
  }
  let prefix = http.config('pathname_prefix');
  if (prefix && pathname.indexOf(prefix) === 0) {
    pathname = pathname.substr(prefix.length);
  }
  let suffix = http.config('pathname_suffix');
  if (suffix && pathname.substr(0 - suffix.length) === suffix) {
    pathname = pathname.substr(0, pathname.length - suffix.length);
  }
  http.pathname = pathname;
});
/**
 * sub domain deploy
 * @param  {Object} http){} 
 * @return {}
 */
think.middleware('subdomain_deploy', http => {
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
});
/**
 * send error message
 * @param  {Object}  http
 * @return {}          
 */
think.middleware('send_error', (http, err) => {
  if(think.isPrevent(err)){
    return;
  }
  let error = http.config('error');
  if (error.log) {
    think.log(err);
  }
  if (think.cli) {
    return;
  }
  let code = error.code || 500;
  let msg = err;
  if (think.isError(err)) {
    msg = error.detail ? err.stack : err.message;
  }
  if (http.isAjax()) {
    return http.fail(code, msg);
  }else if (http.isJsonp()) {
    return http.jsonp({
      [error.key]: code,
      [error.msg]: msg
    });
  }
  http.res.statusCode = code;
  http.type('text/html; charset=' + http.config('encoding'));
  if (error.detail) {
    return http.end(`<pre style="font-size:14px;line-height:20px;">${msg}</pre>`);
  }
  return think.hook('resource_output', http, error.file);
});