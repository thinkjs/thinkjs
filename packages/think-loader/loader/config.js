const helper = require('think-helper');
const path = require('path');
const fs = require('fs');
const loadConfig = require('./config-load-config');
const loadAdapter = require('./config-load-adapter');
const formatAdapter = require('./config-format-adapter');

const THINK_CONFIG_PATH = 'config/config.js';

/**
 * load config files
 * src/config/config.js
 * src/config/config.[env].js
 * src/config/adapter.js
 * src/config/adapter.[env].js
 */
module.exports = {
  load(appPath, isMultiModule, thinkPath, env){
    const thinkConfig = require(path.join(thinkPath, THINK_CONFIG_PATH));
    if(isMultiModule){
       let dirs = fs.readdirSync(appPath);
       let result = {};
       dirs.forEach(dir => {
         if(dir === 'common'){
           return;
         }
         //merge common & module config
         let paths = [
           path.join(appPath, 'common'),
           path.join(appPath, dir)
         ];
         let config = loadConfig(paths, env);
         let adapter = loadAdapter(paths, env);
         result[dir] = helper.extend({}, thinkConfig, config, formatAdapter(adapter));
       });
       return result;
    }else{
      let configPath = path.join(appPath, 'config');
      let config = loadConfig([configPath], env);
      let adapter = loadAdapter([configPath], env);
      return helper.extend({}, thinkConfig, config, formatAdapter(adapter));
    }
  }
};