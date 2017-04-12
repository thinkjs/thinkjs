const mysql = require('mysql');
const helper = require('think-helper');
const assert = require('assert');
const Debounce = require('think-debounce');
const debounceInstance = new Debounce();
const initConnection = Symbol('initConnection');

const defaultConfig = {
  port: 3306,
  host: '127.0.0.1',
  user: 'root',
  password: '',
  connectionLimit: 1
};

let instance = null;
let config = {};

class thinkMysql {
  /**
   * @param  {Object} conf [connection options]
   */
  constructor(conf = {}) {
    conf = helper.extend({}, defaultConfig, conf);
    // if use the same configuration,use singleton
    if(instance && JSON.stringify(conf) === JSON.stringify(config)){
      return instance
    }
    instance = this;
    this.config = config = conf;
    this[initConnection](config);
  }

  /**
   * get connection
   * @return {Promise} [conneciton handle]
   */
  [initConnection](config) {
    this.pool = mysql.createPool(config);
  }

  /**
   * query
   * @param sql
   * @param useDebounce
   * @returns {Promise}
   */
  query(sql, useDebounce = true) {
    assert(this.config,'configuration can not be null');
    if(!this.pool){
      this[initConnection](this.config);
    }
    const poolQuery = new Promise((resolve, reject) => {
      this.pool.query(sql, (err, results) => {
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

  /**
   * close
   * @returns {Promise}
   */
  close(){
    if(!this.pool){
      return
    }
    return new Promise((resolve,reject)=>{
      this.pool.end(err => {
        if(err){
          reject(err);
          return;
        }
        this.pool = null;
        resolve();
      })
    })

  }
}
module.exports = thinkMysql;
