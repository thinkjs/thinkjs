const Base = require('./base');

module.exports = class DateFileLogger extends Base {
  constructor(config) {
    super(config);

    let {level, filename, pattern, alwaysIncludePattern, layouts, ...lConfig} = config;
    level = level ? level.toUpperCase() : 'ALL';

    //combine config for date file appender, common config for log4js
    config = Object.assign({
      appenders: [
        {type: 'file', level, filename, pattern, alwaysIncludePattern, layouts}
      ]
    }, lConfig);

    //check cluster mode
    config = this.isCluster(config);

    this._logger = this.getLogger(config);
  }
};