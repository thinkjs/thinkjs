'use strict';

let runtimePrefix = think.getPath(undefined, think.dirname.runtime);

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

  timeout: 10, //10 seconds

  resource_on: true,
  resource_reg: /^((?:resource|static)\/|[^\/]+\.(?!js)\w+$)/, 

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
    file: think.THINK_PATH + '/tpl/500.html',
    detail: false, //show detail message
    log: true, //log error message
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
  locale: { //i18n
    name: 'think_locale',
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
    file_ext: '.json'
  },
  gc: {
    on: true,
    interval: 3600, // one hour
    filter: function(){
      let hour = (new Date()).getHours();
      if(hour === 4){
        return true;
      }
    }
  },
  html_cache: {
    on: false,
    type: 'file', //store type
    timeout: 3600, //1 hour
    rules: {},
    callback: undefined,
    file_ext: '.html'
  },
  csrf: {
    on: false,
    session_name: '__CSRF__', //name in session
    form_name: '__CSRF__', //name in form
    errno: 400,
    errmsg: 'token error'
  },
  memcache: {
    host: '127.0.0.1',
    port: 11211,
    username: '',
    password: '',
    timeout: 0
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
    mongodb: '2.0.36',
    memjs: '0.8.5'
  }
};