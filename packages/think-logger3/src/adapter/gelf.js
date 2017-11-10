const Base = require('./base');

module.exports = class GelfLogger extends Base {
  constructor(config) {
    super(config);

    const lConfig = Object.assign({}, config);
    const {level, host, hostname, port, facility} = lConfig;
    config = Object.assign({
      appenders: {
        gelf: {type: 'gelf', host, hostname, port, facility}
      },
      categories: {
        default: {appenders: ['gelf'], level}
      }
    }, lConfig);

    this.setLogger(config);
  }
};
