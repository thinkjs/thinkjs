const path = require('path');
const nunjucks = require('think-view-nunjucks');
const ejs = require('think-view-ejs');
/**
 * view
 */
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    extname: '.html',
    sep: '_' //seperator between controller and action
  },
  nunjucks: {
    handle: nunjucks
  },
  ejs: {
    handle: ejs
  }
}