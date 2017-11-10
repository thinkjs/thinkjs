const log4js = require('log4js');
const _logger = Symbol('_logger');

module.exports = class {
  constructor() {
    this[_logger] = {};
  }

  debug(...args) {
    return this[_logger].debug(...args);
  }

  info(...args) {
    return this[_logger].info(...args);
  }

  warn(...args) {
    return this[_logger].warn(...args);
  }

  error(...args) {
    return this[_logger].error(...args);
  }

  /**
   * log4js configure
   */
  configure(config) {
    return log4js.configure(config);
  }

  /**
   * log4js setLogger
   */
  setLogger(config, category) {
    this.configure(config);
    this[_logger] = log4js.getLogger(category);
  }
};
