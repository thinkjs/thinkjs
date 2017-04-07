const mysql = require('mysql');
const helper = require('think-helper');
const assert = require('assert');
const Debounce = require('think-debounce');
const debounceInstance = new Debounce();
const getConnection = Symbol('getConnection');

const defaultConfig = {
  port: 3306,
  host: '127.0.0.1',
  user: 'root',
  password: '',
  connectionLimit: 1
};

class thinkMysql {
  /**
   * @param  {Object} config [connection options]
   */
  constructor(config = {}) {
    config = helper.extend({}, defaultConfig, config);
    this.mysql = this[getConnection](config);
  }

  /**
   * get connection
   * @return {Promise} [conneciton handle]
   */
  [getConnection](config) {
    return this.mysql ? this.mysql : mysql.createPool(config);
  }

  /**
   * query
   * @param sql
   * @param useDebounce
   * @returns {Promise}
   */
  query(sql, useDebounce = true) {
    const poolQuery = new Promise((resolve, reject) => {
      this.mysql.query(sql, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      })
    });
    if (useDebounce) {
      return debounceInstance.debounce(sql, () => poolQuery)
    }
    return poolQuery;
  }

  /**
   * execute
   * @param sql
   * @returns {Promise}
   */
  execute(sql) {
    return this.query(sql, false);
  }

}
module.exports = thinkMysql;
