/*
* @Author: lushijie
* @Date:   2017-03-10 09:38:38
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-11 11:31:31
*/
const helper = require('think-helper');
const path = require('path');
const handlebars = require('handlebars');
const fs = require('fs');
const assert = require('assert');


class Handlebars {
    constructor(templateFile, viewData, config) {
      this.templateFile = templateFile;
      this.viewData = viewData;
      this.config = config;
    }

    _getContent(templateFile, viewPath) {
      if(!path.isAbsolute(templateFile)){
        templateFile = path.join(viewPath, templateFile);
      }
      return new Promise((resolve, reject) => {
        fs.readFile(templateFile, 'utf8', (err, data) => {
          err ? reject(err) : resolve(data);
        });
      });
    }

    render() {
      if(this.config.beforeRender){
        assert(helper.isFunction(this.config.beforeRender), 'config.beforeRender must be a function');
        this.config.beforeRender(handlebars, this.config);
      }
      return new Promise((resolve, reject) => {
        this._getContent(this.templateFile, this.config.viewPath).then((data) => {
          let output = handlebars.compile(data, this.config)(this.viewData);
          resolve(output);
        }, (err) => {
          reject(err);
        });
      });
    }
}



let context = {
  'title': 123,
  'body': 'Hello World',
  'students':[
    {'name' : 'John', 'passingYear' : 2013},
    {'name' : 'Doe' , 'passingYear' : 2016}
  ]
};
let viewPath = path.join(__dirname, 'test/views');
let hdb = new Handlebars('test.tpl', context, {viewPath: viewPath})

hdb.render().then(function(data) {
  console.log(data);
});

module.exports = Handlebars;
