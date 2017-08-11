const {Query} = require('think-model-abstract');
const Mysql = require('think-mysql');

/**
 * mysql query
 */
module.exports = class MysqlQuery extends Query {
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
