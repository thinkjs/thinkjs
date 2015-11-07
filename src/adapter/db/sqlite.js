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
  socket(){
    if(this._socket){
      return this._socket;
    }
    this._socket = new SqliteSocket(this.config);
    return this._socket;
  }
  /**
   * get table info
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  async getFields(table){
    let data = await this.query(`PRAGMA table_info( ${table} )`);
    let ret = {};
    data.forEach(item => {
      ret[item.name] = {
        name: item.name,
        type: item.type,
        required: !!item.notnull,
        default: item.dflt_value,
        primary: !!item.pk,
        auto_increment: false
      };
    });
    return ret;
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