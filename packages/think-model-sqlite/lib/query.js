const {Query} = require('think-model-abstract');
const helper = require('think-helper');
const Parser = require('./parser.js');
const SQLiteSocket = require('./socket.js');

const PARSER = Symbol('think-model-sqlite-parser');
const SOCKET = Symbol('think-model-sqlite-socket');

/**
 * mysql query
 */
module.exports = class SQLiteQuery extends Query {
  /**
   * get parser instance
   */
  get parser() {
    if (this[PARSER]) return this[PARSER];
    this[PARSER] = new Parser(this.config);
    return this[PARSER];
  }
  /**
   * get socket
   * @param {String|Object} sql 
   */
  socket(sql) {
    if (sql && this.config.parser) {
      const config = Object.assign({}, this.config, this.config.parser(sql));
      return SQLiteSocket.getInstance(config);
    }
    if (this[SOCKET]) return this[SOCKET];
    this[SOCKET] = SQLiteSocket.getInstance(this.config);
    return this[SOCKET];
  }
  /**
   * query sql
   */
  query(sqlOptions, connection) {
    const sql = helper.isString(sqlOptions) ? sqlOptions : sqlOptions.sql;
    this.lastSql = sql;
    return this.socket(sql).query(sqlOptions, connection);
  }
  /**
   * execute sql
   */
  execute(sqlOptions, connection) {
    const sql = helper.isString(sqlOptions) ? sqlOptions : sqlOptions.sql;
    this.lastSql = sql;
    return this.socket(sql).execute(sqlOptions, connection).then(data => {
      if (data.insertId) {
        this.lastInsertId = data.insertId;
      }
      return data.affectedRows || 0;
    });
  }
  /**
   * add data list
   * @param {Array} data 
   * @param {Object} options 
   */
  addMany(data, options) {
    return super.addMany(data, options).then(ret => {
      return ret;
    });
  }

  startTrans(connection) {
    return this.socket().startTrans(connection).then(connection => {
      this.connection = connection;
      return connection;
    });
  }

  commit(connection = this.connection) {
    return this.socket().commit();
  }

  rollback(connection = this.connection) {
    return this.socket().rollback(connection);
  }

  transaction(fn, connection) {
    return this.socket().transaction(fn, connection);
  }
};
