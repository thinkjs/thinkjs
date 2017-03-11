/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-11 13:05:03
*/
const helper = require('think-helper');
const path = require('path');
const nunjucks = require('nunjucks');
const assert = require('assert');

const defaultOptions = {
  autoescape: true,
  watch: false,
  noCache: false,
  throwOnUndefined: false
};

class Nunjucks {
  constructor(templateFile, viewData, config) {
    this.templateFile = templateFile;
    this.viewData = viewData;
    this.config = helper.extend({}, defaultOptions, config);
  }
  render(){
    let env, viewPath = this.config.viewPath;
    assert(viewPath && helper.isString(viewPath), 'config.viewPath required');

    if(path.isAbsolute(this.templateFile) && this.templateFile.indexOf(viewPath) !== 0 ){
      env = nunjucks.configure(this.config);
    }else{
      env = nunjucks.configure(viewPath, this.config);
    }

    if(this.config.beforeRender){
      assert(helper.isFunction(this.config.beforeRender), 'config.beforeRender must be a function');
      this.config.beforeRender(env, nunjucks, this.config);
    }

    return new Promise((resolve, reject) => {
      env.render(this.templateFile, this.viewData, (err, res) => {
        return err ? reject(err) : resolve(res);
      });
    })
  }
}

module.exports = Nunjucks;
