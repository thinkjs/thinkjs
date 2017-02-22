const helper = require('think-helper');
const path = require('path');

function loader(appPath, isMultiModule, thinkPath, env){
  const thinkConfig = require(path.join(thinkPath, 'lib/config/config.js'));
  if(isMultiModule){
    
  }else{
    
  }
}

module.exports = loader;