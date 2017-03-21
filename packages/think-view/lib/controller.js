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
      const instance = new View(this.ctx);
      instance.assign('controller', this);
      instance.assign('config', this.config());
      instance.assign('ctx', this.ctx);
      this[viewInstance] = instance;
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
    return this._getViewInstance().render(file, config);
  },
  /**
   * display view file 
   * @param {String} file 
   * @param {Object} config 
   */
  display(file, config){
    return this.render(file, config).then(content => {
      this.ctx.body = content;
    });
  }
}