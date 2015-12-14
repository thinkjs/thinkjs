/**
 * thinkjs module path config
 * @type {Object}
 */
let root = think.THINK_LIB_PATH;
export default {
  base: `${root}/core/base.js`,
  app: `${root}/core/app.js`,
  http: `${root}/core/http.js`,
  view: `${root}/core/view.js`,
  auth: `${root}/util/auth.js`,
  cookie: `${root}/util/cookie.js`,
  validator: `${root}/util/validator.js`,
  await: `${root}/util/await.js`,
  parallel_limit: `${root}/util/parallel_limit.js`
};