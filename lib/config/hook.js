'use strict';

module.exports = {
  form_parse: ['parse_payload'],
  resource_check: ['resource'],
  resource_output: [],
  route_parse: ['clean_pathname', 'route'],
  app_begin: ['read_html_cache', 'read_session'],
  view_init: [],
  view_template: ['locate_template'],
  view_parse: ['parse_template'],
  view_filter: [],
  view_end: ['write_html_cache'],
  app_end: [],
  content_write: []
};