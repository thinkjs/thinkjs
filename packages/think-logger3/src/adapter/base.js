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
    let lConfig = Object.assign({}, config);
    let appenders = config.appenders;
    delete lConfig.appenders;

    if( cluster.isWorker ) {
      //worker log4js config
      return Object.assign({
        appenders: [
          {type: 'clustered'}
        ]
      }, lConfig);
    }

    //Master process
    if( !Object.keys(cluster.workers).length ) {
      return config;
    }
    
    return Object.assign({
      appenders: [
        {
          type: 'clustered',
          appenders
        }
      ]
    }, lConfig);
  }
};