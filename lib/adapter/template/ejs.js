'use strict';

var ejs;

module.exports = think.adapter({
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}             []
   */
  run: function(templateFile, tVar){
    if (!ejs) {
      ejs = require('ejs');
    }
    var conf = think.extend({
      filename: templateFile,
      cache: true
    }, think.config('tpl.options'));
    return this.getContent(templateFile).then(function(content){
      return ejs.compile(content, conf)(tVar);
    })
  }
})
