const log4js = require('log4js');
const Base = require('./base');

class ConsoleLogger extends Base {
  constructor(config) {
    super(config);

    config = Object.assign({
      appenders: [
        {type: 'console'}
      ]
    }, config);
    log4js.configure(config);
    this._logger = log4js.getLogger();
  }
}

module.exports = ConsoleLogger;