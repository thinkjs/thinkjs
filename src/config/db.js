'use strict';

/**
 * db configs
 */
export default {
  type: 'mysql',
  host: '127.0.0.1',
  port: '',
  database: '',
  user: '',
  password: '',
  prefix: '',
  encoding: 'utf8',
  nums_per_page: 10,
  log_sql: false,
  log_connect: true,
  cache: {
    on: true,
    type: '',
    timeout: 3600
  }
};
