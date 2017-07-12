const log4js = require('log4js');
const cluster = require('cluster');

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

  /**
   * use clustered type if in cluster mode
   */
  isCluster(config, clusterMode) {
    const lConfig = Object.assign({}, config);
    const appenders = config.appenders;
    delete lConfig.appenders;

    if (cluster.isWorker) {
      // worker log4js config
      return Object.assign({
        appenders: [
          {type: 'clustered'}
        ]
      }, lConfig);
    }

    // Master process
    if (typeof (clusterMode) === 'undefined') {
      clusterMode = Object.keys(cluster.workers).length;
    }
    if (!clusterMode) {
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
