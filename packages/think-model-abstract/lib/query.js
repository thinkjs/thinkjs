const helper = require('think-helper');
const debug = require('debug')('think-model');

const SOCKET = Symbol('think-model-socket');

module.exports = class AbstractQuery {
  /**
   * abstract query class
   * @param {object} config 
   */
  constructor(config = {}) {
    this.config = config;
    this.lastSql = '';
    this.lastInsertId = 0;
  }
  /**
   * query sql
   */
  query(sqlOptions, connection = this.connection) {
    const sql = helper.isString(sqlOptions) ? sqlOptions : sqlOptions.sql;
    this.lastSql = sql;
    return this.socket(sql).query(sqlOptions, connection);
  }
  /**
   * execute, override in sub class
   */
  execute(sqlOptions, connection = this.connection) {
    const sql = helper.isString(sqlOptions) ? sqlOptions : sqlOptions.sql;
    this.lastSql = sql;
    return this.socket(sql).execute(sqlOptions, connection);
  }
  /**
   * get socket, invoked in sub class
   * @param {String|Object} sql 
   */
  socket(sql, Cls) {
    if (sql && this.config.parser) {
      const config = Object.assign({}, this.config, this.config.parser(sql));
      return Cls.getInstance(config);
    }
    if (this[SOCKET]) return this[SOCKET];
    this[SOCKET] = Cls.getInstance(this.config);
    return this[SOCKET];
  }
  /**
   * insert data
   * @param {Object} data 
   * @param {Object} options 
   */
  add(data, options) {
    const values = [];
    const fields = [];
    const parser = this.parser;
    for (const key in data) {
      let val = data[key];
      val = parser.parseValue(val);
      if (helper.isString(val) || helper.isBoolean(val) || helper.isNumber(val)) {
        values.push(val);
        fields.push(parser.parseKey(key));
      }
    }
    options.fields = fields.join(',');
    options.values = values.join(',');
    const sql = this.parser.buildInsertSql(options);
    return this.execute(sql).then(() => this.lastInsertId);
  }
  /**
   * insert multi data
   * @param  {Array} data    [data list]
   * @param  {Object} options []
   * @return {Promise}         []
   */
  addMany(data, options) {
    const parser = this.parser;
    const fields = Object.keys(data[0]).map(item => parser.parseKey(item)).join(',');
    const values = data.map(item => {
      const value = [];
      for (const key in item) {
        let val = item[key];
        val = parser.parseValue(val);
        if (helper.isString(val) || helper.isBoolean(val) || helper.isNumber(val)) {
          value.push(val);
        }
      }
      return `(${value.join(',')})`;
    }).join(',');

    options.fields = fields;
    options.values = values;
    const sql = this.parser.buildInsertSql(options);
    return this.execute(sql).then(() => {
      return data.map((item, index) => {
        return this.lastInsertId ? this.lastInsertId + index : 0;
      });
    });
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
    const parser = this.parser;
    fields = fields.map(item => parser.parseKey(item));
    const sql = this.parser.buildInsertSql({
      table,
      fields: fields.join(','),
      values: options
    });
    return this.execute(sql);
  }
  /**
   * delete data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  delete(options) {
    const sql = this.parser.buildDeleteSql(options);
    return this.execute(sql);
  }
  /**
   * update data
   * @param  {Object} data    []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  update(data, options) {
    const sql = this.parser.buildUpdateSql(data, options);
    return this.execute(sql);
  }
  /**
   * select
   * @param  {Object} options []
   * @return {Promise}         []
   */
  select(options, cache) {
    const parser = this.parser;
    let sql;
    if (helper.isObject(options)) {
      sql = options.sql ? options.sql : parser.buildSelectSql(options);
      cache = cache || options.cache;
    } else {
      sql = options;
    }
    if (!cache) return this.query(sql);

    cache.key = cache.key || helper.md5(sql);
    const Handle = cache.handle;
    const instance = new Handle(cache);
    return instance.get(cache.key).then(data => {
      if (data !== undefined) {
        debug(`get data from cache: ${JSON.stringify(cache)}`);
        return data;
      }
      return this.query(sql).then(data => {
        return instance.set(cache.key, data).then(() => {
          return data;
        });
      });
    });
  }
  /**
   * start transaction
   * @param {Object} connection 
   */
  startTrans(connection) {
    return this.socket().startTrans(connection).then(connection => {
      this.connection = connection;
      return connection;
    });
  }
  /**
   * commit transaction
   * @param {Object} connection 
   */
  commit(connection = this.connection) {
    return this.socket().commit(connection);
  }
  /**
   * rollback transaction
   * @param {Object} connection 
   */
  rollback(connection = this.connection) {
    return this.socket().rollback(connection);
  }
  /**
   * wrap transaction
   * @param {Function} fn 
   * @param {Object} connection 
   */
  transaction(fn, connection) {
    return this.socket().transaction(connection => {
      this.connection = connection;
      return fn(connection);
    }, connection);
  }
};
