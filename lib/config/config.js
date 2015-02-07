 /**
* default config
 * @type {Object}
 */
module.exports = {
  port: 8360, 
  host: '',
  proxy: false,
  encoding: 'utf-8',
  pathname_prefix: '', 
  pathname_suffix: '.html',
  hook_on: true, 
  route_on: true,

  resource_on: true,
  resource_reg: /^(resource\/|static\/|favicon\.ico|robot\.txt)/, 

  post_json_content_type: ['application/json'],
  post_max_file_size: 1024 * 1024 * 1024,
  post_max_fields: 100,
  post_max_fields_size: 2 * 1024 * 1024, 
  post_ajax_filename_header: 'x-filename', 
  post_file_upload_path: think.APP_PATH + '/common/runtime/upload',
  post_file_autoremove: true,
  
  deny_module_list: [],
  default_module: 'home',
  default_controller: 'index', 
  default_action: 'index',
  call_controller: 'home/index/_404',
  call_method: '__call',
  before_action: '__before',
  after_action: '__after',
  action_params_bind: true,
  action_suffix: 'Action',
  callback_name: 'callback',
  json_content_type: 'application/json',
  auto_send_content_type: true, 

  use_cluster: false,
  rest_module: 'rest',
  load_ext_config: [],
  
  websocket: {
    on: false,
    allow_origin: '',
    sub_protocal: '',
    message_handle: undefined
  },
  error: {
    tpl: think.THINK_PATH + '/view/error.html',
    code: 500,
    key: 'errno',
    msg: 'errmsg',
    default_key: 1000
  },
  cookie: {
    domain: '',
    path: '/',
    timeout: 0
  },
  session: {
    name: 'thinkjs',
    type: 'file',
    path: '',
    options: {},
    secret: '',
    time: 24 * 3600
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
  },
  db_cache: {
    on: true,
    type: '',
    path: '',
    timeout: 3600
  },
  tpl: {
    content_type: 'text/html',
    file_ext: '.html',
    file_depr: '_',
    type: 'ejs',
    options: {}
  },
  token: {
    on: false,
    name: 'token',
    key: '{__TOKEN__}'
  },
  cache: {
    type: 'file',
    prefix: 'thinkjs_',
    timeout: 6 * 3600,
    path: think.APP_PATH + '/common/runtime/cache',
    file_ext: '.json',
    gc: 4
  },
  html_cache: {
    on: false,
    timeout: 3600,
    rules: {},
    path: '',
    callback: undefined,
    file_ext: '.html'
  },
  memcache: {
    host: '127.0.0.1',
    port: 11211
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
};