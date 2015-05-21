'use strict';

let mysqlSocket = think.adapter('socket', 'mysql');
/**
 * mysql db
 * @type {Class}
 */
module.exports = class extends think.adapter.db {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    super.init(config);
    this.transTimes = 0;
  }
  /**
   * connect mysql
   * @param  {Object} config []
   * @return {}        []
   */
  connect(config = {}){
    return new mysqlSocket(config);
  }
  /**
   * get table info
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  getFields(table){
    return this.query(`SHOW COLUMNS FROM ${this.parseKey(table)}`).then(data => {
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
    })
  }
  /**
   * get table engine
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  getEngine(table){
    return this.query(`SHOW TABLE STATUS WHERE name='${this.parseKey(table)}'`).then(data => {
      return data[0].Engine.toLowerCase();
    })
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