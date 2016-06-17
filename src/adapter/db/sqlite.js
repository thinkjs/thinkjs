'use strict';

import Base from './base.js';

let SqliteSocket = think.adapter('socket', 'sqlite');
/**
 * sqlite db
 */
export default class extends Base {
  /**
   * get sqlite socket instance
   * @param  {Object} config []
   * @return {}        []
   */
  socket(sql){
    if(this._socket){
      return this._socket;
    }
    let config = think.extend({
      sql: sql
    }, this.config);
    this._socket = SqliteSocket.getInstance(config, thinkCache.DB, ['sql']);
    return this._socket;
  }
  /**
   * get table info
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  async getSchema(table){
    let fieldPromise = this.query(`PRAGMA table_info( ${table} )`);
    let indexPromise = this.query(`PRAGMA INDEX_LIST( ${table} )`).then(list => {
      let indexes = {};
      let promises = list.map(item => {
        if(item.unique){
          return this.query(`PRAGMA index_info( ${item.name} )`).then(data => {
            data.forEach(item => {
              indexes[item.name] = {unique: true};
            });
          });
        }
      });
      return Promise.all(promises).then(() => {
        return indexes;
      });
    });
    let ret = {};
    let [data, indexes] = await Promise.all([fieldPromise, indexPromise]);
    data.forEach(item => {
      ret[item.name] = {
        name: item.name,
        type: item.type,
        required: !!item.notnull,
        //default: item.dflt_value,
        primary: !!item.pk,
        auto_increment: false,
        unique: !!(!item.pk && indexes[item.name] && indexes[item.name].unique)
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
      return this.execute('BEGIN TRANSACTION');
    }
    this.transTimes++;
    return Promise.resolve();
  }
  /**
   * escape string
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str){
    return str.replace(/\'/g, '\'\'');
  }
  /**
   * parse limit
   * @param  {Array} limit []
   * @return {String}       []
   */
  parseLimit(limit){
    if (think.isEmpty(limit)) {
      return '';
    }
    if(think.isNumber(limit)){
      return ` LIMIT ${limit}`;
    }
    if(think.isString(limit)){
      limit = limit.split(/\s*,\s*/);
    }
    if(limit[1]){
      return ' LIMIT ' + (limit[1] | 0) + ' OFFSET ' + (limit[0] | 0);
    }
    return ' LIMIT ' + (limit[0] | 0);
  }
}