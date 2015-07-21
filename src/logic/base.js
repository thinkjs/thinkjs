'use strict';

/**
 * base logic
 * inherits from base controller
 * @type {Class}
 */
export default class extends think.controller.base {
  /**
   * check auth
   * @return {Promise} []
   */
  auth(){

  }
  /**
   * parse validate data
   * [
   *   {
          name: 'name,pwd',
          required: true,
          type: 'int',
          msg: '',
          default: 1000,
          args: [],
          method: 'post,get',
          get: 'post',
          action: 'home/group/detail'
        }
   * ]
   * @param  {Array}  data []
   * @return {Array}      []
   */
  _parseValidateData(data = []){
    let result = [];
    let http = this.http;
    let method = this.method();
    data.forEach(item => {
      //split to array
      ['name', 'method', 'action'].forEach(nitem => {
        if(item[nitem] && think.isString(item[nitem])){
          item[nitem] = item[nitem].split(/\s*,\s*/);
        }
      });
      item.name.forEach(nameItem => {
        let itemData = think.extend(item, {name: nameItem});
        //method is not contained
        if(itemData.method && itemData.method.indexOf(method) === -1){
          return;
        }
        //action is not contained
        if(item.action){
          let actions = item.aciton.map(actionItem => {
            actionItem = actionItem.split('/');
            let action = actionItem.pop();
            let controller = actionItem.pop() || http.controller;
            let module = actionItem.pop() || http.module;
            return `${module}/${controller}/${action}`;
          });
          let action = `${http.module}/${http.controller}/${http.action}`;
          if(actions.indexOf(action) === -1){
            return;
          }
        }
        //get how to fetch data
        let getValueMethod = itemData.get;
        if(!getValueMethod){
          let methods = ['post', 'put', 'patch'];
          getValueMethod = methods.indexOf(method) > -1 ? 'post' : 'get';
        }
        //add method for set default value
        itemData.get = getValueMethod === 'get' ? 'get' : 'post';
        if(think.isFunction(itemData.default)){
          itemData.default = itemData.default(itemData);
        }
        let value = this[getValueMethod](nameItem) || itemData.default || '';
        itemData.value = value;
        result.push(itemData);
      });
    });
    return result;
  }
  /**
   * validate data
   * @param  {Object} data      []
   * @param  {String} validType []
   * @return {}           []
   */
  _validate(data) {
    data = this._parseValidateData(data || this.validate);
    let ret = think.validate(data);
    if(!think.isEmpty(ret)){
      return this.fail(400, '', ret);
    }
    //set default value
    data.forEach(item => {
      if(item.default && item.get){
        this[item.get](item.name, item.value);
      }
    });
  }
  /**
   * before magic method
   * @return {Promise} []
   */
  __before(){
    return this._validate();
  }
}