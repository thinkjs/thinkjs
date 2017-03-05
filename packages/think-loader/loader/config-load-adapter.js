const loadConfig = require('./config-load-config');

/**
 * load adapter
 * src/config/adapter.js
 * src/config/adapter.[env].js
 */
const loadAdapter = (configPath, env) => {
  return loadConfig(configPath, env, 'adapter');
}

module.exports = loadAdapter;