'use strict';

/**
 * jade template
 * @type {Class}
 */
export default class extends think.adapter.template {
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}              []
   */
  async run(templateFile, tVar, config){
    let jade = await think.npm('jade');
    let content = await this.getContent(templateFile);
    let options = think.extend({
      filename: templateFile
    }, think.config('view.options'), config && config.options);
    return jade.compile(content, options)(tVar);
  }
}