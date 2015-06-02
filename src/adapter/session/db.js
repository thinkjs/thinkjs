'use strict';
/**
 * db session
 
  DROP TABLE IF EXISTS `think_session`;
  CREATE TABLE `think_session` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `key` varchar(255) NOT NULL DEFAULT '',
    `data` text,
    `expire` bigint(11) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `cookie` (`key`),
    KEY `expire` (`expire`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

 */
export default class extends think.adapter.session {
  /**
   * init
   * @param  {Object} options []
   * @return {}         []
   */
  init(options = {}){
    this.key = options.cookie;
    this.timeout = options.timeout;

    this.isChanged = false;
    this.model = think.model('session', true);

    this.gcType = 'session_db';
    think.gc(this);
  }
  /**
   * get session data
   * @return {Promise} []
   */
  async getData(){
    if(this.data){
      return Promise.resolve(this.data);
    }
    let data = await this.model.where({key: this.key}).find();
    if(think.isEmpty(data)){
      await this.model.add({key: this.key, expire: Date.now() + this.timeout * 1000});
      this.data = {};
      return;
    }
    if(Date.now() > data.expire){
      this.data = {};
      return;
    }
    try{
      this.data = JSON.parse(data.data || '{}');
    }catch(e){
      this.data = {};
    }
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
  set(name, value, timeout){
    if(timeout){
      this.timeout = timeout;
    }
    return this.getData().then(() => {
      this.isChanged = true;
      this.data[name] = value;
    });
  }
  /**
   * rm data
   * @param  {String} name []
   * @return {Promise}      []
   */
  rm(name){
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
      //update data when data is changed
      if(this.isChanged){
        data.data = JSON.stringify(this.data);
      }
      return this.model.where({key: this.key}).update(data);
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