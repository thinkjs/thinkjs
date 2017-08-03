const {Query} = require('think-model-abstract');
const Mysql = require('think-mysql');
const Parser = require('./parser.js');

const PARSER = Symbol('think-model-parser');

/**
 * mysql query
 */
module.exports = class MysqlQuery extends Query {
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
    return super.socket(sql, Mysql);
  }
  /**
   * execute sql
   */
  execute(sqlOptions, connection) {
    return super.execute(sqlOptions, connection).then(data => {
      if (data.insertId) {
        this.lastInsertId = data.insertId;
      }
      return data.affectedRows || 0;
    });
  }
};
