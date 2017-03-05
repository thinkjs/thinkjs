const helper = require('think-helper');
const path = require('path');


const loadConfigByName = (config, configPaths, name)=>{
  configPaths.forEach(configPath => {
    let filepath = path.join(configPath, name);
    if(helper.isFile(filepath)){
      config = helper.extend(config, require(filepath));
    }
  });
}

module.exports = loadConfigByName