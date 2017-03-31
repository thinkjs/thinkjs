const mysql = require('mysql');
const helper = require('think-helper');
const assert = require('assert');

class thinkMysql {
  /**
   * @param  {Object} config [connection options]
   */
  constructor(config = {}) {
    this.config = config;
  }
}
module.exports = thinkMysql;
