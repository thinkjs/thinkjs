const {Query} = require('think-model-abstract');
const helper = require('think-helper');
const Parser = require('./parser.js');
const PostgreSQLSocket = require('./socket.js');

const PARSER = Symbol('think-model-sqlite-parser');

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
    return super.socket(sql, PostgreSQLSocket);
  }
  /**
   * query sql
   * @param {Object} sqlOptions 
   * @param {Object} connection 
   */
  query(sqlOptions, connection) {
    return super.query(sqlOptions, connection).then(data => data.rows);
  }
  /**
   * execute sql
   */
  execute(sqlOptions, connection) {
    return super.execute(sqlOptions, connection).then(data => {
      if (data.command === 'INSERT') {
        if (data.rows[0]) {
          const keys = Object.keys(data.rows[0]);
          this.lastInsertId = parseInt(data.rows[0][keys[0]]) || 0;
        }
      }
      return data.rowCount || 0;
    });
  }
};
