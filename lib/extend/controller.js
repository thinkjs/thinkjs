module.exports = {
  /**
   * get or set config
   * @param {String} name 
   * @param {Mix} value 
   * @param {String} m 
   */
  config(name, value, m = this.ctx.module){
    return think.config(name, value, m);
  },
  /**
   * get request method
   */
  method(){
    return this.ctx.method.toLowerCase();
  },
  /**
   * is method
   * @param {String} method 
   */
  isMethod(method){
    return this.method() === method;
  },
  /**
   * is get method
   */
  isGet(){
    return this.method() === 'get';
  },
  /**
   * is post method
   */
  isPost(){
    return this.method === 'post';
  },
  /**
   * is ajax request
   */
  isAjax(method){
    if(method && !this.method(method)){
      return false;
    }

  },
  /**
   * is jsonp request
   */
  isJsonp(){

  },
  /**
   * get querystring data
   */
  get(){

  },
  /**
   * get post data
   */
  post(){

  },
  /**
   * get post or querystring data
   */
  param(){

  },
  /**
   * get file data
   */
  file(){

  },
  /**
   * get or set header
   */
  header(){

  },
  userAgent(){

  },
  referrer(){

  },
  referer(){

  },
  cookie(){

  },
  session(){

  },
  redirect(){
    return false;
  },
  jsonp(){
    
  }
}