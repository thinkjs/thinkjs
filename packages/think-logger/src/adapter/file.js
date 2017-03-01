const log4js = require('log4js');
const Base = require('./base');
const cluster = require('cluster');

class FileLogger extends Base {
  constructor(config) {
    super(config);

    let {level, filename, maxLogSize, backups, layouts, ...lConfig} = config;
    level = level.toUpperCase() || "ALL";

    //combine config for file appender, common config for log4js
    config = Object.assign({
      appenders: [
        {type: 'file', level, filename, maxLogSize, backups, layouts}
      ]
    }, lConfig);
    //check cluster mode
    config = this.isCluster(config);

    log4js.configure(config);
    this._logger = log4js.getLogger();
  }
}

module.exports = FileLogger;