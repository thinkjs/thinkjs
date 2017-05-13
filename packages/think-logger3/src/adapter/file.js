const Base = require('./base');

module.exports = class FileLogger extends Base {
  constructor(config, clusterMode) {
    super(config);

    let lConfig = Object.assign({}, config);
    let {level, filename, maxLogSize, backups, absolute, layouts} = config;
    level = level ? level.toUpperCase() : 'ALL';

    //combine config for file appender, common config for log4js
    config = Object.assign({
      appenders: [
        {type: 'file', level, filename, maxLogSize, backups, absolute, layouts}
      ]
    }, lConfig);
    //check cluster mode
    config = this.isCluster(config, clusterMode);

    this._logger = this.getLogger(config);
  }
};