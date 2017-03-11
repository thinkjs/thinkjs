/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-10 19:11:59
*/
const helper = require('think-helper');
const path = require('path');
const nunjucks = require('nunjucks');
const assert = require('assert');

/**
 * default options for nunjucks
 * all available options via https://mozilla.github.io/nunjucks/api.html#configure
 */
const defaultOptions = {
  autoescape: true,
  watch: false,
  noCache: false,
  throwOnUndefined: false
};

/**
 * nunjucks view adapter
 */
class Nunjucks {
  /**
   * constructor
   * @param {String} viewFile view file, an absolute file path
   * @param {Object} viewData view data for render file
   * @param {Object} config options for nunjucks
   */
  constructor(viewFile, viewData, config) {
    this.viewFile = viewFile;
    this.viewData = viewData;
    this.config = helper.extend({}, defaultOptions, config);
  }
  /**
   * render view file
   */
  render(){
    let env, viewPath = this.config.viewPath;
    assert(viewPath && helper.isString(viewPath), 'config.viewPath required and must be a string');

    const viewFile = this.viewFile;
    if(path.isAbsolute(viewFile) && viewFile.indexOf(viewPath) !== 0 ){
      env = nunjucks.configure(this.config);
    }else{
      env = nunjucks.configure(viewPath, this.config);
    }

    const beforeRender = this.config.beforeRender;
    if(beforeRender){
      assert(helper.isFunction(beforeRender), 'config.beforeRender must be a function');
      beforeRender(env, nunjucks, this.config);
    }

    return new Promise((resolve, reject) => {
      env.render(viewFile, this.viewData, (err, res) => {
        return err ? reject(err) : resolve(res);
      });
    });
  }
}

module.exports = Nunjucks;
