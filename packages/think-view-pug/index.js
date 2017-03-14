/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-14 14:20:41
*/
const helper = require('think-helper');
const path = require('path');
const pug = require('pug');
const assert = require('assert');

/**
 * pug default render options
 * more options see at https://pugjs.org/api/reference.html
 */
const defaultOptions = {
  cache: false,
  debug: false
};

/**
 * pug view adapter
 */
class Pug {
  /**
   * constructor
   * @param {String} viewFile view file
   * @param {Object} viewData view data for render file
   * @param {Object} config options for pug
   */
  constructor(viewFile, viewData, config) {
    this.viewFile = viewFile;
    this.config = helper.extend({}, defaultOptions, config, viewData);
  }

  /**
   * render view file
   */
  render() {
    let viewPath = this.config.viewPath;
    assert(viewPath && helper.isString(viewPath), 'config.viewPath required and must be a string');
    this.config.basedir = viewPath;

    if(this.config.beforeRender){
      assert(helper.isFunction(this.config.beforeRender), 'config.beforeRender must be a function');
      this.config.beforeRender(pug, this.config);
    }

    let absolutePath = this.viewFile;
    if(!path.isAbsolute(absolutePath)){
      absolutePath = path.join(viewPath, absolutePath);
    }

    let fn = helper.promisify(pug.renderFile, pug);
    return fn(absolutePath, this.config);
  }
}


module.exports = Pug;
