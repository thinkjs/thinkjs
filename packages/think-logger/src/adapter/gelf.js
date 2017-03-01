const Base = require('./base');

module.exports = class GelfLogger extends Base {
  constructor(config) {
    super(config);

    let {host, hostname, port, facility, ...lConfig} = config;
    config = Object.assign({
      appenders: [{type: 'gelf', host, hostname, port, facility}]
    }, lConfig);

    this._logger = this.getLogger(config);
  }
};