const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const debug = require('debug')(`think-loader-${process.pid}`);

/**
 * load crontab
 */
module.exports = function loader(appPath, modules) {
  let filepath = '';
  if (modules.length) {
    filepath = path.join(appPath, 'common/config/crontab.js');
  } else {
    filepath = path.join(appPath, 'config/crontab.js');
  }
  debug(`load file: ${filepath}`);
  const data = interopRequire(filepath, true) || [];
  return data;
};
