const Base = require('./base');

module.exports = class FileLogger extends Base {
  constructor(config, clusterMode) {
    super(config);

    const lConfig = Object.assign({}, config);
    // eslint-disable-next-line prefer-const
    let {level, filename, maxLogSize, backups, absolute, layout} = config;
    level = level ? level.toUpperCase() : 'ALL';

    // combine config for file appender, common config for log4js
    config = Object.assign({
      appenders: [
        {type: 'file', level, filename, maxLogSize, backups, absolute, layout}
      ]
    }, lConfig);
    // check cluster mode
    config = this.isCluster(config, clusterMode);

    this.setLogger(config);
  }
};
