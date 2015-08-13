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
  checkAuth(){

  }
  /**
   * check csrf
   * @todo  move to csrf middleware
   * @todo write value for ajax request
   * @return {Promise} []
   */
  // async checkCsrf(){
  //   let csrf = this.config('csrf');
  //   if(!csrf.on){
  //     return;
  //   }
  //   if(this.isGet()){
  //     let value = await this.session(csrf.session_name);
  //     if(!value){
  //       value = think.uuid(32);
  //       await this.session(csrf.session_name, value);
  //     }
  //     this.assign(csrf.form_name, value);
  //   }else if(this.isPost()){
  //     let value = await this.session(csrf.session_name);
  //     let formValue = this.post(csrf.form_name);
  //     if(!value || formValue !== value){
  //       return this.fail(csrf.errno, csrf.errmsg);
  //     }
  //   }
  // }
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
    for(let name in data){
      let rules = data[name].split('|');
      let itemData = {};
      rules.forEach(item => {
        if(!item){
          return;
        }
        let pos = item.indexOf(':');
        if(pos > -1){
          let name = item.substr(0, pos);
          let args = item.substr(pos + 1).trim();
          if(args[0] === '{' || args[0] === '['){
            args = [(new Function('', `return ${args}`))()];
          }else{
            args = args.split(/\s*,\s*/);
          }
          itemData[name] = args;
        }else{
          itemData[item] = true;
        }
      });
      let method = this.http.method.toLowerCase();
      if(itemData.get){
        method = 'get';
        delete itemData.get;
      }else if(itemData.file){
        method = 'file';
        delete itemData.file;
      }
      let value = this[method](name);
      
      if(!value && itemData.default){
        value = itemData.default;
      }
      delete itemData.default;

      if(itemData.int && !itemData.array){
        value = parseInt(value, 10);
      }else if(itemData.float && !itemData.array){
        value = parseFloat(value);
      }else if(itemData.array){
        if(!think.isArray(value)){
          value = think.isString(value) ? value.split(/\s*,\s*/) : [value];
        }
        value = value.map(itemValue => {
          if(itemData.int){
            return parseInt(itemValue, 10);
          }else if(itemData.float){
            return parseFloat(itemValue);
          }
          return itemValue;
        });
      }else if(itemData.boolean){
        if(!think.isBoolean(value)){
          value = ['yes', 'on', '1', 'true'].indexOf(value) > -1;
        }
      }else if(itemData.object){
        if(!think.isObject(value)){
          try{
            value = JSON.parse(value);
          }catch(e){
            value = '';
          }
        }
      }else{
        itemData.string = true;
      }
      //set value to request
      this[method](name, value);
      itemData.value = value;
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
  validate(data) {
    if(think.isEmpty(data)){
      return true;
    }
    data = this._parseValidateData(data);
    let ret = think.validate(data, this.locale());
    if(!think.isEmpty(ret)){
      this.assign('errors', ret);
      return false; 
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
}