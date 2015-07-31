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
  }
  /**
   * get mysql socket instance
   * @param  {Object} config []
   * @return {}        []
   */
  socket(){
    if(this._socket){
      return this._socket;
    }
    this._socket = new MysqlSocket(this.config);
    return this._socket;
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
   * start transaction
   * @return {Promise} []
   */
  startTrans(){
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