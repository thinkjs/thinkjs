const Base = require('./base');

class DateFileLogger extends FileLogger {
  constructor(config) {
    super(config);

    let {level, filename, pattern, alwaysIncludePattern, layouts...lConfig} = config;
    level = level.toUpperCase() || "ALL";

    //combine config for date file appender, common config for log4js
    config = Object.assign({
      appenders: [
        {type: 'file', level, filename, pattern, alwaysIncludePattern, layouts}
      ]
    }, lConfig);
    //check cluster mode
    config = this.isCluster(config);

    log4js.configure(config);
    this._logger = log4js.getLogger();
  }
}