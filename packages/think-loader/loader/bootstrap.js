const helper = require('think-helper');
const path = require('path');

/**
 * load bootstrap files
 */
function loadBootstrap(appPath, modules){
  let bootstrapPath = '';
  if(modules.length){
    bootstrapPath = path.join(appPath, 'common/bootstrap');
  }else{
    bootstrapPath = path.join(appPath, 'bootstrap');
  }
  //only load js files
  let files = helper.getdirFiles(bootstrapPath).filter(file => {
    return /\.js$/.test(file);
  });
  return files.map(file => {
    return require(path.join(bootstrapPath, file));
  });
}

module.exports = loadBootstrap;

