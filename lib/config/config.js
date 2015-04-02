'use strict';

var prefix = think.getModulePath();

module.exports = {
  port: 8360, 
  host: '',
  encoding: 'utf-8',
  pathname_prefix: '', 
  pathname_suffix: '.html',
  proxy_on: false,
  hook_on: true, 
  cluster_on: false,
  sub_domain: false,

  resource_on: true,
  resource_reg: /^(resource\/|static\/|favicon\.ico|robot[s]*\.txt)/, 

  route_on: true,
  
  create_server: undefined,
  output_content: undefined,
  deny_module_list: [],
  default_module: 'home',
  default_controller: 'index', 
  default_action: 'index',
  call_controller: 'home/index/_404',
  action_suffix: 'Action',
  callback_name: 'callback',
  json_content_type: 'application/json',
  log_pid: true,
  

  post: {
    json_content_type: ['application/json'],
    max_file_size: 1024 * 1024 * 1024, //1G
    max_fields: 100, 
    max_fields_size: 2 * 1024 * 1024, //2M,
    ajax_filename_header: 'x-filename',
    file_upload_path: prefix + '/runtime/upload',
    file_auto_remove: true
  },
  
  websocket: {
    on: false,
    type: '',
    allow_origin: '',
    sub_protocal: '',
    message_handle: undefined
  },
  error: {
    callback: undefined, //when sys error, it will be invoked
    file: think.THINK_LIB_PATH + '/tpl/error.html',
    log: true,
    code: 500, //http status code
    key: 'errno', //error number
    msg: 'errmsg', //error message
    value: 1000 //default errno
  },
  cookie: {
    domain: '',
    path: '/',
    maxage: 0,
    httponly: false,
    secure: false,
    timeout: 0
  },
  session: {
    name: 'thinkjs',
    auto_start: false,
    start_filter: undefined,
    type: 'file',
    path: prefix + '/runtime/session',
    secret: '',
    timeout: 24 * 3600,
    cookie: { // cookie options
      length: 32
    }
  },
  local: { //i18n
    name: 'think_lang',
    _default: 'en'
  }, 
  db: {
    type: 'mysql',
    host: '127.0.0.1',
    port: '',
    name: '',
    user: '',
    pwd: '',
    prefix: 'think_',
    encoding: 'utf8',
    nums_per_page: 10,
    cache: {
      on: true,
      type: '',
      timeout: 3600
    }
  },
  tpl: {
    content_type: 'text/html',
    file_ext: '.html',
    file_depr: '_',
    type: 'swig',
    options: {}
  },
  cache: {
    type: 'file',
    prefix: 'thinkjs_',
    timeout: 6 * 3600, //6 hours
    path: prefix + '/runtime/cache',
    path_depth: 2,
    file_ext: '.json',
    gc: 4
  },
  html_cache: {
    on: false,
    timeout: 3600, //1 hour
    rules: {},
    callback: undefined,
    path: '',
    file_ext: '.html'
  },
  memcache: {
    host: '127.0.0.1',
    port: 11211
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    password: ''
  }
};