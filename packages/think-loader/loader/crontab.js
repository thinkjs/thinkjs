const path = require('path');
const interopRequire = require('./util.js').interopRequire;

/**
 * load crontab
 */
module.exports = function loader(appPath, modules){
  let filepath = '';
  if(modules.length){
    filepath = path.join(appPath, 'common/config/crontab.js');
  }else{
    filepath = path.join(appPath, 'config/crontab.js');
  }
  let data = interopRequire(filepath, true) || [];
  return data;
}