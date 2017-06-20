const assert = require('assert');
const helper = require('think-helper');
const mysql = require('think-mysql');
const initSessionData = Symbol('think-session-mysql-init');

/**
 * use mysql to store session
 */
class MysqlSession {
  constructor(options = {}, ctx) {
    assert(options.cookie, '.cookie required');
    assert(options.tableName, '.tableName required');
    this.options = options;
    this.mysql = mysql.getInstance(this.options);
    this.ctx = ctx;
  }

  [initSessionData]() {
    if (this.initPromise) {
      return this.initPromise;
    }
    if (this.options.fresh || this.status === -1) {
      return this.initPromise = Promise.resolve();
    }

    this.initPromise = this.mysql.query({
      sql: `SELECT * FROM ${this.options.tableName} WHERE cookie = ? `,
      timeout: 5000,
      values: [this.options.cookie]
    }).then(row => {
      let content = row[0].data;
      content = JSON.parse(content);
      if (helper.isEmpty(content)) return;
      this.data = content;
    }).catch(
      err => console.log(err)
    );

    //flush session when request finish
    // this.ctx.res.once('finish', () => {
    //   this.flush();
    // });

    return this.initPromise;
  }

  get(name) {
    return this[initSessionData]().then(() => {
      if (this.options.autoUpdate) {
        this.status = 1;
      }
      return name ? this.data[name] : this.data;
    });
  }

  set(name, value) {
    return this[initSessionData]().then(() => {
      this.status = 1;
      this.data[name] = value;
    });
  }

  'delete'() {
    this.status = -1;
    this.data = {};
    return Promise.resolve();
  }

  flush() {
    if(this.status === -1){
      this.status = 0;
      // delete data
    }else if(this.status === 1){
      this.status = 0;
      // insert data
    }
    return Promise.resolve();
  }
}
module.exports = MysqlSession;