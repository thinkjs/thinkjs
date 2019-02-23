'use strict';

/**
 * db configs
 */
export default {
  type: 'mysql',
  adapter: {
    mysql: {
      encoding: 'utf8',
      nums_per_page: 10,
      log_sql: false,
      log_connect: true,
      camel_case: false,
      cache: {
        on: true,
        type: '',
        timeout: 3600
      }
    }
  }
};
