'use strict';

var ejs = require('ejs');

module.exports = think.template({
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}             []
   */
  run: function(templateFile, tVar){
    var conf = extend({
      filename: templateFile,
      cache: true
    }, this.config('tpl.options'));
    return this.getContent(templateFile).then(function(content){
      return ejs.compile(content, conf)(tVar);
    })
  }
})
