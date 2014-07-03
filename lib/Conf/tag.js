/**
 * 系统标签配置
 * 可以在App/Conf/tag.js里进行修改
 * @type {Object}
 */

/**
 * 命令行模式下执行后自动关闭数据库连接
 * @return {[type]} [description]
 */
var closeDbConnect = function(){
  'use strict';
  if(APP_MODE === 'cli'){
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
  var jsonConentType = C('post_json_content_type');
  if (!isArray(jsonConentType)) {
    jsonConentType = [jsonConentType];
  }
  if (jsonConentType.indexOf(http.contentType) > -1) {
    http.post = JSON.parse(http.payload) || {};
  }
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
  //路由检测
  route_check: ['CheckRoute'],
  //应用开始
  app_begin: ['ReadHtmlCache'],
  //action执行初始化
  action_init: [],
  //模版解析初始化
  view_init: [],
  //定位模版文件
  view_template: ['LocationTemplate'],
  //模版解析
  view_parse: ['ParseTemplate'],
  //模版内容过滤
  view_filter: [],
  //模版解析结束
  view_end: ['WriteHtmlCache'],
  //action结束
  action_end: [],
  //应用结束
  app_end: [closeDbConnect]
};