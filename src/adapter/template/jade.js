'use strict';

/**
 * jade template
 * @type {Class}
 */
export default class extends think.adapter.tempalte {
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}              []
   */
  async run(templateFile, tVar){
    let jade = await think.npm('jade');
    let content = await this.getContent(templateFile);
    let options = think.extend({
      filename: templateFile
    }, think.config('tpl.options'));
    return jade.compile(content, options)(tVar);
  }
}