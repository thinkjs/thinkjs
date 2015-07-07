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
    let engine = this.config('tpl.type') || 'base';
    let cls = think.adapter('template', engine);
    return (new cls()).run(file, data.var);
  }
}