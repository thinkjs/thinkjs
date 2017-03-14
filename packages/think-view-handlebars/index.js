/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-14 09:44:28
*/
const helper = require('think-helper');
const path = require('path');
const handlebars = require('handlebars');
const fs = require('fs');
const assert = require('assert');
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
     * get file content by absolute file path
     */
    _getContent(absolutePath) {
      return new Promise((resolve, reject) => {
        fs.readFile(absolutePath, 'utf8', (err, data) => {
          err ? reject(err) : resolve(data);
        });
      });
    }

    /**
     * render view file
     */
    render() {
      let viewPath = this.config.viewPath;
      assert(viewPath && helper.isString(viewPath), 'config.viewPath required and must be a string');

      if(this.config.beforeRender){
        assert(helper.isFunction(this.config.beforeRender), 'config.beforeRender must be a function');
        this.config.beforeRender(handlebars, this.config);
      }

      let absolutePath = this.viewFile;
      if(!path.isAbsolute(absolutePath)){
        absolutePath = path.join(viewPath, absolutePath);
      }

      if(this.config.cache && cacheFn[absolutePath]) {
        return Promise.resolve(cacheFn[absolutePath](this.viewData));
      }

      return new Promise((resolve, reject) => {
        this._getContent(absolutePath).then((data) => {
          let compileFn = handlebars.compile(data, this.config);
          let output = compileFn(this.viewData);
          if(this.config.cache) {
            cacheFn[absolutePath] = compileFn;
          }
          resolve(output);
        }, (err) => {
          reject(err);
        });
      });
    }
}

module.exports = Handlebars;
