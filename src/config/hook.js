'use strict';

export default {
  payload_parse: ['parse_form_payload', 'parse_single_file_payload', 'parse_json_payload', 'parse_querystring_payload'],
  payload_validate: ['validate_payload'],
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