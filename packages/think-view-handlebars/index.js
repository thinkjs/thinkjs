/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-10 15:33:46
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
    this.config = helper.extend(defaultOptions, config);
  }
  run(){
    let env;

    if(path.isAbsolute(this.templateFile) && this.templateFile.indexOf(this.config.viewPath) !== 0 ){
      env = nunjucks.configure(this.config);
    }else{
      assert(this.config.viewPath && helper.isString(this.config.viewPath), 'config.viewPath required');
      env = nunjucks.configure(this.config.viewPath, this.config);
    }

    if(helper.isFunction(this.config.beforeRender)){
      this.config.beforeRender(this.config, nunjucks, env);
    }

    return new Promise((resolve, reject) => {
      nunjucks.render(this.templateFile, this.viewData, (err, res) => {
        return err ? reject(err) : resolve(res);
      });
    });
  }
}

module.exports = Nunjucks;
