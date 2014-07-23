/**
 * 不同模式下的配置文件
 * 由于每个模式下的配置可能都比较少，所以放在一个文件里
 * @type {Object}
 */
module.exports = {
  cli: {
    use_cluster: false, //关闭cluster功能
    html_cache_on: false,
    log_process_pid: false,
    clear_require_cache: false,
    auto_close_db: false,  //自动关闭数据库连接
    log_record: false,
  },
  cli_debug: {
    clear_require_cache: false
  }
};