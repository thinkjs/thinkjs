const path = require('path');
const interopRequire = require('./util.js').interopRequire;

/**
 * load validator
 */
module.exports = function load(appPath, modules) {
  let filepath = '';
  if (modules.length) {
    filepath = path.join(appPath, 'common/config/validator.js');
  } else {
    filepath = path.join(appPath, 'config/validator.js');
  }
  const data = interopRequire(filepath, true) || {};
  return data;
};
