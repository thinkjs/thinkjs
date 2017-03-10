/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-10 10:13:04
*/
const helper = require('think-helper');
const path = require('path');

class Nunjucks {
  constructor(templateFile, viewData, config) {
    this.templateFile = templateFile;
    this.viewData = viewData;
    this.config = config;
  }

  run(){
    let options = helper.extend({
      autoescape: true,
      watch: false,
      noCache: false,
      throwOnUndefined: false
    }, this.config);

    let nunjucks = require('nunjucks');

    let env;
    if(options.root_path){
      //if templateFile not start with root_path, can not set root_path
      if(path.isAbsolute(this.templateFile) && this.templateFile.indexOf(options.root_path) !== 0){
        env = nunjucks.configure(options);
      }else{
        env = nunjucks.configure(options.root_path, options);
      }
    }else{
      env = nunjucks.configure(options);
    }

    //env.addGlobal('think', think);
    env.addGlobal('JSON', JSON);
    env.addGlobal('eval', eval);

    if(helper.isFunction(options.prerender)){
      options.prerender(options, nunjucks, env);
    }

    return new Promise((resolve, reject) => {
      nunjucks.render(this.templateFile, this.viewData, (err, res) => {
        return err ? reject(err) : resolve(res);
      });
    });
  }
}
