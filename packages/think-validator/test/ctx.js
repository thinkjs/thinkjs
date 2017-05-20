/*
* @Author: lushijie
* @Date:   2017-05-14 09:23:27
* @Last Modified by:   lushijie
* @Last Modified time: 2017-05-14 14:18:43
*/

let defaultCtx = {
  method: 'get',
  query: {},
  PARAM: {},
  POST: {},
  FILE: {},
  param: function(name, value) {
    if(!this.PARAM){
      this.PARAM = Object.assign({}, this.query);
    }
    if(name === undefined && value === undefined) {
      return this.PARAM;
    }
    if(helper.isObject(name)){
      this.PARAM = Object.assign(this.PARAM, name);
      return this;
    }
    assert(name && helper.isString(name), 'param.name must be a string');
    if(value === undefined){
      return this.PARAM[name];
    }
    this.PARAM[name] = value;
    return this;
  },
  post: function(name, value){
      if(!this.POST){
        this.POST = {};
      }
      if(name === undefined && value === undefined) {
        return this.POST;
      }
      if(helper.isObject(name)){
        this.POST = Object.assign(this.POST, name);
        return this;
      }
      assert(name && helper.isString(name), 'post.name must be a string');
      if(value === undefined){
        return this.POST[name];
      }
      this.POST[name] = value;
      return this;
  },
  file(name, value){
    if(!this.FILE){
      this.FILE = {};
    }
    if(helper.isObject(name)){
      this.FILE = Object.assign(this.FILE, name);
      return this;
    }
    assert(name && helper.isString(name), 'file.name must be a string');
    if(value === undefined){
      return this.FILE[name];
    }
    this.FILE[name] = value;
    return this;
  },
};

module.exports = defaultCtx;
