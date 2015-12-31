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
    let columnSql = `select column_name,is_nullable,data_type from INFORMATION_SCHEMA.COLUMNS where table_name = '${table}'`;
    let columnsPromise = this.query(columnSql);
    let indexSql = `select indexname,indexdef from pg_indexes where tablename = '${table}'`;
    let indexPromise = this.query(indexSql);
    let {columns, indexs} = await Promise.all([columnsPromise, indexPromise]);
    let schema = {};
    columns.forEach(item => {
      schema[item.column_name] = {
        name: item.column_name,
        type: item.data_type,
        required: item.is_nullable === 'NO',
        default: '',
        auto_increment: false
      };
    });
    let extra = {};
    let reg = /\((\w+)(?:, (\w+))*\)/;
    indexs.forEach(item => {
      let [, name, ...others] = item.indexdef.match(reg);
      extra[name] = {};
      if(item.indexdef.indexOf(' pkey ') > -1){
        extra[name].primary = true;
      }
      let index = item.indexdef.indexOf(' UNIQUE ') > -1 ? 'unique' : 'index';
      extra[name][index] = others.length ? others : true;
    });

    return think.extend(schema, extra);
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