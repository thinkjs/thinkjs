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
            this.db1(0, connection || this.connection);
        },
        getModelName: function(){
            var filename = this.__filename || __filename;
            if (!this.name) {
                var name = filename.split("/").pop().replace(C('class_file_suffix'), "");
                this.name = name.substr(0, name.length - 5);
            };
            return this.name;
        },
        db1: function(){
            
        }
    }
});