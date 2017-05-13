const Base = require('./base');

module.exports = class DateFileLogger extends Base {
  constructor(config, clusterMode) {
    super(config);

    let lConfig = Object.assign({}, config);
    let {level, filename, pattern, alwaysIncludePattern, absolute, layouts} = lConfig;
    level = level ? level.toUpperCase() : 'ALL';

    //combine config for date file appender, common config for log4js
    config = Object.assign({
      appenders: [
        {type: 'file', level, filename, pattern, alwaysIncludePattern, absolute, layouts}
      ]
    }, lConfig);

    //check cluster mode
    config = this.isCluster(config, clusterMode);

    this._logger = this.getLogger(config);
  }
};