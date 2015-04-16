'use strict';

var fs = require('fs');

/**
 * parse payload
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('parse_json_payload', function(http){
  if (!http.payload) {
    return;
  }
  var types = http.config.post.json_content_type;
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
think.middleware('output_resource', function(http, file){
  var stream = fs.createReadStream(file);
  stream.pipe(http.res);
  stream.on('end', function(){
    http.res.end();
  });
})
/**
 * rewrite pathname, remove prefix & suffix
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('rewrite_pathname', function(http){
  var pathname = http.pathname;
  if (!pathname) {
    return;
  }
  var prefix = think.config('pathname_prefix');
  if (prefix && pathname.indexOf(prefix) === 0) {
    pathname = pathname.substr(prefix.length);
  }
  var suffix = think.config('pathname_suffix');
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
think.middleware('subdomain_deploy', function(http){
  var subdomain = http.config('subdomain');
  if (think.isEmpty(subdomain)) {
    return;
  }
  var hostname = http.hostname.split('.')[0];
  var value = subdomain[hostname];
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
think.middleware('send_error', function(http, err){
  var error = think.config('error');
  if (error.log) {
    think.log(err);
  }
  if (think.mode === 'cli') {
    return;
  }
  var code = error.code || 500;
  var msg = err;
  if (think.isError(err)) {
    msg = think.debug ? err.stack : err.message;
  }
  if (http.isAjax()) {
    return http.fail(code, msg);
  }else if (http.isJsonp()) {
    var key = [error.key, error.msg];
    var value = [code, msg];
    return http.jsonp(think.getObject(key, value));
  }
  http.res.statusCode = code;
  http.type('text/html; charset=' + think.config('encoding'));
  if (think.debug) {
    return http.end('<pre style="font-size:14px;line-height:20px;">' + msg + '</pre>');
  }
  http.sendTime();
  var readStream = fs.createReadStream(error.file);
  readStream.pipe(http.res);
  readStream.on('end', function(){
    http.res.end();
  });
})