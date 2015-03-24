/**
 * thinkjs module path config
 * @type {Object}
 */
var root = think.THINK_LIB_PATH;
module.exports = {
  base: root + '/core/base.js',
  // app: root + '/core/app.js',
  dispatcher: root + '/core/dispatcher.js',
  http: root + '/core/http.js',
  // view: root + '/core/view.js',
  // auth: root + '/util/auth.js',
  cookie: root + '/util/cookie.js',
  filter: root + '/util/filter.js',
  valid: root + '/util/valid.js',
  // websocket: root + '/util/websocket.js'
};