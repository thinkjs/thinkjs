const Base = require('./base');

module.exports = class GelfLogger extends Base {
  constructor(config) {
    super(config);

    const lConfig = Object.assign({}, config);
    const {host, hostname, port, facility} = lConfig;
    config = Object.assign({
      appenders: [{type: 'gelf', host, hostname, port, facility}]
    }, lConfig);

    this.setLogger(config);
  }
};
