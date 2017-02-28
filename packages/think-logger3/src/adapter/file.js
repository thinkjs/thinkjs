const log4js = require('log4js');
const Base = require('./base');

class FileLogger extends Base {
  constructor(config) {
    super(config);

    let level = "ALL";
    if(config.level) {
      level = config.level.toUpperCase();
      delete level;
    }    

    config = Object.assign({
      appenders: [
        {
          level,
          type: 'file', 
          filename: config.filename
        }
      ]
    }, config);
    log4js.configure(config);
    this._logger = log4js.getLogger();
  }
}

module.exports = FileLogger;