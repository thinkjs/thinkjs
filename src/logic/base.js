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
          type: 'number',
          validate: 'int',
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
    let config = this.config('validate');
    data.forEach(item => {
      //split to array
      ['name', 'method', 'action'].forEach(nitem => {
        if(item[nitem] && think.isString(item[nitem])){
          item[nitem] = item[nitem].split(/\s*,\s*/);
        }
      });
      item.name.forEach(nameItem => {
        let itemData = think.extend({}, item, {name: nameItem});
        //method is not contained
        if(itemData.method && itemData.method.indexOf(method) === -1){
          return;
        }
        //action is not contained
        if(item.action){
          let actions = item.action.map(actionItem => {
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
        let value = this[getValueMethod](nameItem);
        //check item data type, convert item value
        if(itemData.type){
          if(itemData.type === 'array' && !think.isArray(value)){
            value = [value];
          }else if(itemData.type === 'number' && !think.isNumber(value)){
            value = parseFloat(value) || 0;
          }else if(itemData.type === 'boolean' && !think.isBoolean(value)){
            if(value === 'false' || value === '0'){
              value = false;
            }else{
              value = !!value;
            }
          }
          this[getValueMethod](nameItem, value);
        }
        //get value from default
        if(value === ''){
          value = itemData.default || '';
          this[getValueMethod](nameItem, value);
        }
        itemData.value = value;
        itemData.required_msg = itemData.required_msg || config.required_msg;
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
    data = data || this.validate;
    if(think.isEmpty(data)){
      return;
    }
    data = this._parseValidateData(data);
    let ret = think.validate(data);
    let config = this.config('validate');
    if(!think.isEmpty(ret)){
      return this.fail(config.code, config.msg, ret);
    }
  }
  /**
   * before magic method
   * @return {Promise} []
   */
  __before(){
    return this._validate();
  }
}