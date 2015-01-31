 /**
 * 框架默认配置
 * 可以在App/Conf/config.js里修改下面的配置值
 * @type {Object}
 */
module.exports = {
  port: 8360, //监听端口
  host: '', //监听的host
  proxy: false, //是否使用代理访问，如：nginx。开启后不能通过ip+端口直接访问
  encoding: 'utf-8', //输出数据的编码
  url_pathname_prefix: '',  //不解析的pathname前缀
  url_pathname_suffix: '.html', //不解析的pathname后缀，这样利于seo
  app_tag_on: true, //是否支持标签功能
  url_resource_on: true,  //是否监听静态资源类请求
  url_resource_reg: /^(resource\/|static\/|favicon\.ico|robot\.txt)/, //判断是否是静态资源的正则
  url_route_on: true, //是否开启自定义路由功能

  post_json_content_type: ['application/json'], //post数据为json时的content-type
  post_max_file_size: 1024 * 1024 * 1024, //上传文件大小限制，默认1G
  post_max_fields: 100, //最大表单数，默认为100
  post_max_fields_size: 2 * 1024 * 1024, //单个表单长度最大值，默认为2MB
  post_ajax_filename_header: 'x-filename', //通过ajax上传文件时文件名对应的header，如果有这个header表示是文件上传
  post_file_upload_path: think.APP_PATH + '/common/runtime/temp', //文件上传的临时目录
  post_file_autoremove: true, //请求完成时，自动删除未处理的上传缓存文件
  
  deny_module_list: [],
  default_module: 'home', //默认分组
  default_controller: 'index', //默认模块
  default_action: 'index',  //默认Action
  call_controller: 'home/index/_404', //controller不存在时执行方法，此配置表示调用Home分组下IndexController的_404Action方法
  call_method: '__call', //当找不到方法时调用什么方法，这个方法存在时才有效
  before_action: '__before', //调用一个action前调用的方法，会将action名传递进去
  after_action: '__after', //调用一个action之后调用的方法，会将action名传递进去
  url_params_bind: true, //方法参数绑定,将URL参数值绑定到action的参数上
  action_suffix: 'Action', //action后缀
  url_callback_name: 'callback', //jsonp格式的callback名字
  json_content_type: 'application/json', //发送json时的content-type
  auto_send_content_type: true, //是否自动发送Content-Type,默认值为`tpl_content_type`配置值
  log_process_pid: true, //记录进程的id,方便其他脚本处理。
  use_cluster: false, //是否使用cluster，默认不使用，0：为cpu的数量，可以自定义值
  create_server_fn: '', //自定义create server全局函数名，可以在Common/common.js里实现

  restful_group: 'Restful', //RESTFUL API默认分组

  load_ext_config: [], //加载额外的配置文件 CONF_PATH
  load_ext_file: [], //加载额外的文件 COMMON_PATH

  websocket: {
    on: false,
    allow_origin: '',
    sub_protocal: '',
    message_handle: undefined
  },

  error: {
    tpl_path: think.THINK_PATH + '/view/error.html',
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
    sign: '',
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
    charset: 'utf8',
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
    prefix: '__thinkjs__',
    timeout: 6 * 3600,
    path: think.cache,
    file_ext: '.json',
    gc: 4
  }

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