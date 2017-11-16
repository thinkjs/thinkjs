const assert = require('assert');
const helper = require('think-helper');
const mysql = require('think-mysql');
const gc = require('think-gc');
const initSessionData = Symbol('think-session-mysql-init');

/*
 DROP TABLE IF EXISTS `think_session`;
 CREATE TABLE `think_session` (
 `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
 `cookie` varchar(255) NOT NULL DEFAULT '',
 `data` text,
 `expire` bigint(11) NOT NULL,
 PRIMARY KEY (`id`),
 UNIQUE KEY `cookie` (`cookie`),
 KEY `expire` (`expire`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
 */

/**
 * use mysql to store session
 *
 */
class MysqlSession {
  constructor(options = {}, ctx) {
    assert(options.cookie, '.cookie required');
    const modelConfig = think.config('model');
    const useModel = modelConfig[modelConfig.type];
    if (useModel.handle.name.toLowerCase().indexOf('mysql') > -1) {
      this.options = Object.assign({}, useModel, options);
    }else{
      this.options = options;       
    }
    this.mysql = mysql.getInstance(this.options);
    this.ctx = ctx;
    this.data = {};
    this.tableName = (this.options.prefix || '') + 'session';
    this.gcType = `session_mysql`;
    gc(this, this.options.gcInterval);
  }


  [initSessionData]() {
    if (this.initPromise) {
      return this.initPromise;
    }
    if (this.options.fresh || this.status === -1) {
      return this.initPromise = Promise.resolve();
    }

    this.initPromise = this.mysql.query({
      sql: `SELECT * FROM ${this.tableName} WHERE cookie = ? `,
      values: [this.options.cookie]
    }).then(row => {
      if(row.length === 0) return;
      //session data is expired
      if(row[0].expire < Date.now()){
        return this.delete();
      }
      let content = row[0].data;
      content = JSON.parse(content);
      if (helper.isEmpty(content)) return;
      this.data = content;
    }).catch(
      err => console.log(err)
    );

    // flush session when request finish
    this.ctx.res.once('finish', () => {
      this.flush();
    });

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
      if(value === null){
        delete this.data[name];
      }else{
        this.data[name] = value;
      }
    });
  }

  'delete'() {
    return this[initSessionData]().then(() => {
      this.status = -1;
      this.data = {};
    });
  }

  flush() {
    if (this.status === -1) {
      this.status = 0;
      // delete data
      this.mysql.execute({
        sql: `DELETE FROM ${this.tableName} WHERE cookie=?`,
        values: [this.options.cookie]
      })
    } else if (this.status === 1) {
      this.status = 0;
      // insert or update data
      const maxAge = Date.now() + helper.ms(this.options.maxAge || 0);
      let fields = [this.options.cookie, JSON.stringify(this.data), maxAge];
      this.mysql.execute({
        sql: `INSERT INTO ${this.tableName} (cookie, data, expire) VALUES(?, ?, ?) 
            ON DUPLICATE KEY UPDATE data=?, expire=?`,
        values: [...fields, fields[1], fields[2]]
      })
    }
    return Promise.resolve();
  }

  gc(){
    this.mysql.execute({
      sql: `DELETE FROM ${this.tableName} WHERE expire < ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000)`,
    })
  }
}
module.exports = MysqlSession;