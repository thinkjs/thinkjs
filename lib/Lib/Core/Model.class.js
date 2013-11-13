/**
 * Model类
 * @type {[type]}
 */



var MODEL_INSERT = 1; //  插入模型数据
var MODEL_UPDATE = 2; //  更新模型数据
var MODEL_BOTH = 3; //  包含上面两种方式
var MUST_VALIDATE = 1; // 必须验证
var EXISTS_VALIDATE = 0; // 表单存在字段则验证
var VALUE_VALIDATE = 2; // 表单值不为空则验证


var vm = require("vm");

var model = module.exports = Class(function(){
    var _linkNum = [];
    var _db = {};
    return {
        initProps: function(){
            // 当前使用的扩展模型
            this._extModel = null;
            // 当前数据库操作对象
            this.db = null;
            // 主键名称
            this.pk = "id";
            // 数据表前缀
            this.tablePrefix = "";
            // 模型名称
            this.name = "";
            // 数据库名称
            this.dbName = "";
            //数据库配置
            this.connection = "";
            // 数据表名（不包含表前缀）
            this.tableName = "";
            // 实际数据表名（包含表前缀）
            this.trueTableName = "";
            // 最近错误信息
            this.error = "";
            //字段信息
            this.fields = [];
            //数据信息
            this.data = [];
            // 查询表达式参数
            this.options = [];
            // 自动验证定义
            this._validate = [];
            // 自动完成定义
            this._auto = [];
            // 字段映射定义
            this._map = [];
            // 命名范围定义
            this._scope = [];
            // 是否自动检测数据表字段信息
            this.autoCheckFields = true;
            // 是否批处理验证
            this.patchValidate = false;
            // 链操作方法列表
            this.methods = ['table','order','alias','having','group','lock','distinct','auto','filter','validate'];
            //deferred
            this.deferred = when.defer();
        },
        resetDeferred: function(){
            this.deferred.reject();
            this.deferred = when.defer();
        },
        /**
         * 架构函数
         * 取得DB类的实例对象 字段检查
         * @access public
         * @param string $name 模型名称
         * @param string $tablePrefix 表前缀
         * @param mixed $connection 数据库连接信息
         */
        init: function(name, tablePrefix, connection){
            this.initProps();
            // 获取模型名称
            if (name) {
                if (name.indexOf('.') > -1) {
                    name = name.split(".");
                    this.dbName = name[0];
                    this.name = name[1];
                }else{
                    this.name = name;
                }
            }else if(!this.name){
                this.getModelName();
            }
            // 设置表前缀
            if (tablePrefix === undefined) {
                this.tablePrefix = this.tablePrefix ? this.tablePrefix : C('db_prefix');
            }else{
                this.tablePrefix = tablePrefix;
            }
            // 数据库初始化操作
            // 获取数据库操作对象
            // 当前模型有独立的数据库连接信息
            this.initDb(0, connection || this.connection);
        },
        /**
         * 得到当前的数据对象名称
         * @access public
         * @return string
         */
        getModelName: function(){
            var filename = this.__filename || __filename;
            if (!this.name) {
                var name = filename.split("/").pop().replace(C('class_file_suffix'), "");
                this.name = name.substr(0, name.length - 5);
            };
            return this.name;
        },
        /**
         * 初始化数据库连接
         * @access public
         * @param integer $linkNum  连接序号
         * @param mixed $config  数据库连接信息
         * @param array $params  模型参数
         * @return Model
         */
        initDb: function(linkNum, config, params){
            if (!linkNum && this.db) {
                return this.db;
            };
            if (!_db[linkNum] || config && _linkNum[linkNum] != config) {
                if (config && is_string(config) && config.indexOf("/") == -1) {
                    config = C(config);
                };
                _db[linkNum] = think_require("Db").getInstance(config);
            }else if(config === null){
                _db[linkNum].close();
                delete _db[linkNum];
                return;
            }
            if (params) {
                extend(this, params);
            };
            // 记录连接信息
            _linkNum[linkNum] = config;
            this.db = _db[linkNum];
            if (this.name && this.autoCheckFields) {
                this._checkTableInfo();
            };
            return this;
        },
        /**
         * 自动检测数据表信息
         * @access protected
         * @return void
         */
        _checkTableInfo: function(){
            // 如果不是Model类 自动记录数据表信息
            // 只在第一次执行记录
            if (!this.fields) {
                // 如果数据表字段没有定义则自动获取
                if (C('db_fields_cache')) {
                    var db = this.dbName || C('db_name');
                    var fields = F('_fields/' + db + "." + this.name);
                    if (fields) {
                        var version = C('db_field_version');
                        if (!version || fields._version == version) {
                            this.fields = fields;
                            this.deferred.resolve();
                            this.resetDeferred();
                            return this;
                        };
                    };
                };
            };
            // 每次都会读取数据表信息
            this.flush();
        },
        flush: function(){
            // 缓存不存在则查询数据表信息
            
        },
        add: function(data, options, replace){
            data = data || "";
            options = options || [];
            replace = replace || false;
        },
        getLastSql: function(){
            return this.db.getLastSql();
        }
    }
});