const Base = require('./base');

module.exports = class ConsoleLogger extends Base {
  constructor(config) {
    super(config);

    let {level, ...lConfig} = config;
    level = level ? level.toUpperCase() : 'ALL';

    config = Object.assign({
      appenders: [
        {type: 'console', level}
      ]
    }, lConfig);

    this._logger = this.getLogger(config);
  }
};