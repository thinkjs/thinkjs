'use strict';

/**
 * base logic
 * inherits from base controller
 * @type {Class}
 */
export default class extends think.controller.base {
  /**
   * get validate method
   * @return {} []
   */
  _getValidateItemMethod(itemData){
    let list = ['get', 'post', 'file'];
    for(let i = 0, length = list.length; i < length; i++){
      let item = list[i];
      if(itemData[list[i]]){
        delete itemData[item];
        return item;
      }
    }
    //for rest request
    let method = this._isRest && this._method;
    if(method){
      method = this.get(method);
    }
    if(!method){
      method = this.http.method.toLowerCase();
    }
    if(method === 'put' || method === 'patch'){
      return 'post';
    }
    if(list.indexOf(method) > -1){
      return method;
    }
    return 'post';
  }
  /**
   * parse validate data
   * {
   *   name: 'required|int|min:10|max:20',
   *   title: 'length:10,20|default:welefen|get',
   *   emai: 'required|email:{}',
   *   ids: 'required|array|int'
   * }
   * @param  {Array}  data []
   * @return {Array}      []
   */
  _parseValidateData(data = {}){
    let result = {};
    let allowTypes = ['boolean', 'int', 'float', 'string', 'array', 'object'];
    for(let name in data){

      let itemData = data[name];
      if(think.isString(itemData)){
        itemData = think.validate.parse(itemData);
      }else{
        itemData = think.extend({}, itemData);
      }

      let method = this._getValidateItemMethod(itemData);
      if(method === 'file'){
        itemData.object = true;
      }
      itemData._method = method;
      //ignore set itemData.value when aleady has it
      if(!('value' in itemData)){
        itemData.value = this[method](name);
      }
      
      let flag = allowTypes.some(item => {
        return item in itemData;
      });
      if(!flag){
        itemData.string = true;
      }
      
      result[name] = itemData;
    }
    return result;
  }
  /**
   * merge clean rules(only value)
   * @param  {Object} rules []
   * @return {Object}       []
   */
  _mergeCleanRules(rules){
    let listData = [this.post(), this.get()];
    let methods = ['post', 'get'];
    listData.forEach((item, index) => {
      for(let key in item){
        if(!rules[key]){
          rules[key] = {
            value: item[key],
            _method: methods[index]
          };
        }
      }
    });
    return rules;
  }
  /**
   * validate data
   * this.validate({
   *   welefen: 'required|length:4,20|alpha',
   *   email: 'required|email',
   *   title: 'required|maxLength:10000'
   * })
   * @param  {Object} data      []
   * @return {}           []
   */
  validate(rules) {
    this._validateInvoked = true;
    if(think.isEmpty(rules)){
      return true;
    }
    rules = this._parseValidateData(rules);
    rules = this._mergeCleanRules(rules);

    let methods = {};
    for(let name in rules){
      methods[name] = rules[name]._method;
      delete rules[name]._method;
    }

    let ret = think.validate(rules, this.locale());
    if(!think.isEmpty(ret)){
      this.assign('errors', ret);
      return false;
    }

    //set values
    let values = think.validate.values(rules);
    for(let name in values){
      let method = methods[name];
      let value = values[name];
      if(value !== '' && (typeof value !== 'number' || !isNaN(value))){
        this[method](name, value);
      }
    }

    return true;
  }
  /**
   * get validate errors
   * @return {Object} []
   */
  errors() {
    return this.assign('errors');
  }
  /**
   * auto validate
   * @return {} []
   */
  __after(){
    let error = this.config('error');
    
    //check request method
    let allowMethods = this.allowMethods;
    if(!think.isEmpty(allowMethods)){
      if(think.isString(allowMethods)){
        allowMethods = allowMethods.split(',');
      }
      let method = this.http.method.toLowerCase();
      if(allowMethods.indexOf(method) === -1){
        return this.fail(error.validate_errno, this.locale('METHOD_NOT_ALLOWED')); 
      }
    }

    //check rules
    if(think.isEmpty(this.rules) || this._validateInvoked){
      return;
    }
    let flag = this.validate(this.rules);
    if(!flag){
      return this.fail(error.validate_errno, this.errors());
    }
  }
}