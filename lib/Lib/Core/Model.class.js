var util = require('util');
var querystring = require('querystring');

//数据库配置
var dbConfigs = [];
//数据库实例化对象
var dbInstances = [];
/**
 * Model类
 * @type {[type]}
 */
var Model = module.exports = Class(function(){
    return {
        initAttr: function(){
            // 当前数据库操作对象
            this.db = null;
            // 主键名称
            this.pk = "id";
            // 数据库连接序号
            this.linkNum = 0;
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
            // 字段信息
            this.fields = {};
            // 数据信息
            this._data = {};
            // 参数
            this._options = {};
            // 是否自动检测数据表字段信息
            this.autoCheckFields = true;
            // 初始化的promise
            this.promise = null;
        },
        /**
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
            //子类的init方法
            this._init && this._init();
            // 数据库初始化操作
            // 获取数据库操作对象
            // 当前模型有独立的数据库连接信息
            this.promise = this.initDb(0, connection || this.connection);
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
            linkNum = linkNum | 0;
            this.linkNum = linkNum;
            if (!linkNum && this.db) {
                return getPromise(this.db);
            };
            if (!dbInstances[linkNum] || config && dbConfigs[linkNum] != config) {
                if (config && isString(config) && config.indexOf("/") == -1) {
                    config = C(config);
                };
                dbInstances[linkNum] = thinkRequire("Db").getInstance(config);
            }
            if (params) {
                extend(this, params);
            };
            // 记录连接信息
            dbConfigs[linkNum] = config;
            this.db = dbInstances[linkNum];
            if (this.name && this.autoCheckFields) {
                return this.checkTableInfo();
            };
            return getPromise(this);
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
                tableName += this.tableName || parseName(this.name);
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
            if (isEmpty(this.fields)) {
                // 如果数据表字段没有定义则自动获取
                if (C('db_fields_cache')) {
                    var fields = F(this.getFieldsCacheFile());
                    if (fields) {
                        this.fields = fields;
                        return getPromise(fields);
                    };
                };
                // 每次都会读取数据表信息
                return this.flushFields();  
            };
            return getPromise(this.fields);
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
                        "_field": Object.keys(data || {}),
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
            if (!isEmpty(this.fields)) {
                return getPromise(all ? this.fields : this.fields["_field"]);
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
            if (key === undefined) {
                return this;
            };
            if (isObject(key)) {
                this._options.cache = key;
            }else{
                //如果没有key，则根据sql语句自动生成
                if (isNumber(key)) {
                    type = expire;
                    expire = key;
                    key = "";
                };
                this._options.cache = {
                    key: key,
                    expire: expire,
                    type: type
                };
            }
            return this;
        },
        /**
         * 指定查询数量
         * @param  {[type]} offset [description]
         * @param  {[type]} length [description]
         * @return {[type]}        [description]
         */
        limit: function(offset, length){
            this._options.limit = length === undefined ? offset : offset + "," + length;
            return this;
        },
        /**
         * 指定分页
         * @return {[type]} [description]
         */
        page: function(page, listRows){
            this._options.page = listRows === undefined ? page : page + "," + listRows;
            return this;
        },
        /**
         * where条件
         * @return {[type]} [description]
         */
        where: function(where){
            if (where && isString(where)) {
                where = {_string: where};
            };
            this._options.where = extend(this._options.where || {}, where);
            return this;
        },
        /**
         * 要查询的字段
         * @param  {[type]} field   [description]
         * @param  {[type]} reverse [description]
         * @return {[type]}         [description]
         */
        field: function(field, reverse){
            if (isArray(field)) {
                field = field.join(",")
            }else if (!field) {
                field = "*";
            };
            this._options.field = field;
            this._options.fieldReverse = reverse;
            return this;
        },
        /**
         * 联合查询
         * @return {[type]} [description]
         */
        union: function(union){
            if (!this._options.union) {
                this._options.union = [];
            };
            this._options.union.push(union);
            return this;
        },
        /**
         * 联合查询
         * @param  {[type]} join [description]
         * @return {[type]}      [description]
         */
        join: function(join){
            if (isArray(join)) {
                this._options.join = join;
            }else{
                if (!this._options.join) {
                    this._options.join = [];
                };
                this._options.join.push(join);
            }
            return this;
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
        /**
         * 解析参数，在this.promise后执行
         * @param  {[type]} options [description]
         * @return promise         [description]
         */
        parseOptions: function(options, extraOptions){
            var self = this;
            options = this.parseWhereOptions(options);
            options = extend(this._options, options, extraOptions);
            // 查询过后清空sql表达式组装 避免影响下次查询
            this._options = {};
            var promise = null;
            //获取数据表下的字段信息
            if (options.table) {
                promise = this.getTableFields(options.table);
            }else{
                options.table = this.getTableName();
                if (isEmpty(self.fields["_field"])) {
                    promise = this.promise.then(function(){
                        return self.fields["_field"];
                    });
                }else{
                    promise = getPromise(self.fields["_field"]);
                }
            }
            //数据表别名
            if (options.alias) {
                options.table += " " + options.alias;
            };
            options.model = this.name;
            return promise.then(function(fields){
                // 字段类型验证
                if (options.where && isObject(options.where) && !isEmpty(fields)) {
                    // 对数组查询条件进行字段类型检查
                    for(var key in options.where){
                        var val = options.where[key];
                        key = key.trim();
                        if (fields.indexOf(key) > -1) {
                            if (isScalar(val)) {
                                options.where = self.parseType(options.where, key);
                            };
                        }else if(key.substr(0, 1) !== "_" && !(/[\.\|\&]/.test(key))){
                            delete options.where[key];
                        }
                    }
                };
                //field反选
                if (options.field && options.fieldReverse) {
                    var optionsField = options.field.split(',');
                    options.field = fields.filter(function(item){
                        if (optionsField.indexOf(item) > -1) {
                            return;
                        };
                        return item;
                    }).join(',');
                };  
                options = self._optionsFilter(options, fields);
                return options;
            });
        },
        /**
         * 选项过滤器
         * 具体的Model类里进行实现
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _optionsFilter: function(options, fields){
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
         * 对插入到数据库中的数据进行处理，要在parseOptions后执行
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        parseData: function(data){
            data = data || {};
            if (!isEmpty(this.fields)) {
                for(var key in data){
                    var val = data[key];
                    if (this.fields["_field"].indexOf(key) === -1) {
                        delete data[key];
                    }else if(isScalar(val)){
                        data = this.parseType(data, key);
                    }
                }
            };
            //安全过滤
            if (typeof this._options.filter == 'function') {
                for(var key in data){
                    data[key] = this._options.filter.call(this, key, data[key]);
                }
                delete this._options.filter;
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
         * 数据插入之前操作，可以返回一个promise
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _beforeAdd: function(data, options){
            return data;
        },
        /**
         * 数据插入之后操作，可以返回一个promise
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterAdd: function(data, options){
            return data;
        },
        /**
         * 添加一条或者多条数据
         * @param {[type]} data    [description]
         * @param {[type]} options [description]
         * @param {[type]} replace [description]
         */
        add: function(data, options, replace){
            //copy data
            data = extend({}, data);
            if (isEmpty(data)) {
                if (this._data) {
                    data = this._data;
                    this._data = {};
                }else{
                    return getPromise(L("_DATA_TYPE_INVALID_"), true);
                }
            };
            var self = this;
            var pk = self.getPk();
            var parsedOptions = {};
            return this.parseOptions(options).then(function(options){
                parsedOptions = options;
                data = self.parseData(data);
                return self._beforeAdd(data, options);
            }).then(function(data){
                return self.db.insert(data, parsedOptions, replace);
            }).then(function(data){
                var id = self.db.getLastInsertId();
                return getPromise(self._afterAdd(id, parsedOptions));
            });
        },
        /**
         * 插入多条数据
         * @param {[type]} data    [description]
         * @param {[type]} options [description]
         * @param {[type]} replace [description]
         */
        addAll: function(data, options, replace){
            if (!isArray(data) || !isObject(data[0])) {
                return getPromise(L("_DATA_TYPE_INVALID_"), true);
            };
            var self = this;
            return this.parseOptions(options).then(function(options){
                return self.db.insertAll(data, options, replace);
            }).then(function(){
                return self.db.getLastInsertId();
            })
        },
        /**
         * 删除后续操作
         * @return {[type]} [description]
         */
        _afterDelete: function(data, options){
            return data;
        },
        /**
         * 删除数据
         * @return {[type]} [description]
         */
        delete: function(options){
            var self = this;
            return this.parseOptions(options).then(function(options){
                return self.db.delete(options);
            }).then(function(data){
                return self._afterDelete(data, options);
            });
        },
        /**
         * 更新前置操作
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _beforeUpdate: function(data, options){
            return data;
        },
        /**
         * 更新后置操作
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterUpdate: function(data, options){
            return data;
        },
        /**
         * 更新数据
         * @return {[type]} [description]
         */
        update: function(data, options){
            data = extend({}, data);
            if (isEmpty(data)) {
                if (this._data) {
                    data = this._data;
                    this._data = {};
                }else{
                    return getPromise(L("_DATA_TYPE_INVALID_"), true);
                }
            };
            var self = this;
            var pk = self.getPk();
            var pkValue = "";
            var options = {};
            return this.parseOptions(options).then(function(opts){
                data = self.parseData(data);
                options = opts;
                return self._beforeUpdate(data, options);
            }).then(function(data){
                if (isEmpty(self._options.where) && isEmpty(options.where)) {
                    // 如果存在主键数据 则自动作为更新条件
                    if (!isEmpty(data[pk])) {
                        var where = {};
                        where[pk] = data[pk];
                        options.where = where;
                        pkValue = data[pk];
                        delete data[pk];
                    }else{
                        return getPromise(L("_OPERATION_WRONG_"), true);
                    }
                };
                return self.db.update(data, options);
            }).then(function(data){
                if (pkValue) {
                    data[pk] = pkValue;
                };
                return self._afterUpdate(data, options);
            }).then(function(data){
                return data.affectedRows;
            })
        },
        /**
         * 更新多个数据，自动用主键作为查询条件
         * @param  {[type]} dataList [description]
         * @return {[type]}          [description]
         */
        updateAll: function(dataList){
            if (!isArray(dataList) || !isObject(dataList[0])) {
                return getPromise(L("_DATA_TYPE_INVALID_"), true);
            };
            var promises = [];
            var self = this;
            dataList.forEach(function(data){
                promises.push(self.update(data));
            });
            return Promise.all(promises);
        },
        /**
         * 更新某个字段的值
         * @param  {[type]} field [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        updateField: function(field, value){
            var data = {};
            if (isObject(field)) {
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
         * 解析options中简洁的where条件
         * @return {[type]} [description]
         */
        parseWhereOptions: function(options){
            if (isNumber(options) || isString(options)) {
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
            }
            return options || {};
        },
        /**
         * find查询后置操作
         * @return {[type]} [description]
         */
        _afterFind: function(result, options){
            return result;
        },
        /**
         * 查询一条数据
         * @return 返回一个promise
         */
        find: function(options){
            var self = this;
            var parsedOptions = {};
            return this.parseOptions(options, {
                limit: 1
            }).then(function(options){
                parsedOptions = options;
                return self.db.select(options);
            }).then(function(data){
                var result = data[0] ? data[0] : {};
                return self._afterFind(result, parsedOptions);
            })
        },
        /**
         * 查询后置操作
         * @param  {[type]} result  [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterSelect: function(result, options){
            return result;
        },
        /**
         * 查询数据
         * @return 返回一个promise
         */
        select: function(options){
            var self = this;
            var parsedOptions = {};
            return this.parseOptions(options).then(function(options){
                parsedOptions = options;
                return self.db.select(options);
            }).then(function(result){
                return self._afterSelect(result, parsedOptions);
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
            var multi = false;
            return this.parseOptions({
                "field": field
            }).then(function(options){
                if (field.indexOf(",") > -1) {
                    if (options.limit === undefined && isNumber(sepa)) {
                        options.limit = sepa;
                    };
                    multi = true;
                }else{
                    options.limit = isNumber(sepa) ? sepa : 1;   
                }
                return self.db.select(options);
            }).then(function(data){
                if (multi) {
                    var length = field.split(",").length;
                    var field = Object.keys(data[0] || {});
                    var key = field.shift();
                    var key2 = field.shift();
                    var cols = {};
                    data.forEach(function(item){
                        var name = item[key];
                        if (length === 2) {
                            cols[name] = item[key2];
                        }else{
                            cols[name] = isString(sepa) ? item.join(sepa) : item;
                        }
                    });
                    return cols;
                }else{
                    if (sepa !== true && options.limit == 1) {
                        return data[0];
                    };
                    return Object.values(data[0] || {})[0];
                }
            })
        },
        /**
         * 根据某个字段值获取一条数据
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        getBy: function(name, value){
            var where = {};
            where[name] = value;
            return this.where(where).find();
        },
        /**
         * SQL查询
         * @return {[type]} [description]
         */
        query: function(sql, parse){
            if (parse !== undefined && !isBoolean(parse) && !isArray(parse)) {
                parse = [].slice.call(arguments);
                parse.shift();
            };
            var self = this;
            return this.parseSql(sql, parse).then(function(sql){
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
            if (parse !== undefined && !isBoolean(parse) && !isArray(parse)) {
                parse = [].slice.call(arguments);
                parse.shift();
            };
            var self = this;
            return this.parseSql(sql, parse).then(function(sql){
                return self.db.execute(sql);
            })
        },
        /**
         * 解析SQL语句
         * @return promise [description]
         */
        parseSql: function(sql, parse){
            var promise = null;
            var self = this;
            if (parse === true) {
                promise = this.parseOptions().then(function(options){
                    return self.db.parseSql(options);
                })
            }else{
                parse = isArray(parse) ? parse : [parse];
                parse.unshift(sql);
                sql = util.format.apply(null, parse);
                var map = {
                    "__TABLE__": this.getTableName(),
                    "__PREFIX__": C('db_prefix')
                };
                sql = sql.replace(/__[A-Z]+__/g, function(a){
                    return map[a] || a;
                })
                promise = getPromise(sql);
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
            if (isString(data)) {
                data = querystring.parse(data);
            };
            this._data = data;
            return this;
        },
        /**
         * 设置操作选项
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        options: function(options){
            if (options === true) {
                return this._options;
            };
            this._options = options;
            return this;
        },
        /**
         * 关闭数据库连接
         * @return {[type]} [description]
         */
        close: function(){
            delete dbInstances[this.linkNum];
            delete dbConfigs[this.linkNum];
            this.db && this.db.close();
        }
    }
}).extend(function(){
    //追加的方法
    var methods = {};
    // 链操作方法列表
    var methodNameList = [
        'table','order','alias','having','group',
        'lock','distinct','auto','filter','validate'
    ];
    methodNameList.forEach(function(item){
        methods[item] = function(data){
            this._options[item] = data;
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
});
/**
 * 关闭所有的数据库连接
 * @return {[type]} [description]
 */
Model.close = function(){
    dbInstances.forEach(function(db){
        db.close();
    });
    dbInstances.length = 0;
    dbConfigs.length = 0;
}