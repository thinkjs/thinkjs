'use strict';

let MysqlSocket = think.adapter('socket', 'mysql');
/**
 * mysql db
 * @type {Class}
 */
export default class extends think.adapter.db {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    super.init(config);
    this.transTimes = 0; //transaction times
    this.engine = ''; //mysql engine
  }
  /**
   * get mysql socket instance
   * @param  {Object} config []
   * @return {}        []
   */
  getSocketInstance(){
    if(this.socket){
      return this.socket;
    }
    this.socket = new MysqlSocket(this.config);
    return this.socket;
  }
  /**
   * get table info
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  async getFields(table){
    let data = await this.query(`SHOW COLUMNS FROM ${this.parseKey(table)}`);
    let ret = {};
    data.forEach(item => {
      ret[item.Field] = {
        'name': item.Field,
        'type': item.Type,
        'required': item.Null === '',
        'default': item.Default,
        'primary': item.Key === 'PRI',
        'unique': item.Key === 'UNI',
        'auto_increment': item.Extra.toLowerCase() === 'auto_increment'
      };
    });
    return ret;
  }
  /**
   * get table engine
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  async getEngine(table){
    if(this.engine){
      return this.engine;
    }
    let data = await this.query(`SHOW TABLE STATUS WHERE name='${this.parseKey(table)}'`);
    this.engine = data[0].Engine.toLowerCase();
    return this.engine;
  }
  /**
   * check table is support transaction
   * @param  {String} table []
   * @return {Promise}       []
   */
  async supportTrans(table){
    let engine = await this.getEngine(table);
    let engines = ['innodb', 'bdb'];
    return engines.indexOf(engine) > -1;
  }
  /**
   * start transaction
   * @return {Promise} []
   */
  async startTrans(table){
    let support = await this.supportTrans(table);
    if(!support){
      let err = new Error(think.message('NOT_SUPPORT_TRANSACTION'));
      return think.reject(err);
    }
    if (this.transTimes === 0) {
      this.transTimes++;
      return this.execute('START TRANSACTION');
    }
    this.transTimes++;
    return Promise.resolve();
  }
  /**
   * commit
   * @return {Promise} []
   */
  commit(){
    if (this.transTimes > 0) {
      this.transTimes = 0;
      return this.execute('COMMIT');
    }
    return Promise.resolve();
  }
  /**
   * rollback
   * @return {Promise} []
   */
  rollback(){
    if (this.transTimes > 0) {
      this.transTimes = 0;
      return this.execute('ROLLBACK');
    }
    return Promise.resolve();
  }
  /**
   * parse key
   * @param  {String} key []
   * @return {String}     []
   */
  parseKey(key = ''){
    key = key.trim();
    if (!(/[,\'\"\*\(\)`.\s]/.test(key))) {
      key = '`' + key + '`';
    }
    return key;
  }
}