'use strict';

let sqliteSocket = think.adapter('socket', 'sqlite');

export default class extends think.adapter.db {
  /**
   * connect
   * @return {Object} [class instance]
   */
  connect(){
    return new sqliteSocket(this.config);
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
      ret[item.field] = {
        name: item.field,
        type: item.type,
        required: item.null === '',
        default: item.default,
        primary: item.key.toLowerCase() === 'pri',
        auto_increment: item.key.toLowerCase() === 'auto_increment'
      }
    })
    return ret;
  }
  /**
   * escape string
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str){
    return str.replace(/\'/, "''");
  }
  /**
   * parse limit
   * @param  {Array} limit []
   * @return {String}       []
   */
  parseLimit(limit){
    if (!limit) {
      return '';
    }
    if(think.isString(limit)){
      limit = limit.split(',');
    }
    if(limit[1]){
      return ' LIMIT ' + (limit[1] | 0) + ' OFFSET ' + (limit[0] | 0);
    }
    return ' LIMIT ' + (limit[0] | 0);
  }
}