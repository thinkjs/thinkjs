var fs = require('fs');
var cluster = require('cluster');

//自动加载进行识别的路径
var autoloadPaths = {};
/**
 * [exports description]
 * @type {Object}
 */
module.exports = {
  /**
   * [run description]
   * @return {[type]} [description]
   */
  run: function(){
    'use strict';
    this.init();
    //加载文件
    this.loadFiles();
    //合并自动加载的路径
    this.mergeAutoloadPath();
    //thinkRequire的autoload
    registerAutoload(this.autoload);
    //debug模式
    if (APP_DEBUG) {
      this.debug();
    }else{
      this.processEvent();
      //记录日志
      this.log();
    }
    //记录进程的id
    this.logPid();
  },
  /**
   *  定义一些目录，加载框架的基础文件
   * @return {[type]} [description]
   */
  init: function(){
    'use strict';
    //系统路径设置
    global.THINK_LIB_PATH = THINK_PATH + '/Lib';
    global.THINK_EXTEND_PATH = THINK_LIB_PATH + '/Extend';
    //应用路径设置
    var config = {
      COMMON_PATH: APP_PATH + '/Common',
      LIB_PATH: APP_PATH + '/Lib',
      CONF_PATH: APP_PATH + '/Conf',
      LANG_PATH: APP_PATH + '/Lang',
      VIEW_PATH: APP_PATH + '/View',
      //HTML_PATH: RUNTIME_PATH + '/Html',
      LOG_PATH: RUNTIME_PATH + '/Log',
      TEMP_PATH: RUNTIME_PATH + '/Temp',
      DATA_PATH: RUNTIME_PATH + '/Data',
      CACHE_PATH: RUNTIME_PATH + '/Cache'
    };
    for (var name in config) {
      if (global[name] === undefined) {
        global[name] = config[name];
      }
    }
    require(THINK_PATH + '/Common/extend.js');
    require(THINK_PATH + '/Common/common.js');
    require(THINK_PATH + '/Common/function.js');
    //别名导入
    aliasImport(require(THINK_PATH + '/Conf/alias.js'));
  },
  /**
   * 记录日志
   * @return {[type]} [description]
   */
  log: function(){
    'use strict';
    if (C('log_record')) {
      thinkRequire('Log')(C('log_console_path')).console();
    }
    if (C('log_memory_usage')) {
      thinkRequire('Log')(C('log_memory_path')).memory();
    }
  },
  /**
   * 安全方式加载文件
   * @param  {[type]} file [description]
   * @return {[type]}      [description]
   */
  safeRequire: function(file){
    'use strict';
    try{
      return require(file);
    }catch(e){
      console.error(e.stack);
    }
    return {};
  },
  /**
   * 注册异常处理
   * @return {[type]} [description]
   */
  processEvent: function(){
    'use strict';
    process.on('uncaughtException', function(err) {
      console.error(isError(err) ? err.stack : err);
    });
  },
  /**
   * 加载项目下对应的文件
   * @return {[type]} [description]
   */
  loadFiles: function(){
    'use strict';
    C(null); //移除之前的所有配置
    //加载系统默认配置
    C(require(THINK_PATH + '/Conf/config.js'));
    //加载用户配置
    var file = CONF_PATH + '/config.js';
    if (isFile(file)) {
      C(this.safeRequire(file));
    }
    //加载模式的配置文件
    if (APP_MODE) {
      var modeFiles = [
        THINK_PATH + '/Conf/mode.js',
        CONF_PATH + '/mode.js'
      ];
      var self = this;
      modeFiles.forEach(function(file){
        if (isFile(file)) {
          var conf = self.safeRequire(file);
          if (conf[APP_MODE]) {
            C(conf[APP_MODE]);
          }
        }
      });
    }
    //自定义路由
    if (C('url_route_on') && isFile(CONF_PATH + '/route.js')) {
      C('url_route_rules', this.safeRequire(CONF_PATH + '/route.js'));
    }
    //别名文件
    if (isFile(CONF_PATH + '/alias.js')) {
      aliasImport(this.safeRequire(CONF_PATH + '/alias.js'));
    }
    //common文件
    if (isFile(COMMON_PATH + '/common.js')) {
      require(COMMON_PATH + '/common.js');
    }
    this.loadTag();
    this.loadExtConfig();
    this.loadExtFiles();
  },
  //加载标签行为
  loadTag: function(){
    'use strict';
    //系统标签
    var tag = require(THINK_PATH + '/Conf/tag.js');
    //用户行为标签
    var tagFile = CONF_PATH + '/tag.js';
    if (!C('app_tag_on') || !isFile(tagFile)) {
      C('tag', tag);
      return;
    }
    var mixTag = extend({}, tag);
    var userTag = extend({}, require(tagFile));
    for(var key in userTag){
      var value = userTag[key];
      if (!value.length) {
        continue;
      }
      mixTag[key] = mixTag[key] || [];
      if (isBoolean(value[0])) {
        var flag = value.shift();
        if (flag) { //true为替换系统标签
          mixTag[key] = value;
        }else{ //false为将自定义标签置为系统标签前面
          mixTag[key] = value.concat(mixTag[key]);
        }
      }else{// 默认将用户标签置为系统标签后面
        mixTag[key] = mixTag[key].concat(value);
      }
    }
    //行为标签
    C('tag', mixTag);
  },
  //加载自定义外部文件
  loadExtFiles: function(){
    'use strict';
    var files = C('load_ext_file');
    if (files) {
      if (isString(files)) {
        files = files.split(',');
      }
      files.forEach(function(file){
        file = COMMON_PATH + '/' + file + '.js';
        if (isFile(file)) {
          require(file);
        }
      });
    }
  },
  //加载额外的配置
  loadExtConfig: function(){
    'use strict';
    var files = C('load_ext_config');
    if (files) {
      if (isString(files)) {
        files = files.split(',');
      }
      files.forEach(function(file){
        file = CONF_PATH + '/' + file + '.js';
        if (isFile(file)) {
          C(require(file));
        }
      });
    }
  },
  //加载debug模式配置文件
  loadDebugFiles: function(){
    'use strict';
    //加载debug模式下的配置
    C(require(THINK_PATH + '/Conf/debug.js'));
    //debug下自定义状态的配置
    var status = C('app_status');
    if (status) {
      if (isFile(CONF_PATH + '/' + status + '.js')) {
        C(require(CONF_PATH + '/' + status + '.js'));
      }
    }else{
      if (isFile(CONF_PATH + '/debug.js')) {
        C(require(CONF_PATH + '/debug.js'));
      }
    }
    if (APP_MODE) {
      var modeFiles = [
        THINK_PATH + '/Conf/mode.js',
        CONF_PATH + '/mode.js'
      ];
      modeFiles.forEach(function(file){
        if (isFile(file)) {
          var conf = require(file);
          var key = APP_MODE + '_debug';
          if (conf[key]) {
            C(conf[key]);
          }
        }
      });
    }
  },
  /**
   * debug模式下一些特殊处理
   * @return {[type]} [description]
   */
  debug: function(){
    'use strict';
    this.loadDebugFiles();
    //清除require的缓存
    if (C('clear_require_cache')) {
      //这些文件不清除缓存
      var retainFiles = C('debug_retain_files');
      var self = this;
      setInterval(function(){
        var fn = function(item){
          //windows目录定界符为\
          if (process.platform === 'win32') {
            item = item.replace(/\//g, '\\');
          }
          if (file.indexOf(item) > -1) {
            return true;
          }
        };
        for(var file in require.cache){
          var flag = retainFiles.some(fn);
          if (!flag) {
            delete require.cache[file];
          }
        }
        self.loadFiles();
        self.loadDebugFiles();
      }, 100);
    }
  },
  /**
   * 记录当前进程的id
   * 记录在Runtime/Data/app.pid文件里
   * @return {[type]} [description]
   */
  logPid: function(){
    'use strict';
    if (C('log_process_pid') && cluster.isMaster) {
      mkdir(DATA_PATH);
      var pidFile = DATA_PATH + '/app.pid';
      fs.writeFileSync(pidFile, process.pid);
      chmod(pidFile);
      //进程退出时删除该文件
      process.on('SIGTERM', function () {
        if (fs.existsSync(pidFile)) {
          fs.unlinkSync(pidFile);
        }
        process.exit(0);
      });
    }
  },
  /**
   * 合并autoload的path
   * @return {[type]} [description]
   */
  mergeAutoloadPath: function(){
    'use strict';
    var file = '__CLASS__.js';
    var sysAutoloadPath = {
      'Behavior': [
        LIB_PATH + '/Behavior/' + file,
        THINK_LIB_PATH + '/Behavior/' + file
      ],
      'Model': [
        LIB_PATH + '/Model/' + file,
        THINK_EXTEND_PATH + '/Model/' + file
      ],
      'Logic': [
        LIB_PATH + '/Logic/' + file
      ],
      'Service': [
        LIB_PATH + '/Service/' + file
      ],
      'Controller': [
        LIB_PATH + '/Controller/' + file,
        THINK_EXTEND_PATH + '/Controller/' + file
      ],
      'Cache': [
        LIB_PATH + '/Driver/Cache/' + file,
        THINK_LIB_PATH + '/Driver/Cache/' + file
      ],
      'Db': [
        LIB_PATH + '/Driver/Db/' + file,
        THINK_LIB_PATH + '/Driver/Db/' + file
      ],
      'Template': [
        LIB_PATH + '/Driver/Template/' + file,
        THINK_LIB_PATH + '/Driver/Template/' + file
      ],
      'Socket': [
        LIB_PATH + '/Driver/Socket/' + file,
        THINK_LIB_PATH + '/Driver/Socket/' + file
      ],
      'Session': [
        LIB_PATH + '/Driver/Session/' + file,
        THINK_LIB_PATH + '/Driver/Session/' + file
      ]
    };
    var autoloadPath = C('autoload_path');
    for(var type in autoloadPath){
      var paths = autoloadPath[type];
      var override = false;
      if (!isArray(paths)) {
        paths = [paths];
      }else if (isBoolean(paths[0])) {
        override = paths.shift();
      }
      if (override) {
        sysAutoloadPath[type] = paths;  
      }else{
        paths.push.apply(paths, sysAutoloadPath[type]);
        sysAutoloadPath[type] = paths;
      }
    }
    autoloadPaths = sysAutoloadPath;
  },
  /**
   * 自动加载机制，给thinkRequire使用
   * @param  {[type]} cls [description]
   * @return {[type]}     [description]
   */
  autoload: function(cls){
    'use strict';
    var filepath = '';
    var fn = function(item){
      item = item.replace(/__CLASS__/g, cls);
      if (isFile(item)) {
        filepath = item;
        return true;
      }
    };
    for(var name in autoloadPaths){
      var length = name.length;
      if (cls.substr(0 - length) === name) {
        var list = autoloadPaths[name];
        list.some(fn);
        if (filepath) {
          if (!APP_DEBUG) {
            aliasImport(cls, filepath);
          }
          return filepath;
        }
      }
    }
  }
};
