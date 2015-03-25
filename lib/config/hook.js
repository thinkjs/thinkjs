'use strict';

var hook = require('../comm/hook.js');

module.exports = {
  form_parse: [hook.parsePayLoad],
  resource_check: ['resource'],
  resource_output: [hook.outputResource],
  route_parse: [hook.cleanPathname, 'route'],
  app_begin: ['read_html_cache'],
  view_init: [],
  view_template: ['locate_template'],
  view_parse: ['parse_template'],
  view_filter: [],
  view_end: ['write_html_cache'],
  app_end: [hook.closeDb],
  content_write: []
};