'use strict';

var ejs;

export default class extends think.adapter.template {
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @return {Promise}             []
   */
  async run(templateFile, tVar){
    if (!ejs) {
      ejs = require('ejs');
    }
    let conf = think.extend({
      filename: templateFile,
      cache: true
    }, think.config('tpl.options'));
    let content = await this.getContent(templateFile);
    return ejs.compile(content, conf)(tVar);
  }
}
