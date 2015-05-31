'use strict';

let querystring = require('querystring');

let _parse = require('./_parse.js');
let wait = think.require('await');

let awaitInstance = new wait();

/**
 * db base class
 * @type {Class}
 */
export default class extends _parse {
  /**
   * init
   * @return {} []
   */
  init(config = {}){
    super.init(config);
    this.sql = '';
    this.config = config;
    this.lastInsertId = 0;
    this.selectSql = 'SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT% %UNION%%COMMENT%';
  }
  /**
   * 拼接select查询语句
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  buildSelectSql(options){
    let sql = this.parseSql(this.selectSql, options);
    sql += this.parseLock(options.lock);
    return sql;
  }
  /**
   * 插入一条记录
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @param  {[type]} replace [description]
   * @return {[type]}         [description]
   */
  insert(data = {}, options = {}, replace){
    let values = [];
    let fields = [];
    for(let key in data){
      let val = data[key];
      val = this.parseValue(val);
      if (think.isString(val)) {
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
   * 插入多条记录
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @param  {[type]} replace [description]
   * @return {[type]}         [description]
   */
  insertAll(data, options, replace){
    let fields = Object.keys(data[0]);
    fields = fields.map(item => this.parseKey(item)).join(',');
    let values = data.map(item => {
      let value = [];
      for(let key in item){
        let val = item[key];
        val = this.parseValue(val);
        if (isScalar(val)) {
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
   * 从一个选择条件的结果插入记录
   * @param  {[type]} fields  [description]
   * @param  {[type]} table   [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  selectAdd(fields, table, options = {}){
    this.model = options.model;
    if (think.isString(fields)) {
      fields = fields.split(',');
    }
    fields = fields.map(item => this.parseKey(item));
    let sql = 'INSERT INTO ' + this.parseTable(table) + ' (' + fields.join(',') + ') ';
    sql += this.buildSelectSql(options);
    return this.execute(sql);
  }
  /**
   * 删除记录
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  delete(options = {}){
    options = options || {};
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
   * 更新数据
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  update(data, options){
    options = options || {};
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
    return awaitInstance.run(str, () => {
      return this.connect().query(str).then(data => {
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
    return this.connect().execute(str).then(data => {
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
    if (this.linkId) {
      this.linkId.close();
      this.linkId = null;
    }
  }
}