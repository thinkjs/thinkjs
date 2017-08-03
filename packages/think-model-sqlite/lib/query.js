const {Query} = require('think-model-abstract');
const Parser = require('./parser.js');
const SQLiteSocket = require('./socket.js');

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
    return super.socket(sql, SQLiteSocket);
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
  /**
   * add data list
   * @param {Array} data 
   * @param {Object} options 
   */
  addMany(data, options) {
    return super.addMany(data, options).then(ret => {
      const lastInsertId = this.lastInsertId;
      const length = ret.length;
      return ret.map((item, index) => {
        return lastInsertId - length + index + 1;
      });
    });
  }
};
