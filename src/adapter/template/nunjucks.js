'use strict';

import Base from './base.js';

/**
 * nunjucks template
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
      autoescape: false,
      watch: false,
      noCache: false,
      throwOnUndefined: false
    }, config);
    let nunjucks = await think.npm('nunjucks');
    let env = nunjucks.configure(think.ROOT_PATH, options);

    this.prerender(options, nunjucks, env);

    return nunjucks.render(templateFile, tVar);
  }
}