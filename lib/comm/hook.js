'use strict';

var fs = require('fs');

var hook = module.exports = {};
/**
 * parse post pay load
 * @param  {Object} http []
 * @return {void}      []
 */
hook.parsePayLoad = function(http){
  var types = http.config.post_json_content_type;
  if (!isArray(types)) {
    types = [types];
  }
  if (http.payload && types.indexOf(http.contentType) > -1) {
    try{
      http.post = JSON.parse(http.payload);
    }catch(e){}
  }
}
/**
 * close db connect
 * @param  {Object} http []
 * @return {void}      []
 */
hook.closeDb = function(http){
  var autoClose = http.config.db.auto_close;
  if (autoClose) {
    think.require('model').close();
  }
}
/**
 * output resource
 * @param  {mixed} http     []
 * @param  {String} filename []
 * @return {void}          []
 */
hook.outputResource = function(http, filename){
  var stream = fs.createReadStream(file);
  stream.pipe(http.res);
  stream.on('end', function(){
    http.res.end();
  });
}
/**
 * clean pathname
 * remove prefix & suffix
 * @param  {String} pathname [http pathname]
 * @return {String}          [cleaned pathname]
 */
hook.cleanPathname = function(http){
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
}