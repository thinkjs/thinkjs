const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const debug = require('debug')(`think-loader-validator-${process.pid}`);

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
  debug(`load file: ${filepath}`);
  const data = interopRequire(filepath, true) || {};
  return data;
};
