/**
 * 系统标签配置
 * 可以在App/Conf/tag.js里进行修改
 * @type {Object}
 */
var fs = require('fs');

/**
 * 命令行模式下执行后自动关闭数据库连接
 * @return {[type]} [description]
 */
var closeDbConnect = function(){
  'use strict';
  if(C('auto_close_db')){
    thinkRequire('Model').close();
  }
}
/**
 * 解析提交的json数据
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
var jsonParse = function(http){
  'use strict';
  var jsonContentType = C('post_json_content_type');
  if (!isArray(jsonContentType)) {
    jsonContentType = [jsonContentType];
  }
  if (http.payload && jsonContentType.indexOf(http.contentType) > -1) {
    try{
      http.post = JSON.parse(http.payload);
    }catch(e){}
  }
}
/**
 * 静态资源文件内容输出
 * @param  {[type]} http [description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
var resourceOutput = function(http, file){
  'use strict';
  var fileStream = fs.createReadStream(file);
  fileStream.pipe(http.res);
  fileStream.on('end', function(){
    http.res.end();
  });
}

module.exports = {
  //应用初始化
  app_init: [],
  //表单数据解析
  form_parse: [jsonParse],
  //pathinfo解析
  path_info: [],
  //静态资源请求检测
  resource_check: ['CheckResource'],
  //静态资源输出
  resource_output: [resourceOutput],
  //路由检测
  route_check: ['CheckRoute'],
  //应用开始
  app_begin: ['ReadHtmlCache'],
  //action执行初始化
  action_init: [],
  //模版解析初始化
  view_init: [],
  //定位模版文件
  view_template: ['LocateTemplate'],
  //模版解析
  view_parse: ['ParseTemplate'],
  //模版内容过滤
  view_filter: [],
  //模版解析结束
  view_end: ['WriteHtmlCache'],
  //action结束
  action_end: [],
  //应用结束
  app_end: [closeDbConnect],
  //内容输出
  content_write: [],
  //错误处理
  app_error: []
};