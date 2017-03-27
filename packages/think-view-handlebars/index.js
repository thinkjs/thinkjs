/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-27 17:08:45
*/
const helper = require('think-helper');
const handlebars = require('handlebars');
const fs = require('fs');
const readFile = helper.promisify(fs.readFile, fs);
let cacheFn = {};

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
     * @param {Object} config options for handlebars
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
      let viewFile = this.viewFile;

      if(this.config.beforeRender){
        this.config.beforeRender(handlebars, this.config);
      }

      if(this.config.cache && cacheFn[viewFile]) {
        return Promise.resolve(cacheFn[viewFile](this.viewData));
      }

      return readFile(viewFile, 'utf8').then((data) => {
        let compileFn = handlebars.compile(data, this.config);
        if(this.config.cache) {
          cacheFn[viewFile] = compileFn;
        }
        return compileFn(this.viewData);
      });
    }
}

module.exports = Handlebars;
