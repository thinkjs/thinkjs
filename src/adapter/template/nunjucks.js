'use strict';

import nunjucks from 'nunjucks';

/**
 * nunjucks template
 * @type {Class}
 */
export default class extends think.adapter.template {
  /**
   * run
   * @param  {String} templateFile [template filepath]
   * @param  {Object} tVar         [data]
   * @return {String}              []
   */
  async run(templateFile, tVar, config){
    nunjucks.configure(think.extend({}, think.config('view.options'), config && config.options));
    return nunjucks.render(templateFile, tVar);
  }
}