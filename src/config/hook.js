'use strict';

export default {
  form_parse: ['parse_json_payload'],
  resource_check: ['resource'],
  resource_output: ['output_resource'],
  route_parse: ['rewrite_pathname', 'subdomain_deploy', 'route'],
  app_begin: ['check_csrf', 'read_html_cache'],
  view_init: [],
  view_template: ['locate_template'],
  view_parse: ['parse_template'],
  view_filter: [],
  view_end: ['write_html_cache'],
  app_end: []
};