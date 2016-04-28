/**
 * thinkjs module path config
 * @type {Object}
 */

import path from 'path';

let {sep} = path;
let rootPath = think.THINK_LIB_PATH + sep;

export default {
  base: `${rootPath}core${sep}base.js`,
  app: `${rootPath}core${sep}app.js`,
  http: `${rootPath}core${sep}http.js`,
  view: `${rootPath}core${sep}view.js`,
  // auth: `${rootPath}util${sep}auth.js`,
  cookie: `${rootPath}util${sep}cookie.js`,
  validator: `${rootPath}util${sep}validator.js`,
  await: `${rootPath}util${sep}await.js`,
  parallel_limit: `${rootPath}util${sep}parallel_limit.js`
};