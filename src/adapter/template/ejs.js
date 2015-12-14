'use strict';

import Base from './base.js';

/**
 * ejs template
 * @type {Class}
 */
export default class extends Base {
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}             []
   */
  async run(templateFile, tVar, config){

    let options = this.parseConfig({
      filename: templateFile,
      cache: true
    }, config);
    let ejs = await think.npm('ejs');

    this.prerender(options, ejs);

    let content = await this.getContent(templateFile);
    return ejs.compile(content, options)(tVar);
  }
}
