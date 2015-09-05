'use strict';


/**
 * parse template content
 * @param  {Object} 
 * @return {Promise}         []
 */
export default class extends think.middleware.base {
  /**
   * run
   * @param  {Object} data [render template data]
   * @return {Promise}      []
   */
  run(data){
    let file = data.file;
    this.http.tpl_file = file;
    let config = data.config || {};
    let engine = config.type || this.config('view.type') || 'base';
    let Cls = think.adapter('template', engine);
    let instance = new Cls();
    return instance.run(file, data.var, config);
  }
}