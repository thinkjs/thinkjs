'use strict';
/**
 * db session
 
  DROP TABLE IF EXISTS `think_session`;
  CREATE TABLE `think_session` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `cookie` varchar(255) NOT NULL DEFAULT '',
    `data` text,
    `expire` bigint(11) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `cookie` (`cookie`),
    KEY `expire` (`expire`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

 */
export default class extends think.adapter.base {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options){
    
    options = think.parseConfig(think.config('session'), options);
    this.cookie = options.cookie;
    this.newCookie = options.newCookie;
    
    this.timeout = options.timeout;
    this.isChanged = false;

    //let dbConfig = think.extend({}, think.config('db'), options);
    this.model = think.model('session', think.extend({
      from: 'session'
    }, think.config('db')));

    this.gcType = 'session_db';
    think.gc(this);
  }
  /**
   * get session data
   * @return {Promise} []
   */
  async getData(){
    if(this.data){
      return this.data;
    }
    //when session cookie is not exist, return direct
    if(this.newCookie){
      this.data = {};
      await this.model.add({cookie: this.cookie, expire: Date.now() + this.timeout * 1000});
      return this.data;
    }
    //let data = await this.model.where({cookie: this.cookie}).find();
    let data = await think.await(`session_${this.cookie}`, () => {
      return this.model.where({cookie: this.cookie}).find();
    });

    if(this.data){
      return this.data;
    }

    this.data = {};
    if(think.isEmpty(data)){
      await this.model.add({cookie: this.cookie, expire: Date.now() + this.timeout * 1000});
      return this.data;
    }

    if(Date.now() > data.expire){
      return this.data;
    }

    try{
      this.data = JSON.parse(data.data) || {};
    }catch(e){}
    
    return this.data;
  }
  /**
   * get data
   * @param  {String} name []
   * @return {Promise}      []
   */
  get(name){
    return this.getData().then(() => {
      return name ? this.data[name] : this.data;
    });
  }
  /**
   * set data
   * @param {String} name    []
   * @param {Mixed} value   []
   * @param {Number} timeout []
   */
  set(name, value, timeout = this.timeout){
    this.timeout = timeout;
    return this.getData().then(() => {
      this.isChanged = true;
      this.data[name] = value;
    });
  }
  /**
   * delete data
   * @param  {String} name []
   * @return {Promise}      []
   */
  delete(name){
    return this.getData().then(() => {
      this.isChanged = true;
      if(name){
        delete this.data[name];
      }else{
        this.data = {};
      }
    });
  }
  /**
   * flush data
   * @return {Promise} []
   */
  flush(){
    let data = {
      expire: Date.now() + this.timeout * 1000,
      timeout: this.timeout
    };
    return this.getData().then(() => {
      //if session is empty and not changed, not flush
      if(!this.isChanged && think.isEmpty(this.data)){
        return;
      }
      //update data when data is changed
      if(this.isChanged){
        data.data = JSON.stringify(this.data);
      }
      return this.model.where({cookie: this.cookie}).update(data);
    });
  }
  /**
   * gc
   * @return {Promise} []
   */
  gc(){
    return this.model.where({expire: {'<': Date.now()}}).delete();
  }
}