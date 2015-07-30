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
    let fn = think.promisify(fs.readFile, fs);
    return fn(file, 'utf8');
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