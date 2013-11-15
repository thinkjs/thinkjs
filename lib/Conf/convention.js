/**
 * 默认配置
 * @type {Object}
 */
module.exports = {
    port: 8360, //启动服务时用的端口
    encoding: 'utf8', //编码
    pathname_prefix: "",  //不解析的pathname前缀
    action_name_black_list: ["super", "init", /^\_[^\_]+/], //不能通过URL访问的action名单
    app_tags_on: true, //是否支持标签功能
    url_route_on: true, //开启自定义路由功能
    url_html_suffix: ".html", //url后缀，这样可以做到伪静态，对搜索引擎更友好
    app_group_list: [], //分组列表
    app_group_deny: [], //禁用分组列表
    default_group: 'Home', //默认分组
    default_controller: 'Index', //默认模块
    default_action: 'index',  //默认Action
    url_controller_map: {}, //Controller别名，隐藏真实模块名
    url_action_map: {}, //Action别名
    call_method: "__call", //当找不到方法时调用什么方法，这个方法存在时才有效
    url_params_bind: true, //方法参数绑定,将URL参数值绑定到action的参数上
    class_file_suffix: ".class.js", //类文件后缀
    action_suffix: "Action", //action后缀
    deny_ip: [], //阻止的ip
    deny_remote_access_by_ip: true, //禁止通过外网的IP直接访问
    url_callback_name: "callback", //jsonp格式的callback名字
    json_content_type: "application/json",

    cookie_domain: "", //cookie有效域名
    cookie_path: "",   //cookie路径
    cookie_expires: 0, //cookie默认保持时间数，默认随浏览器关闭失效
    cookie_prefix: "",  //cookie前缀,避免冲突

    session_auto_start: true, //自动启动session
    session_id: "thinkjs", //session id
    session_type: "File", //session存储类型
    session_options: {}, //session的一些选项
    session_cookie_sign: "", //session对应的cookie使用签名,如果使用这里填密钥


    db_type: "mysql", // 数据库类型
    db_host: "localhost",// 服务器地址
    db_name: "",// 数据库名
    db_user: "root",// 用户名
    db_pwd: "",// 密码
    db_port: "",// 端口
    db_prefix: "think_",// 数据库表前缀
    db_fieldtype_check: false,// 是否进行字段类型检查
    db_fields_cache: true, // 启用字段缓存
    db_charset: "utf8", // 数据库编码默认采用utf8
    db_deploy_type: 0, // 数据库部署方式:0 集中式(单一服务器),1 分布式(主从服务器)
    db_rw_separate: false,  // 数据库读写是否分离 主从式有效
    db_master_num: 1, // 读写分离后 主服务器数量
    db_slave_no: "",  // 指定从服务器序号
    db_sql_build_cache: false, // 数据库查询的SQL创建缓存
    db_sql_build_queue: 'file',  // SQL缓存队列的缓存方式 支持 file
    db_sql_build_length: 20, // SQL缓存的队列长度
    db_sql_log: false, // SQL执行日志记录
    db_field_version: "", //

    tpl_content_type: "text/html", //模版输出类型
    tpl_file_suffix: ".html", //模版文件名后缀
    tpl_file_depr: "_", //controller和action之间的分隔符
    tpl_engine_type: "ejs", //模版引擎名称
    tpl_engine_config: {}, //模版引擎需要的配置

    log_record: false, //是否记录日志

    data_cache_type: "File", //数据缓存类型,支持:File|Db|Memcache
    data_cache_time: 0, //数据缓存有效期，0表示永久缓存,单位: 秒
    data_cache_prefix: "", //缓存前缀
    data_cache_check: false, //数据缓存是否校验缓存
    data_cache_path: TEMP_PATH,  //缓存路径设置 (仅对File方式缓存有效)\
    data_path_level: 1, // 子目录缓存级别，默认不使用子目录
    data_file_suffix: ".json", //缓存文件后缀

    memcache_host: "127.0.0.1", //memcache host
    memcache_port: 11211, //memecache端口
};