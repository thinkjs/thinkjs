'use strict';

import handlebars from 'handlebars';

let Base = think.adapter('template', 'base');

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

    this.prerender(options, handlebars);

    let content = await this.getContent(templateFile);

    if(options.compiled || content.slice(0, 13) === '{"compiler":['){
      let data = (new Function('', `return ${content}`))();
      return handlebars.template(data)(tVar);
    }

    return handlebars.compile(content, options)(tVar);
  }
}