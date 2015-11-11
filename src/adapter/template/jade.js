'use strict';

import Base from './base.js';

/**
 * jade template
 * @type {Class}
 */
export default class extends Base {
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}              []
   */
  async run(templateFile, tVar, config){

    let options = this.parseConfig({
      filename: templateFile
    }, config);
    let jade = await think.npm('jade');

    this.prerender(options, jade);

    let content = await this.getContent(templateFile);
    return jade.compile(content, options)(tVar);
  }
}