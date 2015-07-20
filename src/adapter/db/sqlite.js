'use strict';

let SqliteSocket = think.adapter('socket', 'sqlite');
/**
 * sqlite db
 */
export default class extends think.adapter.db {
  /**
   * get sqlite socket instance
   * @param  {Object} config []
   * @return {}        []
   */
  getSocketInstance(){
    if(this.socket){
      return this.socket;
    }
    this.socket = new SqliteSocket(this.config);
    return this.socket;
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
    if(data.length === 0){
      let msg = new Error(think.local('TABLE_NO_COLUMNS', table));
      return think.reject(msg);
    }
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