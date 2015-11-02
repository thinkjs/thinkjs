'use strict';

/**
 * html cache
 */
export default class extends think.middleware.base {
  /**
   * run
   * @return {} []
   */
  async run(content){
    let config = this.config('html_cache');
    if(!config || !config.on || think.isEmpty(config.rules)){
      return content;
    }
    
  }
}