/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-07-19 12:35:24
*/
const helper = require('think-helper');
const handlebars = require('handlebars');
const fs = require('fs');
const readFile = helper.promisify(fs.readFile, fs);
const cacheFn = {};

/**
 * handlebars default render options
 * more options see at http://handlebarsjs.com/reference.html
 */
const defaultOptions = {
  compat: true,
  strict: false,
  preventIndent: true,
  ignoreStandalone: true,
  cache: false // disable template cache by default
};

/**
 * handlebars view adapter
 */
class Handlebars {
  /**
     * constructor
     * @param {String} viewFile view file, the template file path
     * @param {Object} viewData view data for render file
     * @param {Object} config for handlebars
     */
  constructor(viewFile, viewData, config) {
    this.viewFile = viewFile;
    this.viewData = viewData;
    this.config = config;
    this.handleConfig = helper.extend({}, defaultOptions, config.options);
  }

  /**
     * render view file
     */
  render() {
    const viewFile = this.viewFile;

    if (this.config.beforeRender) {
      this.config.beforeRender(handlebars, this.handleConfig);
    }

    if (this.handleConfig.cache && cacheFn[viewFile]) {
      return Promise.resolve(cacheFn[viewFile](this.viewData));
    }

    return readFile(viewFile, 'utf8').then((data) => {
      const compileFn = handlebars.compile(data, this.handleConfig);
      if (this.handleConfig.cache) {
        cacheFn[viewFile] = compileFn;
      }
      return compileFn(this.viewData);
    });
  }
}

module.exports = Handlebars;
