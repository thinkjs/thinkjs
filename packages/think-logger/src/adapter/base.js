const log4js = require('log4js');
const _logger = Symbol('_logger');

module.exports = class {
  constructor(config) {
    this[_logger] = {};
    const logConfig = this.formatConfig(config);
    this.setLogger(logConfig);
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

  formatConfig(config) {
    return config;
  }
};
