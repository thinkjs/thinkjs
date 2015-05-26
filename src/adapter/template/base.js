'use strict';

import fs from 'fs';

/**
 * template base class
 * @type {Class}
 */
export default class {
  /**
   * get template file content
   * @return {} []
   */
  getContent(file){
    let deferred = think.defer();
    fs.readFile(file, 'utf8', (err, content) => {
      if (err) {
        deferred.reject(err);
      }else{
        deferred.resolve(content);
      }
    })
    return deferred.promise;
  }
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {promise}             []
   */
  run(templateFile){
    return this.getContent(templateFile);
  }
}