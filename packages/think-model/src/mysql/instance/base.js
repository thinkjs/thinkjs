const helper = require('think-helper');
const thinkCache = require('think-cache/cache');

const Parser = require('./parser');
/**
 * db base class
 * @type {Class}
 */
module.exports = class extends Parser {
  /**
   * constructor
   * @return {} []
   */
  constructor(config) {
    super(config);
    this.sql = '';
    this.lastInsertId = 0;
    this._socket = null;
    this.connection = null;
  }
  /**
   * get socket instance, override by sub class
   * @return {Object} [socket instance]
   */
  socket() {}
  /**
   * insert data
   * @param  {Object} data    []
   * @param  {Object} options []
   * @param  {Boolean} replace []
   * @return {Promise}         []
   */
  add(data, options, replace) {
    const values = [];
    const fields = [];
    for (const key in data) {
      let val = data[key];
      val = this.parseValue(val);
      if (helper.isString(val) || helper.isBoolean(val) || helper.isNumber(val)) {
        values.push(val);
        fields.push(this.parseKey(key));
      }
    }
    let sql = replace ? 'REPLACE' : 'INSERT';
    sql += ' INTO ' + this.parseTable(options.table) + ' (' + fields.join(',') + ')';
    sql += ' VALUES (' + values.join(',') + ')';
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
  addMany(data, options, replace) {
    const fields = Object.keys(data[0]).map(item => this.parseKey(item)).join(',');
    const values = data.map(item => {
      const value = [];
      for (const key in item) {
        let val = item[key];
        val = this.parseValue(val);
        if (helper.isString(val) || helper.isBoolean(val) || helper.isNumber(val)) {
          value.push(val);
        }
      }
      return '(' + value.join(',') + ')';
    }).join(',');
    let sql = replace ? 'REPLACE' : 'INSERT';
    sql += ' INTO ' + this.parseTable(options.table) + '(' + fields + ')';
    sql += ' VALUES ' + values;
    sql += this.parseLock(options.lock) + this.parseComment(options.comment);
    return this.execute(sql);
  }
  /**
   * select data
   * @param  {String} fields  []
   * @param  {String} table   []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  selectAdd(fields, table, options = {}) {
    if (helper.isString(fields)) {
      fields = fields.split(/\s*,\s*/);
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
  delete(options) {
    const sql = [
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
  update(data, options) {
    const sql = [
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
  select(options, cache) {
    let sql;
    if (helper.isObject(options)) {
      sql = options.sql ? options.sql : this.buildSelectSql(options);
      cache = options.cache || cache;
    } else {
      sql = options;
    }
    if (!helper.isEmpty(cache) && !(cache.enable === false)) {
      const key = cache.key || helper.md5(sql);
      return thinkCache(key, () => this.query(sql), cache);
    }
    return this.query(sql);
  }
  /**
   * escape string
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str) {
    if (!str) {
      return '';
    }
    return str.replace(/[\0\n\r\b\t\\'"\x1a]/g, s => {
      switch (s) {
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
          return '\\' + s;
      }
    });
  }
  /**
   * get last sql
   * @return {String}       []
   */
  getLastSql() {
    return this.sql;
  }
  /**
   * get last insert id
   * @return {String} []
   */
  getLastInsertId() {
    return this.lastInsertId;
  }
  /**
   * query string
   * @param  string str
   * @return promise
   */
  query(sql, connection = this.connection) {
    this.sql = sql;
    return this.socket(sql).query(sql, connection).then(this.bufferToString.bind(this));
  }
  /**
   * buffer to string
   * @param  {Array} data []
   * @return {Array}      []
   */
  bufferToString(data) {
    if (!this.config.bufferToString || !helper.isArray(data)) {
      return data;
    }
    for (let i = 0, length = data.length; i < length; i++) {
      for (const key in data[i]) {
        if (helper.isBuffer(data[i][key])) {
          data[i][key] = data[i][key].toString();
        }
      }
    }
    return data;
  }
  /**
   * execute sql
   * @param  {String} sql []
   * @return {}     []
   */
  execute(sql, connection = this.connection) {
    this.sql = sql;
    return this.socket(sql).execute(sql, connection).then(data => {
      if (data.insertId) {
        this.lastInsertId = data.insertId;
      }
      return data.affectedRows || 0;
    });
  }
  /**
   * start transaction
   * @return {Promise} []
   */
  async startTrans(connection) {
    return this.socket().startTrans(connection).then(connection => {
      this.connection = connection;
      return connection;
    });
  }
  /**
   * commit
   * @return {Promise} []
   */
  commit(connection) {
    return this.socket().commit(connection);
  }
  /**
   * rollback
   * @return {Promise} []
   */
  rollback(connection) {
    return this.socket().rollback(connection);
  }
  /**
   * transaction
   * @param {Function} fn 
   * @param {*} connection 
   */
  transaction(fn, connection) {
    return this.socket().transaction(connection => {
      this.connection = connection;
      return fn(connection);
    }, connection);
  }
  /**
   * close connect
   * @return {} []
   */
  close() {
    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }
  }
};
