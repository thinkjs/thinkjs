'use strict';

import querystring from 'querystring';
import Parse from './_parse.js';

/**
 * db base class
 * @type {Class}
 */
export default class extends Parse {
  /**
   * init
   * @return {} []
   */
  init(){
    super.init(config);
    this.sql = '';
    this.lastInsertId = 0;
    this.socket = null;
  }
  /**
   * get socket instance, override by sub class
   * @return {Object} [socket instance]
   */
  getSocketInstance(){

  }
  /**
   * insert data
   * @param  {Object} data    []
   * @param  {Object} options []
   * @param  {Boolean} replace []
   * @return {Promise}         []
   */
  add(data = {}, options = {}, replace){
    let values = [];
    let fields = [];
    for(let key in data){
      let val = data[key];
      val = this.parseValue(val);
      if (think.isString(val) || think.isBoolean(val) || think.isNumber(val)) {
        values.push(val);
        fields.push(this.parseKey(key));
      }
    }
    let sql = (replace ? 'REPLACE' : 'INSERT') + ' INTO ';
    sql += this.parseTable(options.table) + ' (' + fields.join(',') + ') ';
    sql += 'VALUES(' + values.join(',') + ')';
    sql += this.parseLock(options.lock) + this.parseComment(options.comment);
    return this.execute(sql);
  }
  /**
   * insert multi data
   * @param  {Array} data    [data list]
   * @param  {Object} options []
   * @param  {Boolean} replace []
   * @return {Promise}         []
   */
  addMany(data, options, replace){
    let fields = Object.keys(data[0]);
    fields = fields.map(item => this.parseKey(item)).join(',');
    let values = data.map(item => {
      let value = [];
      for(let key in item){
        let val = item[key];
        val = this.parseValue(val);
        if (think.isString(val) || think.isBoolean(val) || think.isNumber(val)) {
          value.push(val);
        }
      }
      return '(' + value.join(',') + ')';
    }).join(',');
    let sql = replace ? 'REPLACE' : 'INSERT';
    sql += ' INTO ' + this.parseTable(options.table) + '(' + fields + ') VALUES ' + values;
    return this.execute(sql);
  }
  /**
   * select data
   * @param  {String} fields  []
   * @param  {String} table   []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  selectAdd(fields, table, options = {}){
    if (think.isString(fields)) {
      fields = fields.split(',');
    }
    fields = fields.map(item => this.parseKey(item));
    let sql = 'INSERT INTO ' + this.parseTable(table) + ' (' + fields.join(',') + ') ';
    sql += this.buildSelectSql(options);
    return this.execute(sql);
  }
  /**
   * delete data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  delete(options = {}){
    this.model = options.model;
    let sql = [
      'DELETE FROM ',
      this.parseTable(options.table),
      this.parseWhere(options.where),
      this.parseOrder(options.order),
      this.parseLimit(options.limit),
      this.parseLock(options.lock),
      this.parseComment(options.comment)
    ].join('');
    return this.execute(sql);
  }
  /**
   * update data
   * @param  {Object} data    []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  update(data, options = {}){
    this.model = options.model;
    let sql = [
      'UPDATE ',
      this.parseTable(options.table),
      this.parseSet(data),
      this.parseWhere(options.where),
      this.parseOrder(options.order),
      this.parseLimit(options.limit),
      this.parseLock(options.lock),
      this.parseComment(options.comment)
    ].join('');
    return this.execute(sql);
  }
  /**
   * select
   * @param  {Object} options []
   * @return {Promise}         []
   */
  select(options = {}, cache){
    let sql;
    if(think.isObject(options)){
      sql = this.buildSelectSql(options);
      cache = options.cache;
    }else{
      sql = options;
    }
    if (!think.isEmpty(cache) && this.config.cache.on) {
      let key = cache.key || think.md5(sql);
      return think.cache(key, () => this.query(sql), cache);
    }
    return this.query(sql);
  }
  /**
   * escape string
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str){
    if (!str) {
      return '';
    }
    return str.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, s =>  {
      switch(s) {
        case '\0': 
          return '\\0';
        case '\n': 
          return '\\n';
        case '\r': 
          return '\\r';
        case '\b': 
          return '\\b';
        case '\t': 
          return '\\t';
        case '\x1a': 
          return '\\Z';
        default:   
          return '\\'+s;
      }
    });
  }
  /**
   * get last sql
   * @return {String}       []
   */
  getLastSql(){
    return this.sql;
  }
  /**
   * get last insert id
   * @return {String} []
   */
  getLastInsertId(){
    return this.lastInsertId;
  }
  /**
   * query string
   * @param  string str
   * @return promise
   */
  query(str){
    return think.await(str, () => {
      return this.getSocketInstance().query(str).then(data => {
        return this.bufferToString(data);
      });
    })
  }
  /**
   * buffer to string
   * @param  {Array} data []
   * @return {Array}      []
   */
  bufferToString(data){
    if (!this.config.buffer_tostring || !think.isArray(data)) {
      return data;
    }
    for(let i = 0, length = data.length; i < length; i++){
      for(let key in data[i]){
        if(think.isBuffer(data[i][key])){
          data[i][key] = data[i][key].toString();
        }
      }
    }
    return data;
  }
  /**
   * execute sql
   * @param  {String} str []
   * @return {}     []
   */
  execute(str){
    return this.getSocketInstance().execute(str).then(data => {
      if (data.insertId) {
        this.lastInsertId = data.insertId;
      }
      return data.affectedRows || 0;
    });
  }
  /**
   * close connect
   * @return {} []
   */
  close(){
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}