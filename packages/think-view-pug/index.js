/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-28 09:16:20
*/
const helper = require('think-helper');
const pug = require('pug');
const renderFile = helper.promisify(pug.renderFile, pug);

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
    this.viewData = viewData;
    this.config = helper.extend({}, defaultOptions, config);
  }

  /**
   * render view file
   */
  render() {
    const viewPath = this.config.viewPath;
    this.config.basedir = viewPath;

    if (this.config.beforeRender) {
      this.config.beforeRender(pug, this.config);
    }
    const config = Object.assign(this.config, this.viewData);
    return renderFile(this.viewFile, config);
  }
}

module.exports = Pug;
