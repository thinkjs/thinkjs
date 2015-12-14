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
   * @return {Promise}             []
   */
  async run(templateFile, tVar, config) {
    let options = this.parseConfig({
      filename: templateFile
    }, config);
    let jade = await think.npm('jade');

    this.prerender(options, jade);

    if (options.cache_compile) {
      let compile = thinkCache(thinkCache.VIEW_CONTENT, templateFile + '-compile');
      if (compile) {
        return compile(tVar);
      }
    }

    let content = await this.getContent(templateFile);
    let compile = jade.compile(content, options);

    if (options.cache_compile) {
      thinkCache(thinkCache.VIEW_CONTENT, templateFile + '-compile', compile);
    }

    return compile(tVar);
  }
}