const Base = require('./base');

module.exports = class DateFileLogger extends Base {
  formatConfig(config) {
    // eslint-disable-next-line prefer-const
    let {level, filename, pattern, alwaysIncludePattern, absolute, layout} = config;
    level = level ? level.toUpperCase() : 'ALL';

    return Object.assign({
      appenders: {
        dateFile: {type: 'dateFile', filename, pattern, alwaysIncludePattern, absolute, layout}
      },
      categories: {
        default: {appenders: ['dateFile'], level}
      }
    }, config);
  }
};
