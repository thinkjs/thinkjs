var db = module.exports = Class(function(){
    return {
        comparison: {
            'eq': '=',
            'neq': '<>',
            'gt': '>',
            'egt': '>=',
            'lt': '<',
            'elt': '<=',
            'notlike': 'NOT LIKE',
            'like': 'LIKE',
            'in': 'IN',
            'notin': 'NOT IN'
        },
        selectSql: 'SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT% %UNION%%COMMENT%',
        initProp: function(){
            // 数据库类型
            this.dbType = null;
            // 是否自动释放查询结果
            this.autoFree = false;
            // 当前操作所属的模型名
            this.model = "_think_";
            // 是否使用永久连接
            this.pconnect = false;
            // 当前SQL指令
            this.queryStr = "";
            this.modelSql = [];
            // 最后插入ID
            this.lastInsID = null;
            // 返回或者影响记录数
            this.numRows = 0;
            // 返回字段数
            this.numCols = 0;
            // 事务指令数
            this.transTimes = 0;
            // 错误信息
            this.error = "";
            // 数据库连接ID 支持多个连接
            this.linkID = [];
            // 当前连接ID
            this._linkID = null;
            // 当前查询ID
            this.queryId = null;
            // 是否已经连接数据库
            this.connected = false;
            // 数据库连接参数配置
            this.config = '';
            // 数据库表达式
        },
        init: function(){
            this.initProp();
        },
        /**
         * 加载数据库 支持配置文件或者 DSN
         * @access public
         * @param mixed $db_config 数据库配置信息
         * @return string
         */
        factory: function(config){

        },
        parseConfig: function(config){
            if (config && is_string(config)) {
                return this.parseDSN(config);
            }else if(is_array(config)){
                return {
                    "dbms": config.db_type,
                    "username": config.db_user,
                    "password": config.db_pwd,
                    "hostname": config.db_host,
                    "hostport": config.db_port,
                    "database": config.db_name,
                    "dsn": config.db_dsn,
                    "params": config.db_params
                }
            }else if(!config){
                if (C('db_dsn')) {
                    return this.parseDSN(C('db_dsn'));
                };
                return {
                    'dbms'      :  C('db_type'),
                    'username'  :  C('db_user'),
                    'password'  :  C('db_pwd'),
                    'hostname'  :  C('db_host'),
                    'hostport'  :  C('db_port'),
                    'database'  :  C('db_name'),
                    'dsn'       :  C('db_dsn'),
                    'params'    :  C('db_params'),
                }
            }
            return config;
        },
        parseDSN: function(config){

        }
    }
});
db.getInstance = function(config){
    
}