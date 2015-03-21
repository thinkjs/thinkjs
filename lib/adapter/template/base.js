'use strict';

var fs = require('fs');
module.exports = think.adapter({
  /**
   * get template file content
   * @return {} []
   */
  getContent: function(file){
    var deferred = Promise.defer();
    fs.readFile(file, 'utf8', function(err, content){
      if (err) {
        deferred.reject(err);
      }else{
        deferred.resolve(content);
      }
    })
    return deferred.promise;
  },
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {promise}              []
   */
  run: function(templateFile, tVar){
    return this.getContent(templateFile);
  }
})