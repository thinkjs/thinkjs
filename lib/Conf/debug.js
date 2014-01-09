/**
 * debug模式下的配置
 * @type {Object}
 */
module.exports = {
    db_fields_cache: false, //debug模式下关闭数据表字段的缓存
    debug_retain_files: ['/node_modules/', '/Model.class.js'], //这些文件在debug模式下不清除缓存
    use_cluster: false,
    html_cache_on: false,
    clear_require_cache: true, //清除require的缓存文件
}