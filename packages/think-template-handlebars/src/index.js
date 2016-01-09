'use strict';

import handlebars from 'handlebars';
import layouts from 'handlebars-layouts';

let Base = think.adapter('template', 'base');

/**
 * register layout helper
 */
handlebars.registerHelper(layouts(handlebars));
/**
 * handlebars template adapter
 */
export default class extends Base {
  /**
   * run
   * @param  {String} templateFile []
   * @param  {Object} tVar         []
   * @param  {Object} config       []
   * @return {Promise}              []
   */
  async run(templateFile, tVar, config){
    let options = this.parseConfig(config);

    this.prerender(options, handlebars, templateFile);

    let content = await this.getContent(templateFile);

    if(options.compiled || content.slice(0, 13) === '{"compiler":['){
      let data = (new Function('', `return ${content}`))();
      return handlebars.template(data)(tVar);
    }

    return handlebars.compile(content, options)(tVar);
  }
}