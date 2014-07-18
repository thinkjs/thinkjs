/**
 * debug模式下的配置
 * @type {Object}
 */
module.exports = {
  db_fields_cache: false, //debug模式下关闭数据表字段的缓存
  db_cache_on: false, //关闭数据库查询缓存
  db_log_sql: true, //打印sql

  debug_retain_files: ['/node_modules/', '/thinkjs/'], //这些文件在debug模式下不清除缓存
  use_cluster: false, //不使用cluster
  html_cache_on: false, //关闭html静态化缓存
  clear_require_cache: true, //清除require的缓存文件
};