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
    this.pool = this[getConnection](config);
  }

  /**
   * get connection
   * @return {Promise} [conneciton handle]
   */
  [getConnection](config) {
    return this.pool ? this.pool : mysql.createPool(config);
  }

  /**
   * query
   * @param sql
   * @param useDebounce
   * @returns {Promise}
   */
  query(sql, useDebounce = true) {
    const poolQuery = new Promise((resolve, reject) => {
      this.pool.query(sql, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      })
    });
    if (useDebounce) {
      debounceInstance.debounce(sql, () => poolQuery)
    }
    return poolQuery;
  }

  execute() {

  }

}
module.exports = thinkMysql;
