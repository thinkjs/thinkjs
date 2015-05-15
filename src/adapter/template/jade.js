'use strict';

/**
 * jade template
 * @type {Class}
 */
var jade;

module.exports = think.adapter({
  run: function(templateFile, tVar){
    if (!jade) {
      jade = require('jade');
    }
    return this.getContent(templateFile).then(function(content){
      return jade.compile(content, {
        filename: templateFile
      })(tVar);
    })
  }
});