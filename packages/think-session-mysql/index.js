const assert = require('assert');
const helper = require('think-helper');
const mysql = require('think-mysql');
const gc = require('think-gc');
const initSessionData = Symbol('think-session-mysql-init');

/*
CREATE TABLE `think_session` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cookie` varchar(255) NOT NULL DEFAULT '',
  `data` text,
  `expire` bigint(11) NOT NULL DEFAULT '0',
  `maxage` int(11) NOT NULL DEFAULT '0',
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
  constructor(options = {}, ctx, cookieOptions) {
    assert(options.cookie, '.cookie required');
    this.options = options;
    this.cookieOptions = cookieOptions;
    this.mysql = mysql.getInstance(helper.omit(options, 'cookie'));
    this.ctx = ctx;
    this.data = {};
    this.tableName = (this.options.prefix || '') + 'session';
    this.status = 0;
    this.maxAge = this.options.maxAge || 0;
    this.expire = 0;
    this.gcType = `session_mysql`;
    gc(this, this.options.gcInterval);
  }

  [initSessionData]() {
    if (this.initPromise) {
      return this.initPromise;
    }
    if (this.options.fresh || this.status === -1) {
      this.initPromise = Promise.resolve();
      return this.initPromise;
    }

    // flush session when request finish
    this.ctx.res.once('finish', () => {
      this.flush();
    });

    this.initPromise = this.mysql.query({
      sql: `SELECT * FROM ${this.tableName} WHERE cookie = ? `,
      values: [this.options.cookie]
    }).then(row => {
      if (row.length === 0) return;
      // session data is expired
      if (row[0].expire < Date.now()) {
        return this.delete();
      }
      const content = row[0].data;
      this.data = JSON.parse(content) || {};
      if (row[0].maxAge) {
        this.maxAge = row[0].maxAge;
      }
      this.expire = row[0].expire;
      this.autoUpdate();
    }).catch(err => {
      console.error(err);
    });
    return this.initPromise;
  }
  autoUpdate() {
    if (this.maxAge && this.expire) {
      const rate = (this.expire - Date.now()) / this.maxAge;
      if (rate < this.cookieOptions.autoUpdateRate) {
        this.status = 1;
        this.cookieOptions.maxAge = this.maxAge;
        // update cookie maxAge
        this.ctx.cookie(this.cookieOptions.name, this.options.cookie, this.cookieOptions);
      }
    }
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
      if (value === null) {
        delete this.data[name];
      } else {
        this.data[name] = value;
      }
    });
  }

  'delete'() {
    this.status = -1;
    this.data = {};
    return Promise.resolve();
  }

  flush() {
    if (this.status === -1) {
      this.status = 0;
      // delete data
      this.mysql.execute({
        sql: `DELETE FROM ${this.tableName} WHERE cookie=?`,
        values: [this.options.cookie]
      });
    } else if (this.status === 1) {
      this.status = 0;
      // insert or update data
      const expire = Date.now() + this.maxAge;
      const fields = [this.options.cookie, JSON.stringify(this.data), expire, this.maxAge];
      this.mysql.execute({
        sql: `INSERT INTO ${this.tableName} (cookie, data, expire, maxage) VALUES(?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE data=?, expire=?, maxage=?`,
        values: [...fields, fields[1], fields[2], fields[3]]
      });
    }
    return Promise.resolve();
  }

  gc() {
    return this.mysql.execute({
      sql: `DELETE FROM ${this.tableName} WHERE expire < ${Date.now()}`
    });
  }
}
module.exports = MysqlSession;
