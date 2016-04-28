'use strict';
/**
 * default config
 * @type {Object}
 */
let config = {
  port: 8360, 
  host: '',
  encoding: 'utf-8',
  pathname_prefix: '', 
  pathname_suffix: '.html',
  proxy_on: false,
  hook_on: true, 
  cluster_on: false,

  service_on: true, //Service available
  logic_on: true, //enable logic

  domain_on: false, //use domain

  timeout: 120, //120 seconds

  auto_reload: false, //file auto reload
  log_auto_reload: false, //log file auto reload

  resource_on: true,
  resource_reg: /^(static\/|[^\/]+\.(?!js|html)\w+$)/, 

  route_on: true,

  log_request: false,

  log_error: true,
  
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
/**
 * extra config on cli mode
 * @type {Object}
 */
let cliConfig = {
  auto_close_socket: true
};

if(think.cli){
  config = think.extend(config, cliConfig);
}

export default config;