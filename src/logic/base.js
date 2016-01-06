'use strict';

/**
 * base logic
 * inherits from base controller
 * @type {Class}
 */
export default class extends think.controller.base {
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

      let method = this.http.method.toLowerCase();
      if(itemData.get){
        method = 'get';
        delete itemData.get;
      }else if(itemData.file){
        method = 'file';
        itemData.object = true; //when type is file, set data type to `object`
        delete itemData.file;
      }
      itemData._method = method;
      itemData.value = this[method](name);

      let flag = allowTypes.some(item => {
        return itemData[item];
      });
      if(!flag){
        itemData.string = true;
      }
      
      result[name] = itemData;
    }
    return result;
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
      this[method](name, values[name]);
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
    if(think.isEmpty(this.rules) || this._validateInvoked){
      return;
    }
    let flag = this.validate(this.rules);
    if(!flag){
      let error = this.config('error');
      return this.fail(error.validate_errno, this.errors());
    }
  }
}