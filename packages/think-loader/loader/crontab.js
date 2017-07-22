const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const helper = require('think-helper');
const debug = require('debug')(`think-loader-crontab-${process.pid}`);

/**
 * load crontab
 */
module.exports = function loader(appPath, modules) {
  if (modules.length) {
    let crontab = [];
    modules.forEach(m => {
      const filepath = path.join(appPath, `${m}/config/crontab.js`);
      if (helper.isFile(filepath)) {
        debug(`load file: ${filepath}`);
        const data = interopRequire(filepath, true) || [];
        crontab = crontab.concat(data);
      }
    });
    return crontab;
  }
  const filepath = path.join(appPath, 'config/crontab.js');
  if (helper.isFile(filepath)) {
    debug(`load file: ${filepath}`);
    return interopRequire(filepath, true) || [];
  }
  return [];
};
