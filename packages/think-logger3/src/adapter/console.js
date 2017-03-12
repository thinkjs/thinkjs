const Base = require('./base');

module.exports = class ConsoleLogger extends Base {
  constructor(config) {
    super(config);

    let lConfig = Object.assign({}, config);
    let {level} = lConfig;
    level = level ? level.toUpperCase() : 'ALL';

    config = Object.assign({
      appenders: [
        {type: 'console', level}
      ]
    }, lConfig);

    this._logger = this.getLogger(config);
  }
};