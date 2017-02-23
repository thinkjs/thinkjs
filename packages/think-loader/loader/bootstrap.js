const helper = require('think-helper');
const path = require('path');

/**
 * load bootstrap files
 */
function loadBoostrap(appPath, isMultiModule){
  let bootstrapPath = '';
  if(isMultiModule){
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

module.exports = {load: loadBoostrap};