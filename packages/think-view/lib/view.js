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
  constructor(ctx) {
    this.ctx = ctx;
    this.viewData = {};
  }
  /**
   *
   * @param {String | Object} name
   * @param {Mixed} value
   */
  assign(name, value) {
    if (name === undefined) {
      return this.viewData;
    } else if (value === undefined) {
      if (helper.isString(name)) {
        return this.viewData[name];
      } else {
        for (const key in name) {
          this.viewData[key] = name[key];
        }
      }
    } else {
      this.viewData[name] = value;
    }
  }
  /**
   * parse file path
   * @param {String} file
   * @param {Object} config
   */
  parseFilePath(file, config = {}) {
    if (!file) {
      // can not assert ctx.module, ctx.module may be empty

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
      assert(config.viewPath && helper.isString(config.viewPath) && path.isAbsolute(config.viewPath), 'config.viewPath required an absolute path');
      file = path.join(config.viewPath, file);
    }
    return file;
  }
  /**
   * render file
   * @param {String} file
   * @param {Object} config
   */
  render(file, config = {}) {
    assert(helper.isFunction(config.handle), 'config.handle must be a function');
    file = this.parseFilePath(file, config);
    if (config.beforeRender) {
      assert(helper.isFunction(config.beforeRender), 'config.beforeRender must be a function');
    }
    const Handle = config.handle;
    const instance = new Handle(file, this.viewData, config);
    return Promise.resolve(instance.render());
  }
}
module.exports = View;
