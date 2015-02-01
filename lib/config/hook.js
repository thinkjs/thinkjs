'use strict';

var hook = require('../common/hook.js');

module.exports = {
  app_init: [],
  form_parse: [hook.parsePayLoad],
  path_info: [],
  resource_check: ['resource'],
  resource_output: [hook.outputResource],
  route_check: ['route'],
  app_begin: ['read_html_cache'],
  action_init: [],
  view_init: [],
  view_template: ['locate_template'],
  view_parse: ['parse_template'],
  view_filter: [],
  view_end: ['write_html_cache'],
  action_end: [],
  app_end: [hook.closeDb],
  content_write: []
};