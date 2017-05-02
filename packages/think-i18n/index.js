const i18n = require('./src/i18n');

module.exports = function(options) {
  return (new i18n()).extend(options);
}
