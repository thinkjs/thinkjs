const path = require('path');
const helper = require('think-helper');

function loader(appPath, isMultiModule){
  const filepath = path.join(appPath, isMultiModule ? 'common/config/extend.js' : 'config/extend.js');
  if(helper.isFile(filepath)){
    return require(filepath);
  }
  return [];
}

module.exports = loader;