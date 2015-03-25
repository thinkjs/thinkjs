'use strict';

module.exports = {
  app_init: [],
  form_parse: ['parsePayload'],
  resource_check: ['resource'],
  resource_output: ['cleanPathname'],
  route_parse: ['cleanPathname', 'route'],
  app_begin: ['read_html_cache'],
  view_init: [],
  view_template: ['locate_template'],
  view_parse: ['parse_template'],
  view_filter: [],
  view_end: ['write_html_cache'],
  app_end: [],
  content_write: []
};