const helper = require('think-helper');
const { Query } = require('think-model-abstract');
const PostgreSQLSocket = require('./socket.js');

/**
 * PostgreSQL query
 */
module.exports = class PostgreSQLQuery extends Query {
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
      if (data.command !== 'INSERT') {
        return data.rowCount || 0;
      }

      if (helper.isArray(data.rows) && data.rows[0]) {
        const keys = Object.keys(data.rows[0]);
        this.lastInsertId = data.rows[0][keys[0]] || 0;
        if (helper.isNumberString(this.lastInsertId)) {
          this.lastInsertId = parseInt(this.lastInsertId);
        }
      }
    });
  }
};
