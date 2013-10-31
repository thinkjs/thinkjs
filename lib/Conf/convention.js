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
    call_method: "__call", //当找不到方法时调用什么方法，这个方法存在时才有效
    url_params_bind: true, //方法参数绑定,将URL参数值绑定到action的参数上
    class_file_suffix: ".class.js", //类文件后缀
    action_suffix: "Action", //action后缀
    cookie_expires: 0, //cookie默认保持时间数，默认随浏览器关闭失效
    deny_ip: [], //阻止的ip

    tpl_content_type: "text/html", //模版输出类型
    tpl_file_suffix: ".html", //模版文件名后缀
    tpl_file_depr: "_", //module和action之间的分隔符

    tpl_engine_type: "ejs", //模版引擎名称
    tpl_engine_config: { //模版引擎需要的配置
        open: "{%",
        end: "%}",
    },

    log_record: false, //是否记录日志

    data_cache_type: "File", //数据缓存类型,支持:File|Db|Memcache
    data_cache_time: 0, //数据缓存有效期，0表示永久缓存,单位: 秒
    data_cache_prefix: "", //缓存前缀
    data_cache_check: false, //数据缓存是否校验缓存
    data_cache_path: TEMP_PATH,  //缓存路径设置 (仅对File方式缓存有效)\
    data_path_level: 1, // 子目录缓存级别，默认不使用子目录
    data_file_suffix: ".json", //缓存文件后缀
};