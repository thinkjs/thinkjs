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
  connectionLimit: 5
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
   *
   * @param sql
   * @param params
   * @param useDebounce
   * @param nestTables
   * @param times
   * @returns {Promise}
   */
  query(sql, params = '', useDebounce = true, nestTables, times = 1) {
    assert(helper.isString(sql), 'sql must be a string');
    assert(this.config, 'configuration can not be null');
    if (!this.pool) {
      this[initConnection](this.config);
    }
    let data = {sql, nestTables};
    const poolQuery = new Promise((resolve, reject) => {
      this.pool.query(data, params, (err, results) => {
        if (err) {
          // if lost connections,try 3 times
          if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'EPIPE') {
            if (times <= 3) {
              return this.query(sql, params, nestTables, useDebounce, ++times);
            }
          }
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
   * @param  {Array} args []
   * @returns {Promise}
   */
  execute(...args) {
    return this.query(...args);
  }

  /**
   *
   * @param args
   * @returns {Promise}
   */
  executeTrans(args) {
    assert(helper.isArray(args), 'args must be array');
    args = args.map(item=>{
      if(helper.isString(item)){
        return {
          sql:item
        }
      }
      assert(item.sql,'args item.sql cannot be empty');
      return item;
    });
    let connect = helper.promisify(this.pool.getConnection, this.pool);

    return connect().then(conn => {
      let query = helper.promisify(conn.query, conn);
      let begin = helper.promisify(conn.beginTransaction, conn);
      let commit = helper.promisify(conn.commit, conn);
      let rollback = helper.promisify(conn.rollback, conn);
      let results = [];

      return args.reduce((p, item) => {
        return p.then(() => {
          let params = '';
          if (helper.isFunction(item.params)) {
            params = item.params(results);
          }
          return query(item.sql, params).then(result => {
            results.push(result);
            if (item.cb) {
              item.cb(results)
            }
          });
        })
      }, begin()).then(() => commit()).then(() => {
        conn.release();
        return Promise.resolve(results);
      }).catch(err => {
        return rollback().then(() => {
          conn.release();
          return Promise.reject(err);
        });
      });
    })
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
