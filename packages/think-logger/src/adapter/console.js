const Base = require('./base');

module.exports = class ConsoleLogger extends Base {
  formatConfig(config) {
    let {level, layout} = config;
    level = level ? level.toUpperCase() : 'ALL';
    layout = layout || {type: 'pattern', pattern: '%[[%d] [%z] [%p]%] - %m'};

    return Object.assign({
      appenders: {
        console: {type: 'console', layout}
      },
      categories: {
        default: {appenders: ['console'], level}
      }
    }, config);
  }
};
