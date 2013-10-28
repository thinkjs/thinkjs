/**
 * 默认配置
 * @type {Object}
 */
module.exports = {
    port: 8360, //监听的端口
    encoding: 'utf8', //编码
    action_name_black_list: ["super", "init", /^\_[^\_]+/], //不能通过URL访问的action名单
    app_tags_on: true, //是否支持标签功能
    url_route_on: true, //开启自定义路由功能
    use_php_vars: true, //使用PHP风格的变量，如：$_GET, $_POST, $_FILES
    post_data_asyn: false, //异步获取post数据
    url_html_suffix: ".html", //url后缀
    app_group_list: [], //分组列表
    app_group_deny: [], //禁用分组列表
    default_group: 'home', //默认分组
    default_module: 'index', //默认模块
    default_action: 'index',  //默认Action
    url_module_map: {}, //模块别名，隐藏真实模块名
    url_action_map: {}, //Action别名
    app_group_mode: 0,  //0为普通分组，1为独立分组
    call_method: "__call", //当找不到方法时调用什么方法
    url_params_bind: true, //方法参数绑定
    class_file_suffix: ".class.js", //类文件后缀
    action_suffix: "Action", //action后缀
};