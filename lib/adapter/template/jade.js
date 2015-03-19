'use strict';

/**
 * jade template
 * @type {Class}
 */
var jade = require('jade');

module.exports = think.template({
  run: function(templateFile, tVar){
    return this.getContent(templateFile).then(function(content){
      return jade.compile(content, {
        filename: templateFile
      })(tVar);
    })
  }
});