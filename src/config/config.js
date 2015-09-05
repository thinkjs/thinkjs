'use strict';

export default {
  port: 8360, 
  host: '',
  encoding: 'utf-8',
  pathname_prefix: '', 
  pathname_suffix: '.html',
  proxy_on: false,
  hook_on: true, 
  cluster_on: false,

  service_on: true, //Service available

  timeout: 30, //30 seconds

  auto_reload: false, //file auto reload

  resource_on: true,
  resource_reg: /^(static\/|[^\/]+\.(?!js|html)\w+$)/, 

  route_on: true,

  log_pid: false,
  log_request: false,
  
  create_server: undefined,
  output_content: undefined,
  deny_module_list: [],
  default_module: 'home',
  default_controller: 'index', 
  default_action: 'index',
  callback_name: 'callback',
  json_content_type: 'application/json',
  subdomain: {} //subdomain deploy
};