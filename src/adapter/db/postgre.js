'use strict';

import Base from './base.js';

let PostgreSocket = think.adapter('socket', 'postgre');
/**
 * postgre db
 */
export default class extends Base {
  /**
   * get postgre socket instance
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
    this._socket = PostgreSocket.getInstance(config, thinkCache.DB, ['sql']);
    return this._socket;
  }
  /**
   * get table info
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  async getSchema(table){
    let sql = `select fields_name,fields_type,fields_not_null,fields_key_name,fields_default,fields_default from table_msg('${table}');`;
    let data = await this.query(sql);
    let schema = {};
    data.forEach(item => {
      schema[item.fields_name] = {
        name: item.fields_name,
        type: item.fields_type,
        required: item.fields_not_null,
        default: item.fields_default,
        primary: item.key.toLowerCase() === 'pri',
        auto_increment: item.fields_extra.toLowerCase() === 'auto_increment'
      };
    });
    return schema;
  }
  /**
   * start transaction
   * @return {Promise} []
   */
  startTrans(){
    if (this.transTimes === 0) {
      this.transTimes++;
      return this.execute('BEGIN');
    }
    this.transTimes++;
    return Promise.resolve();
  }
  /**
   * parse limit
   * @param  {String} limit []
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