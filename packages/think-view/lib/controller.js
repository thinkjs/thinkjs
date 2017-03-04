const View = require('./view.js');
const helper = require('think-helper');

const viewInstance = Symbol('think@viewInstance');

/**
 * add some methods for controller
 */
module.exports = {
  /**
   * get view instance
   */
  _getViewInstance(){
    if(!this[viewInstance]){
      this[viewInstance] = new View(this.ctx);
    }
    return this[viewInstance];
  },
  /**
   * 
   * @param {String} name 
   * @param {Mixed} value 
   */
  assign(name, value){
    return this._getViewInstance().assign(name, value);
  },
  /**
   * render view file
   * @param {String} file 
   * @param {Mixed} config 
   */
  render(file, config){
    if(helper.isObject(file)){
      config = file;
      file = '';
    }
    config = helper.parseAdapterConfig(this.config('view'), config);
    return this._getViewInstance().render(file, config).then(content => {
      this.ctx.body = content;
    });
  }
}