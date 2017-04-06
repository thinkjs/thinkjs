const mysql = require('mysql');
const helper = require('think-helper');
const assert = require('assert');
const Debounce = require('think-debounce');
const debounceInstance = new Debounce();
let bindConnectionEvent = Symbol('bindConnectionEvent');


class thinkMysql {
  /**
   * @param  {Object} config [connection options]
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * get connection
   * @return {Promise} [conneciton handle]
   */
  getConnection() {
    if (this.connection) {
      return Promise.resolve(this.connection);
    }

    let config = this.config;
    let str = `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

    if (this.pool) {
      let fn = helper.promisify(this.pool.getConnection, this.pool);
      return fn().catch(err => {
        this.close();
        return Promise.reject(err);
      });
    }

    if (config.connectionLimit) {
      this.pool = mysql.createPool(config);
      return this.getConnection();
    }

    return debounceInstance.debounce(str, () => {
      return new Promise((resolve,reject) => {
        this.connection = mysql.createConnection(config);
        this.connection.connect(err => {
          if (err) {
            reject(err);
            this.close();
          } else {
            this[bindConnectionEvent]();
            resolve(this.connection);
          }
        });
      }).then(connection => {
        if(config.setNames){
          let fn = helper.promisify(connection.query, connection);
          return fn(`SET NAMES ${config.charset}`).then(() => connection);
        }
        return connection;
      });
    })
  }

  [bindConnectionEvent](){
    this.connection.on('error', () => {
      this.close();
    });
    this.connection.on('close', () => {
      this.close();
    });
    //PROTOCOL_CONNECTION_LOST
    this.connection.on('end', () => {
      this.connection = null;
    });
  }
  /**
   * close connections
   * @return {} []
   */
  close() {
    if (this.pool) {
      let fn = helper.promisify(this.pool.end, this.pool);
      return fn().then(() => this.pool = null);
    } else if (this.connection) {
      let fn = helper.promisify(this.connection.end, this.connection);
      return fn().then(() => this.connection = null);
    }
  }
}
module.exports = thinkMysql;
