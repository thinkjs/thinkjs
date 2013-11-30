var util = require('util');
var querystring = require('querystring');
/**
 * Model类
 * @type {[type]}
 */
var model = module.exports = Class(function(){
    var _linkNum = [];
    var _db = [];
    return {
        initAttr: function(){
            // 当前使用的扩展模型
            //this._extModel = null;
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
            // 数据库配置
            this.connection = "";
            // 数据表名（不包含表前缀）
            this.tableName = "";
            // 实际数据表名（包含表前缀）
            this.trueTableName = "";
            // 最近错误信息
            this.error = "";
            // 字段信息
            this.fields = {};
            // 数据信息
            this._data = {};
            // 查询表达式参数
            this.options = {};
            // 自动验证定义
            //this._validate = [];
            // 自动完成定义
            //this._auto = [];
            // 字段映射定义
            //this._map = [];
            // 命名范围定义
            //this._scope = [];
            // 是否自动检测数据表字段信息
            this.autoCheckFields = true;
            // 是否批处理验证
            //this.patchValidate = false;
            //初始化的promise
            this.promise = null;
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
            this.initAttr();
            // 获取模型名称
            if (name) {
                if (name.indexOf(".") > -1) {
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
            this.tablePrefix = tablePrefix === undefined ? (this.tablePrefix || C("db_prefix")) : tablePrefix;
            // 数据库初始化操作
            // 获取数据库操作对象
            // 当前模型有独立的数据库连接信息
            this.promise = this.initDb(0, connection || this.connection);
            this.initMethod && this.initMethod();
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
            linkNum = linkNum || 0;
            if (!linkNum && this.db) {
                return get_promise(this.db);
            };
            if (!_db[linkNum] || config && _linkNum[linkNum] != config) {
                if (config && is_string(config) && config.indexOf("/") == -1) {
                    config = C(config);
                };
                _db[linkNum] = think_require("Db").getInstance(config);
            }else if(config === null){
                _db[linkNum].close();
                delete _db[linkNum];
                return get_promise(this);
            }
            if (params) {
                extend(this, params);
            };
            // 记录连接信息
            _linkNum[linkNum] = config;
            this.db = _db[linkNum];
            if (this.name && this.autoCheckFields) {
                return this.checkTableInfo();
            };
            return get_promise(this);
        },
        /**
         * 获取模型名
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
         * 获取表名
         * @return {[type]} [description]
         */
        getTableName: function(){
            if (!this.trueTableName) {
                var tableName = this.tablePrefix || "";
                tableName += this.tableName || parse_name(this.name);
                this.trueTableName = tableName.toLowerCase();
            };
            var tableName = (this.dbName ? this.dbName + "." : "") + this.trueTableName;
            return tableName;
        },
        /**
         * 获取缓存数据表字段信息的缓存文件
         * @return {[type]} [description]
         */
        getFieldsCacheFile: function(){
            var db = this.dbName || C('db_name');
            return '_fields/' + db + "." + this.name.toLowerCase();
        },
        /**
         * 自动检测数据表信息
         * @access protected
         * @return void
         */
        checkTableInfo: function(){
            // 如果不是Model类 自动记录数据表信息
            // 只在第一次执行记录
            if (is_empty(this.fields)) {
                // 如果数据表字段没有定义则自动获取
                if (C('db_fields_cache')) {
                    var fields = F(this.getFieldsCacheFile());
                    if (fields) {
                        this.fields = fields;
                        return get_promise(fields);
                    };
                };
                // 每次都会读取数据表信息
                return this.flushFields();  
            };
            return get_promise(this.fields);
        },
        /**
         * 刷新数据表字段信息
         * @return promise [description]
         */
        flushFields: function(){
            this.db.setModel(this.name);
            var self = this;
            return this.getTableFields(this.getTableName(), true).then(function(fields){
                self.fields = fields;
                if (C('db_fields_cache')) {
                    F(self.getFieldsCacheFile(), self.fields);
                };
                return self.fields;
            })
        },
        /**
         * 获取数据表的字段
         * @param  {[type]} table
         * @param  {[type]} all
         * @return {[type]}
         */
        getTableFields: function(table, all){
            if (table === true) {
                table = undefined;
                all = true;
            };
            if (table) {
                return this.db.getFields(table).then(function(data){
                    var fields = {
                        "_field": Object.keys(data),
                        "_autoinc": false
                    };
                    var types = {};
                    for(var key in data){
                        var val = data[key];
                        types[key] = val.type;
                        if (val.primary) {
                            fields['_pk'] = key;
                            if (val.autoinc) {
                                fields['_autoinc'] = true;
                            };
                        };
                    }
                    fields['_type'] = types;
                    return all ? fields : fields["_field"];
                })
            };
            if (!is_empty(this.fields)) {
                return get_promise(all ? this.fields : this.fields["_field"]);
            };
            return this.getTableFields(this.getTableName(), all);
        },
        /**
         * 获取上一次操作的sql
         * @return {[type]} [description]
         */
        getLastSql: function(){
            return this.db.getLastSql();
        },
        /**
         * 获取主键名称
         * @access public
         * @return string
         */
        getPk: function(){
            return this.fields['_pk'] || this.pk;
        },
        /**
         * 缓存
         * @param  {[type]} key    [description]
         * @param  {[type]} expire [description]
         * @param  {[type]} type   [description]
         * @return {[type]}        [description]
         */
        cache: function(key, expire, type){
            //如果没有key，则根据sql语句自动生成
            if (is_number(key)) {
                type = expire;
                expire = key;
                key = "";
            };
            this.options.cache = {
                key: key,
                expire: expire,
                type: type
            };
            return this;
        },
        /**
         * 指定查询数量
         * @param  {[type]} offset [description]
         * @param  {[type]} length [description]
         * @return {[type]}        [description]
         */
        limit: function(offset, length){
            this.options.limit = length === undefined ? offset : offset + "," + length;
            return this;
        },
        /**
         * 指定分页
         * @return {[type]} [description]
         */
        page: function(page, listRows){
            this.options.page = listRows === undefined ? page : page + "," + listRows;
            return this;
        },
        /**
         * where条件
         * @return {[type]} [description]
         */
        where: function(where){
            if (is_string(where) && where) {
                where = {
                    "_string": where
                }
            };
            this.options.where = extend(this.options.where || {}, where);
            return this;
        },
        /**
         * 要查询的字段
         * @return {[type]} [description]
         */
        field: function(field){
            if (!field) {
                field = "*";
            };
            this.options.field = field;
            return this;
        },
        /**
         * 联合查询
         * @return {[type]} [description]
         */
        union: function(union){
            if (!this.options.union) {
                this.options.union = [];
            };
            this.options.union.push(union);
            return this;
        },
        /**
         * 联合查询
         * @param  {[type]} join [description]
         * @return {[type]}      [description]
         */
        join: function(join){
            if (is_array(join)) {
                this.options.join = join;
            }else{
                if (!this.options.join) {
                    this.options.join = [];
                };
                this.options.join.push(join);
            }
            return this;
        },
        /**
         * 获取错误信息
         * @return {[type]} [description]
         */
        getError: function(){
            return this.error;
        },
        /**
         * 获取数据库错误信息
         * @return {[type]} [description]
         */
        getDbError: function(){
            return this.db.getError();
        },
        /**
         * 生成查询SQL 可用于子查询
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        buildSql: function(options){
            var self = this;
            return this.parseOptions(options).then(function(options){
                return "( " + self.db.buildSelectSql(options) + " )";
            })
        },
        // rollback: function(){
        //     return this.db.rollback();
        // },
        // commit: function(){
        //     return this.db.commit();
        // },
        // startTrans: function(){
        //     this.commit();
        //     this.db.startTrans();
        //     return this;
        // },
        /**
         * 解析参数
         * @param  {[type]} options [description]
         * @return promise         [description]
         */
        parseOptions: function(options){
            options = extend(this.options, options);
            // 查询过后清空sql表达式组装 避免影响下次查询
            this.options = {};
            var promise = null;
            //获取数据表下的字段信息
            if (options.table) {
                promise = this.getTableFields(options.table);
            }else{
                options.table = this.getTableName();
                promise = get_promise(this.fields["_field"]);
            }
            //数据表别名
            if (options.alias) {
                options.table += " " + options.alias;
            };
            options.modal = this.name;
            var self = this;
            return promise.then(function(fields){
                // 字段类型验证
                if (options.where && is_object(options.where) && !is_empty(fields)) {
                    // 对数组查询条件进行字段类型检查
                    for(var key in options.where){
                        var val = options.where[key];
                        key = key.trim();
                        if (fields.indexOf(key) > -1) {
                            if (is_scalar(val)) {
                                options.where = self.parseType(options.where, key);
                            };
                        }else if(key.substr(0, 1) !== "_" && !(/[\.\|\&]/.test(key))){
                            delete options.where[key];
                        }
                    }
                };
                options = self._optionsFilter(options);
                return options;
            });
        },
        /**
         * 选项过滤器
         * 具体的Model类里进行实现
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _optionsFilter: function(options){
            return options;
        },
        /**
         * 数据类型检测
         * @param  {[type]} data [description]
         * @param  {[type]} key  [description]
         * @return {[type]}      [description]
         */
        parseType: function(data, key){
            var fieldType = this.fields["_type"][key] || "";
            if (fieldType.indexOf("bigint") === -1 && fieldType.indexOf("int") > -1) {
                data[key] = parseInt(data[key], 10) || 0;
            }else if(fieldType.indexOf("double") > -1 || fieldType.indexOf("float") > -1){
                data[key] = parseFloat(data[key]) || 0.0;
            }else if(fieldType.indexOf('bool') > -1){
                data[key] = !! data[key];
            }
            return data;
        },
        /**
         * 对插入到数据库中的数据进行处理
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        parseData: function(data){
            data = data || {};
            if (!is_empty(this.fields)) {
                for(var key in data){
                    var val = data[key];
                    if (!this.fields["_field"].indexOf(key) > -1) {
                        delete data[key];
                    }else if(is_scalar(val)){
                        data = this.parseType(data, key);
                    }
                }
            };
            //安全过滤
            if (typeof this.options.filter == 'function') {
                for(var key in data){
                    data[key] = this.options.filter.call(this, key, data[key]);
                }
                delete this.options.filter;
            };
            data = this._dataFilter(data);
            return data;
        },
        /**
         * 数据过滤器
         * 具体的Model类里进行实现
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        _dataFilter: function(data){
            return data;
        },
        /**
         * 数据插入之前操作
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _beforeInsert: function(data, options){
            return data;
        },
        /**
         * 数据插入之后操作
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterInsert: function(data, options){
            return data;
        },
        /**
         * 添加一条或者多条数据
         * @param {[type]} data    [description]
         * @param {[type]} options [description]
         * @param {[type]} replace [description]
         */
        add: function(data, options, replace){
            if (!data) {
                if (this._data) {
                    data = this._data;
                    this._data = {};
                }else{
                    throw_error(L("_DATA_TYPE_INVALID_"));
                    return get_promise(false);
                }
            };
            data = this.parseData(data);
            var self = this;
            return this.parseOptions(options).then(function(options){
                data = self._beforeInsert(data, options);
                //如果_beforeInsert返回false，则直接返回
                if (data === false) {
                    return false;
                };
                return self.db.insert(data, options, replace).then(function(){
                    //获取插入的ID
                    return self.db.getLastInsID().then(function(id){
                        if (id) {
                            data[self.getPk()] = id;   
                        }
                        self._afterInsert(data, options);
                        return id;
                    })
                });
            });
        },
        /**
         * 插入多条数据
         * @param {[type]} data    [description]
         * @param {[type]} options [description]
         * @param {[type]} replace [description]
         */
        addAll: function(data, options, replace){
            if (!is_array(data) || !is_object(data[0])) {
                this.error = L("_DATA_TYPE_INVALID_");
                return get_promise(false);
            };
            var self = this;
            return this.parseOptions(options).then(function(options){
                return self.db.insertAll(data, options, replace).then(function(){
                    return self.db.getLastInsID();
                })
            })
        },
        /**
         * 删除数据
         * @return {[type]} [description]
         */
        delete: function(options){
            if (is_empty(options) && is_empty(this.options.where)) {
                // 如果删除条件为空 则删除当前数据对象所对应的记录
                if (!is_empty(this._data) && this._data[this.getPk()]) {
                    return this.delete(this._data[this.getPk()]);
                }else{
                    return get_promise(false);
                }
            };
            var pkValue = "";
            if (is_number(options) || is_string(options)) {
                var pk = this.getPk();
                options += "";
                var where = {};
                if (options.indexOf(',') > -1) {
                    where[pk] = ["IN", options];
                }else{
                    where[pk] = options;
                }
                pkValue = where[pk];
                options = {
                    "where": where
                }
            };
            var self = this;
            return this.parseOptions(options).then(function(options){
                return self.db.delete(options);
            })
        },
        _beforeUpdate: function(data, options){
            return data;
        },
        _afterUpdate: function(data, options){
            return data;
        },
        /**
         * 更新数据
         * @return {[type]} [description]
         */
        update: function(data, options){
            if (is_empty(data)) {
                if (this._data) {
                    data = this._data;
                    this._data = {};
                }else{
                    throw_error(L("_DATA_TYPE_INVALID_"));
                    return get_promise(false);
                }
            };
            data = this.parseData(data);
            var self = this;
            return this.parseOptions(options).then(function(options){
                if (self._beforeUpdate(data, options) === false) {
                    return false;
                };
                var pkValue = "";
                var pk = self.getPk();
                if (is_empty(self.options.where)) {
                    // 如果存在主键数据 则自动作为更新条件
                    if (!is_empty(data[pk])) {
                        var where = {};
                        where[pk] = data[pk];
                        options.where = where;
                        pkValue = data[pk];
                        delete data[pk];
                    }else{
                        self.error = L("_OPERATION_WRONG_");
                        return false;
                    }
                };
                return self.db.update(data, options).then(function(data){
                    if (data) {
                        if (pkValue) {
                            data[pk] = pkValue;
                        };
                        self._afterUpdate(data, options);
                        return data.affectedRows;
                    };
                    return false;
                })
            })
        },
        /**
         * 更新某个字段的值
         * @param  {[type]} field [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        updateField: function(field, value){
            var data = {};
            if (is_object(field)) {
                data = field;
            }else{
                data[field] = value;
            }
            return this.update(data);
        },
        /**
         * 字段值增长
         * @return {[type]} [description]
         */
        updateInc: function(field, step){
            step = parseInt(step, 10) || 1;
            return this.updateField(field, ["exp", field + "+" + step]);
        },
        /**
         * 字段值减少
         * @return {[type]} [description]
         */
        updateDec: function(field, step){
            step = parseInt(step, 10) || 1;
            return this.updateField(field, ["exp", field + "-" + step]);
        },
        /**
         * 查询语句的options
         * @return {[type]} [description]
         */
        queryOptions: function(options){
            if (is_number(options) || is_string(options)) {
                var pk = this.getPk();
                options += "";
                var where = {};
                if (options.indexOf(",") > -1) {
                    where[pk] = ["IN", options];
                }else{
                    where[pk] = options;
                }
                options = {
                    "where": where
                };
            }else if (!is_empty(options)) {
                options = {
                    "where": options
                };
            };
            return options || {};
        },
        /**
         * 查询一条数据
         * @return 返回一个promise
         */
        find: function(options){
            var self = this;
            options = this.queryOptions(options);
            options.limit = 1;
            return this.parseOptions(options).then(function(options){
                return self.db.select(options).then(function(data){
                    return data ? data[0] : [];
                })
            });
        },
        /**
         * 查询数据
         * @return 返回一个promise
         */
        select: function(options){
            var self = this;
            options = this.queryOptions(options);
            return this.parseOptions(options).then(function(options){
                return self.db.select(options);
            });
        },
        selectAdd: function(fields, table, options){
            var self = this;
            return this.parseOptions(options).then(function(options){
                fields = fields || options.field;
                table = table || self.getTableName();
                return self.db.selectInsert(fields, table, options);
            });
        },
        /**
         * 获取一条记录的某个字段值
         * @return {[type]} [description]
         */
        getField: function(field, sepa){
            field = field.trim();
            var self = this;
            return this.parseOptions({
                "field": field
            }).then(function(options){
                var multi = false;
                if (field.indexOf(",") > -1) {
                    if (options.limit === undefined && is_number(sepa)) {
                        options.limit = sepa;
                    };
                    multi = true;
                }else{
                    options.limit = is_number(sepa) ? sepa : 1;   
                }
                return self.db.select(options).then(function(data){
                    if (data === false) {
                        return false;
                    };
                    if (multi) {
                        var length = field.split(",").length;
                        var field = Object.keys(data[0]);
                        var key = field.shift();
                        var key2 = field.shift();
                        var cols = {};
                        data.forEach(function(item){
                            var name = item[key];
                            if (length === 2) {
                                cols[name] = item[key2];
                            }else{
                                cols[name] = is_string(sepa) ? item.join(sepa) : item;
                            }
                        });
                        return cols;
                    }else{
                        if (sepa !== true && options.limit == 1) {
                            return data[0];
                        };
                        return Object.values(data[0])[0];
                    }
                });
            })
        },
        /**
         * SQL查询
         * @return {[type]} [description]
         */
        query: function(sql, parse){
            if (parse !== undefined && !is_boolean(parse) && !is_array(parse)) {
                parse = [].slice.call(arguments);
                parse.shift();
            };
            var self = this;
            return this.parseSql.then(function(sql){
                return self.db.query(sql);
            })
        },
        /**
         * 执行SQL语法，非查询类的SQL语句，返回值为影响的行数
         * @param  {[type]} sql   [description]
         * @param  {[type]} parse [description]
         * @return {[type]}       [description]
         */
        execute: function(sql, parse){
            if (parse !== undefined && !is_boolean(parse) && !is_array(parse)) {
                parse = [].slice.call(arguments);
                parse.shift();
            };
            var self = this;
            return this.parseSql.then(function(sql){
                return self.db.execute(sql);
            })
        },
        /**
         * 解析SQL语句
         * @return {[type]} [description]
         */
        parseSql: function(sql, parse){
            var promise = null;
            var self = this;
            if (parse === true) {
                promise = this.parseOptions().then(function(options){
                    return self.db.parseSql(options);
                })
            }else if (is_array(parse)) {
                sql = util.format.apply(null, sql, parse);
                promise = get_promise(sql);
            }else{
                var map = {
                    "__TABLE__": this.getTableName(),
                    "__PREFIX__": C('db_prefix')
                };
                sql = sql.replace(/__[A-Z]__/g, function(a){
                    return map[a] || a;
                })
                promise = get_promise(sql);
            }
            this.db.setModel(this.name);
            return promise;
        },
        /**
         * 设置数据对象值
         * @return {[type]} [description]
         */
        data: function(data){
            if (data === true) {
                return this._data;
            };
            if (is_string(data)) {
                data = querystring.parse(data);
            };
            this._data = data;
            return this;
        }
    }
}).extend(function(){
    //追加的方法
    var methods = {
        initMethod: function(){
            var self = this;
            this.promise.then(function(){
                var field = self.fields["_field"];
                field.forEach(function(item){
                    var name = "getBy" + parse_name(item, 1);
                    self[name] = function(arg){
                        var where = {}
                        where[item] = arg;
                        return this.where(where).find();
                    }
                    var fieldName = "getFieldBy" + parse_name(item, 1);
                    self[fieldName] = function(arg, arg1){
                        var where = {};
                        where[item] = arg;
                        return this.where(where).getField(arg1);
                    }
                })
            });
        }
    };
    // 链操作方法列表
    var methodNameList = [
        'table','order','alias','having','group',
        'lock','distinct','auto','filter','validate'
    ];
    methodNameList.forEach(function(item){
        methods[item] = function(data){
            this.options[item] = data;
            return this;
        }
    });
    ['count','sum','min','max','avg'].forEach(function(item){
        methods[item] = function(data){
            var field = data || "*";
            return this.getField(item.toUpperCase() + "(" + field + ") AS thinkjs_" + item, true);
        }
    });
    //方法别名
    var aliasMethodMap = {
        update: "save",
        updateField: "setField",
        updateInc: "setInc",
        updateDec: "setDec"
    };
    Object.keys(aliasMethodMap).forEach(function(key){
        var value = aliasMethodMap[key];
        methods[value] = function(){
            return this[key].apply(this, arguments);
        }
    })
    return methods;
})