'use strict';

var hook = require('../comm/hook.js');

module.exports = {
  form_parse: [hook.parsePayLoad],
  resource_check: ['resource'],
  resource_output: [hook.outputResource],
  path_parse: [],
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