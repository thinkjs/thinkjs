const Base = require('./base');

module.exports = class ConsoleLogger extends Base {
  constructor(config) {
    super(config);

    let lConfig = Object.assign({}, config);
    let {level, layout} = lConfig;
    level = level ? level.toUpperCase() : 'ALL';
    layout = layout ? layout : {type: 'pattern', pattern: '%[[%d] [%p]%] - %m'};

    config = Object.assign({
      appenders: [
        {type: 'console', level, layout}
      ]
    }, lConfig);

    this._logger = this.getLogger(config);
  }
};