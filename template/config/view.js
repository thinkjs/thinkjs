'use strict';
/**
 * template config
 * @type {Object}
 */
module.exports = {
  type: 'ejs',
  content_type: 'text/html',
  file_ext: '.html',
  file_depr: '_',
  root_path: think.ROOT_PATH + '/view',
  adapter: {
    ejs: {}
  }
};