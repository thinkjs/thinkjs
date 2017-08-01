const Base = require('./base');

module.exports = class ConsoleLogger extends Base {
  constructor(config) {
    super(config);

    const lConfig = Object.assign({}, config);
    let {level, layout} = lConfig;
    level = level ? level.toUpperCase() : 'ALL';
    layout = layout || {type: 'pattern', pattern: '%[[%d] [%z] [%p]%] - %m'};

    config = Object.assign({
      appenders: [
        {type: 'console', level, layout}
      ]
    }, lConfig);

    this.setLogger(config);
  }
};
