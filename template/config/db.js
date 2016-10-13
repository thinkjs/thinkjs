'use strict';
/**
 * db config
 * @type {Object}
 */
module.exports = {
  type: 'mysql',
  adapter: {
    mysql: {
      host: '127.0.0.1',
      port: '',
      database: '',
      user: '',
      password: '',
      prefix: '',
      encoding: 'utf8'
    },
    mongo: {

    }
  }
};