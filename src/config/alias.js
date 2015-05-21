/**
 * thinkjs module path config
 * @type {Object}
 */
let root = think.THINK_LIB_PATH;
module.exports = {
  base: `${root}/core/base.js`,
  app: `${root}/core/app.js`,
  http: `${root}/core/http.js`,
  view: `${root}/core/view.js`,
  auth: `${root}/util/auth.js`,
  cookie: `${root}/util/cookie.js`,
  valid: `${root}/util/valid.js`,
  await: `${root}/util/await.js`,
  //websocket: root + '/util/websocket.js'
};