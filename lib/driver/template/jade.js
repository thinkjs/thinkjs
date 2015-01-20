/**
 * jade模版引擎
 * expressjs默认为该模版引擎
 * @type {[type]}
 */
var jade = require('jade');

module.exports = {
  fetch: function(templateFile, tVar){
    'use strict';
    var content = getFileContent(templateFile);
    var fn = jade.compile(content, {
      filename: templateFile
    });
    var html = fn(tVar);
    return html;
  }
};