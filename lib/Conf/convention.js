/**
 * 默认配置
 * @type {Object}
 */
module.exports = {
    port: 8360, //监听的端口
    encoding: 'utf8', //编码
    action_name_black_list: ["init", /^\_/], //不能通过URL访问的action名单
    app_tags_on: true, //是否支持标签功能
    url_route_on: true, //开启自定义路由功能
    get_pathinfo_fn: "", //获取pathinfo自定义方法
    use_php_vars: true, //使用PHP风格的变量，如：$_GET, $_POST, $_FILES
    post_data_asyn: false, //异步获取post数据
};