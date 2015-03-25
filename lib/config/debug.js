/**
 * config in debug mode
 * @type {Object}
 */
var config = {
  auto_reload: true,
  auto_reload_except: ['/node_modules/', '/lib/core/think.js'],
  log_pid: false
}

if (think.mode === 'cli') {
  config.auto_reload = false;
}

module.exports = config;