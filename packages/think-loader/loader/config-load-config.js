const loadConfigByName = require('./config-load-config-by-name');
/**
 * load config
 * src/config/config.js
 * src/config/config.[env].js
 */
const loadConfig = (configPaths, env, name = 'config') => {
  let config = {};
  loadConfigByName(config, configPaths, `${name}.js`);
  loadConfigByName(config, configPaths, `${name}.${env}.js`);
  return config;
}

module.exports = loadConfig;