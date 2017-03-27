/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-27 16:54:55
*/
const helper = require('think-helper');
const pug = require('pug');

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
    this.config.basedir = viewPath;

    if(this.config.beforeRender){
      this.config.beforeRender(pug, this.config);
    }

    let fn = helper.promisify(pug.renderFile, pug);
    return fn(this.viewFile, this.config);
  }
}


module.exports = Pug;
