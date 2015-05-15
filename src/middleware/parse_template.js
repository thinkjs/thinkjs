'use strict';


/**
 * parse template content
 * @param  {Object} 
 * @return {Promise}         []
 */
module.exports = think.middleware({
  run: function(data){
    var file = data.file;
    this.http.tpl_file = file;
    var engine = this.config('tpl.type') || 'base';
    var cls = think.adapter('template', engine);
    return cls().run(file, data.var);
  }
});