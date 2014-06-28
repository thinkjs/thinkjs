/**
 * ejs
 * https://github.com/visionmedia/ejs
 * @type {[type]}
 */
var ejs = require('ejs');
module.exports = {
  fetch: function(templateFile, tVar){
    'use strict';
    var content = getFileContent(templateFile);
    var conf = extend({
      filename: templateFile,
      cache: true
    }, C('tpl_engine_config'));
    return  ejs.compile(content, conf)(tVar);     
  }
};