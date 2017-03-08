const helper = require('think-helper');
const path = require('path');
const assert = require('assert');

/**
 * view class
 */
class View {
  /**
   * constructor
   * @param {Object} ctx
   */
  constructor(ctx){
    this.ctx = ctx;
  }
  /**
   * 
   * @param {String | Object} name 
   * @param {Mixed} value 
   */
  assign(name, value){
    if (name === undefined) {
      return this.viewData;
    }else if (value === undefined) {
      if (helper.isString(name)) {
        return this.viewData[name];
      }else{
        for(let key in name){
          this.viewData[key] = name[key];
        }
      }
    }else{
      this.viewData[name] = value;
    }
  }
  /**
   * parse file path
   * @param {String} file
   * @param {Object} config
   */
  parseFilePath(file, config = {}) {
    if (!file || !helper.isString(file)) {
      assert(this.ctx.module, 'ctx.module required');
      assert(this.ctx.controller, 'ctx.controller required');
      assert(this.ctx.action, 'ctx.action required');
      assert(config.sep, 'config.sep required');
      file = path.join(this.ctx.module, this.ctx.controller + config.sep + this.ctx.action);
    }
    const extRegExp = /\.\w+$/;
    if (!extRegExp.test(file)) {
      assert(config.extname, 'config.extname required');
      file = file + config.extname;
    }
    if (!path.isAbsolute(file)) {
      assert(config.viewPath && helper.isString(config.viewPath), 'config.viewPath required');
      file = path.join(config.viewPath, file);
    }
    return file;
  }
  /**
   * render file
   * @param {String} file 
   * @param {Object} config 
   */
  render(file, config = {}){
    assert(config.viewPath && helper.isString(config.viewPath), 'config.viewPath required');
    assert(config.sep, 'config.sep required');
    assert(config.extname, 'config.extname required');
    assert(helper.isFunciton(config.handle), 'config.handle must be a function');
    file = this.parseFilePath(file, config);
    const handle = config.handle;
    delete config.handle;
    const instance = new handle(file, this.viewData, config);
    return Promise.resolve(instance.run());
  }
}
module.exports = View;