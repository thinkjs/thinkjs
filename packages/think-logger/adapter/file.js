const log4js = require('log4js');
const Base = require('./base');

class FileLogger extends Base {
  constructor(config) {
    super(config);
    
    config = Object.assign({
      appenders: [
        {type: 'file', filename: config.filename}
      ]
    }, config);
    log4js.configure(config);
    this._logger = log4js.getLogger();
  }
}

module.exports = FileLogger;