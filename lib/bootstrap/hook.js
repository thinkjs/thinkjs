'use strict';

var fs = require('fs');

/**
 * parse payload
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('parsePayload', function(http){
  if (!http.payload) {
    return;
  }
  var types = http.config.post.json_content_type;
  if (!think.isArray(types)) {
    types = [types];
  }
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
think.middleware('outputResource', function(http, file){
  var stream = fs.createReadStream(file);
  stream.pipe(http.res);
  stream.on('end', function(){
    http.res.end();
  });
})
/**
 * clean pathname
 * @param  {Object} http
 * @return {}         []
 */
think.middleware('cleanPathname', function(http){
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