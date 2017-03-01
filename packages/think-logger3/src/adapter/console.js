const log4js = require('log4js');
const Base = require('./base');

class ConsoleLogger extends Base {
  constructor(config) {
    super(config);

    let level = 'ALL';
    if(config.level) {
      level = config.level.toUpperCase();
      delete config.level;
    }

    config = Object.assign({
      appenders: [
        {type: 'console', level}
      ]
    }, config);
    log4js.configure(config);
    this._logger = log4js.getLogger();
  }
}

module.exports = ConsoleLogger;