const helper = require('think-helper');
const path = require('path');
const debug = require('debug')(`think-loader-bootstrap-${process.pid}`);

/**
 * load bootstrap files
 */
function loadBootstrap(appPath, modules, type = 'worker') {
  let bootstrapPath = '';
  if (modules.length) {
    bootstrapPath = path.join(appPath, 'common/bootstrap');
  } else {
    bootstrapPath = path.join(appPath, 'bootstrap');
  }
  const filepath = path.join(bootstrapPath, `${type}.js`);
  if (helper.isFile(filepath)) {
    debug(`load file: ${filepath}`);
    return require(filepath);
  }
}

module.exports = loadBootstrap;
