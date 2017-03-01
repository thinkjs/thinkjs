const log4js = require('log4js');
const cluster = require('cluster');

module.exports = class {
  constructor() {
    this._logger = {};
  }
  
  debug(...args) {
    return this._logger.debug(...args);
  }

  info(...args) {
    return this._logger.info(...args);
  }

  warn(...args) {
    return this._logger.warn(...args);
  }

  error(...args) {
    return this._logger.error(...args);
  }
  
  /**
   * log4js configure
   */
  configure(config) {
    return log4js.configure(config);
  }

  /**
   * log4js getLogger
   */
  getLogger(config, category) {
    this.configure(config);
    return log4js.getLogger(category);
  }

  /**
   * use clustered type if in cluster mode
   */
  isCluster(config) {
    if( !Object.keys(cluster.workers).length ) {
      return config;
    }

    if( cluster.isMaster ) {
      return {type: 'clustered', appenders: config};
    }

    //worker log4js config
    return {type: 'clustered'};
  }
};