const I18n = require('./src/i18n');

module.exports = function(options) {
  return (new I18n()).extend(options);
};
