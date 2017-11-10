const Base = require('./base');

module.exports = class DateFileLogger extends Base {
  constructor(config, clusterMode) {
    super(config);

    const lConfig = Object.assign({}, config);
    // eslint-disable-next-line prefer-const
    let {level, filename, pattern, alwaysIncludePattern, absolute, layout} = lConfig;
    level = level ? level.toUpperCase() : 'ALL';

    // combine config for date file appender, common config for log4js
    config = Object.assign({
      appenders: {
        dateFile: {type: 'dateFile', filename, pattern, alwaysIncludePattern, absolute, layout}
      },
      categories: {
        default: {appenders: ['dateFile'], level}
      }
    }, lConfig);

    this.setLogger(config);
  }
};
