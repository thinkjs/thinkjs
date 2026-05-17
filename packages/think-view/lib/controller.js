const View = require('./view.js');
const helper = require('think-helper');

const viewInstance = Symbol('think-view-instance');
const getViewInstance = Symbol('think-get-view-instance');

/**
 * add some methods for controller
 */
module.exports = {
  /**
   * get view instance
   */
  [getViewInstance]() {
    if (!this[viewInstance]) {
      const instance = new View(this.ctx);
      instance.assign('controller', this); // controller
      instance.assign('config', this.config()); // config
      instance.assign('ctx', this.ctx); // context
      this.ctx.app.emit('viewInit', instance, this); // pass view controller
      this[viewInstance] = instance;
    }
    return this[viewInstance];
  },
  /**
   * 
   * @param {String} name 
   * @param {Mixed} value 
   */
  assign(name, value) {
    return this[getViewInstance]().assign(name, value);
  },
  /**
   * render view file
   * @param {String} file 
   * @param {Mixed} config 
   */
  render(file, config) {
    if (helper.isObject(file)) {
      config = file;
      file = '';
    }
    config = helper.parseAdapterConfig(this.config('view'), config);
    return this[getViewInstance]().render(file, config);
  },
  /**
   * display view file 
   * @param {String} file 
   * @param {Object} config 
   */
  display(file, config) {
    return this.render(file, config).then(content => {
      this.ctx.body = content;
    }).then(() => false);
  }
};
