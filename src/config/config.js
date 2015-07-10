'use strict';

let runtimePrefix = think.getPath(undefined, think.dirname.runtime);

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

  timeout: 10, //10 seconds

  resource_on: true,
  resource_reg: /^((?:resource|static)\/|[^\/]+\.(?!js)\w+$)/, 

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
  subdomain: {}, //subdomain deploy
  

  post: {
    json_content_type: ['application/json'],
    max_file_size: 1024 * 1024 * 1024, //1G
    max_fields: 100, 
    max_fields_size: 2 * 1024 * 1024, //2M,
    ajax_filename_header: 'x-filename',
    file_upload_path: runtimePrefix + '/upload',
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
    file: think.THINK_PATH + '/tpl/error.html',
    log: true,
    code: 500, //http status code
    key: 'errno', //error number
    msg: 'errmsg', //error message
    value: 1000 //default errno
  },
  cookie: {
    domain: '',
    path: '/',
    httponly: false,
    secure: false,
    timeout: 0
  },
  session: {
    name: 'thinkjs',
    type: 'file',
    path: runtimePrefix + '/session',
    secret: '',
    auth_key: 'think_auth_list',
    timeout: 24 * 3600,
    cookie: { // cookie options
      length: 32
    }
  },
  local: { //i18n
    name: 'think_lang',
    default: 'en'
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
    log_sql: true,
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
    root_path: '',
    theme: '',
    type: 'ejs',
    options: {}
  },
  cache: {
    type: 'file',
    prefix: 'thinkjs_',
    timeout: 6 * 3600, //6 hours
    path: runtimePrefix + '/cache',
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
  token: {
    name: '__TOKEN__', //name in session
    length: 32 //token length
  },
  memcache: {
    host: '127.0.0.1',
    port: 11211
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    password: '',
    timeout: 0
  },
  package: { //extra package version
    redis: '0.12.1',
    sqlite3: '3.0.8',
    ejs: '2.3.2',
    jade: '1.11.0',
    mongodb: '2.0.36'
  }
};