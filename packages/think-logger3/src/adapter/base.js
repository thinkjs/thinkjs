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