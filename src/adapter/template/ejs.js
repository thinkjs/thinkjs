'use strict';
/**
 * ejs template
 * @type {Class}
 */
export default class extends think.adapter.template {
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}             []
   */
  async run(templateFile, tVar, config){
    let ejs = await think.npm('ejs');
    let conf = think.extend({
      filename: templateFile,
      cache: true
    }, think.config('tpl.options'), config && config.options);
    let content = await this.getContent(templateFile);
    return ejs.compile(content, conf)(tVar);
  }
}
