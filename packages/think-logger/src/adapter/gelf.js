const Base = require('./base');

module.exports = class GelfLogger extends Base {
  formatConfig(config) {
    const {level, host, hostname, port, facility} = config;
    return Object.assign({
      appenders: {
        gelf: {type: 'gelf', host, hostname, port, facility}
      },
      categories: {
        default: {appenders: ['gelf'], level}
      }
    }, config);
  }
};
