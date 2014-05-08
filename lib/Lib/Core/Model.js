var util = require('util');
var querystring = require('querystring');

//数据库配置
var dbConfigs = [];
//数据库实例化对象
var dbInstances = [];
//数据表的字段信息
var tableFields = {};
//db缓存数据
var dbCacheData = {};
//等待数据
var dbWaitingData = {};
/**
 * Model类
 * @type {[type]}
 */
var Model = module.exports = Class(function(){
    "use strict";
    //解析page参数
    var parsePage = function(options){
        if ("page" in options) {
            var page = options.page + "";
            var num = 0;
            if (page.indexOf(",") > -1) {
                page = page.split(",");
                num = parseInt(page[1], 10);
                page = page[0];
            }
            num = num || C('db_nums_per_page');
            page = parseInt(page, 10) || 1;
            return {
                page: page,
                num: num
            };
        }
        return {
            page: 1,
            num: C('db_nums_per_page')
        };
    };
    /**
     * 字符串命名风格转换
     * @param  {[type]} name [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    var parseName = function(name, type){
        name = (name + "").trim();
        if (type) {
            name = name.replace(/_([a-zA-Z])/g, function(a, b){
                return b.toUpperCase();
            });
            return name.substr(0, 1).toUpperCase() + name.substr(1);
        } else {
            //首字母如果是大写，不转义为_x
            if (name.length >= 1) {
                name = name.substr(0, 1).toLowerCase() + name.substr(1);
            }
            return name.replace(/[A-Z]/g, function(a){
                return "_" + a;
            }).toLowerCase();
        }
    };

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
        init: function(name, tablePrefix){
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
            if (this._init) {
                this._init();
            }
        },
        /**
         * 初始化数据库连接的promise
         * @return {[type]} [description]
         */
        initPromise: function(){
            if (this.promise) {
                return this.promise;
            }
            this.promise = this.initDb(0);
            return this.promise;
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
            }
            if (!dbInstances[linkNum] || config && dbConfigs[linkNum] !== config) {
                if (config && isString(config) && config.indexOf("/") === -1) {
                    config = C(config);
                }
                dbInstances[linkNum] = thinkRequire("Db").getInstance(config);
            }
            if (params) {
                extend(this, params);
            }
            // 记录连接信息
            dbConfigs[linkNum] = config;
            this.db = dbInstances[linkNum];
            if (this.name && this.autoCheckFields) {
                return this.checkTableInfo();
            }
            return getPromise(this);
        },
        /**
         * 获取模型名
         * @access public
         * @return string
         */
        getModelName: function(){
            if (this.name) {
                return this.name;
            }
            var filename = this.__filename || __filename;
            var name = filename.split("/").pop();
            this.name = name.substr(0, name.length - 8);
            return this.name;
        },
        /**
         * 获取表名
         * @return {[type]} [description]
         */
        getTableName: function(){
            var tableName;
            if (!this.trueTableName) {
                tableName = this.tablePrefix || "";
                tableName += this.tableName || parseName(this.getModelName());
                this.trueTableName = tableName.toLowerCase();
            }
            tableName = (this.dbName ? this.dbName + "." : "") + this.trueTableName;
            return tableName;
        },
        /**
         * 获取缓存数据表字段信息的缓存文件
         * @return {[type]} [description]
         */
        // getFieldsCacheFile: function(){
        //     var db = this.dbName || C('db_name');
        //     return '_fields/' + db + "." + this.getModelName().toLowerCase();
        // },
        /**
         * 自动检测数据表信息
         * @access protected
         * @return void
         */
        checkTableInfo: function(){
            if (isEmpty(this.fields)) {
                if (C('db_fields_cache')) {
                    var fields = tableFields[this.getTableName()];
                    if (fields) {
                        this.fields = fields;
                        return getPromise(fields);
                    }
                }
                // 每次都会读取数据表信息
                return this.flushFields();  
            }
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
                    tableFields[self.getTableName()] = fields;
                }
                return fields;
            });
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
            }
            if (table) {
                return this.db.getFields(table).then(function(data){
                    var fields = {
                        "_field": Object.keys(data || {}),
                        "_autoinc": false,
                        "_unique": []
                    };
                    var types = {};
                    for(var key in data){
                        var val = data[key];
                        types[key] = val.type;
                        if (val.primary) {
                            fields._pk = key;
                            if (val.autoinc) {
                                fields._autoinc = true;
                            }
                        }else if (val.unique) {
                            fields._unique.push(key);
                        }
                    }
                    fields._type = types;
                    return all ? fields : fields._field;
                });
            }
            if (!isEmpty(this.fields)) {
                return getPromise(all ? this.fields : this.fields._field);
            }
            return this.getTableFields(this.getTableName(), all);
        },
        /**
         * 获取类型为唯一的字段
         * @return {[type]} [description]
         */
        getUniqueField: function(data){
            var unqiueFileds = this.fields._unique;
            var unqiue = "";
            unqiueFileds.some(function(item){
                if (!data || data[item]) {
                    unqiue = item;
                    return unqiue;
                }
            });
            return unqiue;
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
            return this.fields._pk || this.pk;
        },
        /**
         * 缓存
         * @param  {[type]} key    [description]
         * @param  {[type]} expire [description]
         * @param  {[type]} type   [description]
         * @return {[type]}        [description]
         */
        cache: function(key, timeout){
            if (key === undefined) {
                return this;
            }
            var options = this.getCacheOptions(key, timeout);
            this._options.cache = options;
            return this;
        },
        /**
         * 获取缓存的选项
         * @param  {[type]} key     [description]
         * @param  {[type]} timeout [description]
         * @return {[type]}         [description]
         */
        getCacheOptions: function(key, timeout, type){
            if (isObject(key)) {
                return key;
            }
            if (isNumber(key)) {
                timeout = key;
                key = "";
            }
            var cacheType = type === undefined ? C('db_cache_type') : type;
            var options = {
                key: key,
                timeout: timeout || C('db_cache_timeout'),
                type: cacheType,
                gcType: "dbCache"
            }
            if (cacheType === 'File') {
                options.cache_path = C('db_cache_path');
            }else{
                options.cacheData = dbCacheData;
            }
            return options;
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
            }
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
                field = field.join(",");
            }else if (!field) {
                field = "*";
            }
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
            }
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
                }
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
            });
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
                if (isEmpty(self.fields._field)) {
                    promise = this.initPromise().then(function(){
                        return self.fields._field;
                    });
                }else{
                    promise = getPromise(self.fields._field);
                }
            }
            //数据表别名
            if (options.alias) {
                options.table += " " + options.alias;
            }
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
                            }
                        }else if(key.substr(0, 1) !== "_" && !(/[\.\|\&]/.test(key))){
                            delete options.where[key];
                        }
                    }
                }
                //field反选
                if (options.field && options.fieldReverse) {
                    var optionsField = options.field.split(',');
                    options.field = fields.filter(function(item){
                        if (optionsField.indexOf(item) > -1) {
                            return;
                        }
                        return item;
                    }).join(',');
                }
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
            var fieldType = this.fields._type[key] || "";
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
            data = extend({}, data);
            var key;
            if (!isEmpty(this.fields)) {
                for(key in data){
                    var val = data[key];
                    if (this.fields._field.indexOf(key) === -1) {
                        delete data[key];
                    }else if(isScalar(val)){
                        data = this.parseType(data, key);
                    }
                }
            }
            //安全过滤
            if (typeof this._options.filter === 'function') {
                for(key in data){
                    data[key] = this._options.filter.call(this, key, data[key]);
                }
                delete this._options.filter;
            }
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
        _beforeAdd: function(data){
            return data;
        },
        /**
         * 数据插入之后操作，可以返回一个promise
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterAdd: function(data){
            return data;
        },
        /**
         * 添加一条数据
         * @param {[type]} data    [description]
         * @param {[type]} options [description]
         * @param int 返回插入的id
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
            }
            var self = this;
            //解析后的选项
            var parsedOptions = {};
            //解析后的数据
            var parsedData = {};
            return this.parseOptions(options).then(function(options){
                parsedOptions = options;
                return self._beforeAdd(data, parsedOptions);
            }).then(function(data){
                parsedData = data;
                data = self.parseData(data);
                return self.db.insert(data, parsedOptions, replace);
            }).then(function(){
                parsedData[self.getPk()] = self.db.getLastInsertId();
                return self._afterAdd(parsedData, parsedOptions);
            }).then(function(){
                return parsedData[self.getPk()];
            });
        },
        /**
         * 如果当前条件的数据不存在，才添加
         * @param  {[type]} data      要插入的数据
         * @param  {[type]} where      where条件
         * @param  boolean returnType 返回值是否包含type
         * @return {[type]}            promise
         */
        thenAdd: function(data, where, returnType){
            this.where(where);
            var self = this;
            return this.find().then(function(findData){
                if (!isEmpty(findData)) {
                    var idValue = findData[self.getPk()];
                    return returnType ? getObject([self.getPk(), 'type'], [idValue, 'exist']) : idValue;
                }
                return self.add(data).then(function(insertId){
                    return returnType ? getObject([self.getPk(), 'type'], [insertId, 'add']) : insertId;
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
            if (!isArray(data) || !isObject(data[0])) {
                return getPromise(L("_DATA_TYPE_INVALID_"), true);
            }
            var self = this;
            return this.parseOptions(options).then(function(options){
                return self.db.insertAll(data, options, replace);
            }).then(function(){
                return self.db.getLastInsertId();
            });
        },
        /**
         * 删除后续操作
         * @return {[type]} [description]
         */
        _afterDelete: function(data){
            return data;
        },
        /**
         * 删除数据
         * @return {[type]} [description]
         */
        delete: function(options){
            var self = this;
            var parsedOptions = {};
            return this.parseOptions(options).then(function(options){
                parsedOptions = options;
                return self.db.delete(options);
            }).then(function(){
                return self._afterDelete(parsedOptions.where || {}, parsedOptions);
            });
        },
        /**
         * 更新前置操作
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _beforeUpdate: function(data){
            return data;
        },
        /**
         * 更新后置操作
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterUpdate: function(data){
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
            }
            var self = this;
            var pk = self.getPk();
            var parsedOptions = {};
            var parsedData = {};
            var affectedRows = 0;
            return this.parseOptions(options).then(function(options){
                parsedOptions = options;
                return self._beforeUpdate(data, options);
            }).then(function(data){
                parsedData = data;
                data = self.parseData(data);
                if (isEmpty(parsedOptions.where)) {
                    // 如果存在主键数据 则自动作为更新条件
                    if (!isEmpty(data[pk])) {
                        parsedOptions.where = getObject(pk, data[pk]);
                        delete data[pk];
                    }else{
                        return getPromise(L("_OPERATION_WRONG_"), true);
                    }
                }else{
                    parsedData[pk] = parsedOptions.where[pk];
                }
                return self.db.update(data, parsedOptions);
            }).then(function(data){
                affectedRows = data.affectedRows;
                return self._afterUpdate(parsedData, parsedOptions);
            }).then(function(){
                return affectedRows;
            });
        },
        /**
         * 更新多个数据，自动用主键作为查询条件
         * @param  {[type]} dataList [description]
         * @return {[type]}          [description]
         */
        updateAll: function(dataList){
            if (!isArray(dataList) || !isObject(dataList[0])) {
                return getPromise(L("_DATA_TYPE_INVALID_"), true);
            }
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
                    where: where
                };
            }
            return options || {};
        },
        /**
         * find查询后置操作
         * @return {[type]} [description]
         */
        _afterFind: function(result){
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
                return self._afterFind(data[0] || {}, parsedOptions);
            });
        },
        /**
         * 查询后置操作
         * @param  {[type]} result  [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterSelect: function(result){
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
         * 返回数据里含有count信息的查询
         * @param  options  查询选项
         * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
         * @return promise         
         */
        countSelect: function(options, pageFlag){
            if (isBoolean(options)) {
                pageFlag = options;
                options = {};
            }
            var self = this;
            //解析后的options
            var parsedOptions = {};
            var result = {};
            return this.parseOptions(options).then(function(options){
                delete options.table;
                parsedOptions = options;
                return self.options({
                    where: options.where,
                    cache: options.cache,
                    join: options.join
                }).count(self.getTableName() + '.' + self.getPk());
            }).then(function(count){
                var pageOptions = parsePage(parsedOptions);
                var totalPage = Math.ceil(count / pageOptions.num);
                if (isBoolean(pageFlag)) {
                    if (pageOptions.page > totalPage) {
                        pageOptions.page = pageFlag === true ? 1 : totalPage;
                    }
                    parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                }
                result = extend({count: count, total: totalPage}, pageOptions);
                return self.select(parsedOptions);
            }).then(function(data){
                result.data = data;
                return result;
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
            var parseOptions;
            return this.parseOptions({
                "field": field
            }).then(function(options){
                parseOptions = options;
                if (field.indexOf(",") > -1) {
                    if (options.limit === undefined && isNumber(sepa)) {
                        options.limit = sepa;
                    }
                    multi = true;
                }else{
                    options.limit = isNumber(sepa) ? sepa : 1;   
                }
                return self.db.select(options);
            }).then(function(data){
                if (multi) {
                    var length = field.split(",").length;
                    field = Object.keys(data[0] || {});
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
                    if (sepa !== true && parseOptions.limit === 1) {
                        return data[0];
                    }
                    return Object.values(data[0] || {})[0];
                }
            });
        },
        /**
         * 根据某个字段值获取一条数据
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        getBy: function(name, value){
            var where = getObject(name, value);
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
            }
            var self = this;
            return this.parseSql(sql, parse).then(function(sql){
                return self.db.query(sql);
            });
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
            }
            var self = this;
            return this.parseSql(sql, parse).then(function(sql){
                return self.db.execute(sql);
            });
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
                });
            }else{
                if (parse === undefined) {
                    parse = [];
                }else{
                    parse = isArray(parse) ? parse : [parse];
                }
                parse.unshift(sql);
                sql = util.format.apply(null, parse);
                var map = {
                    "__TABLE__": '`' + this.getTableName() + '`'
                };
                sql = sql.replace(/__([A-Z]+)__/g, function(a, b){
                    return map[a] || ('`' + C('db_prefix') + b.toLowerCase() + '`');
                });
                promise = getPromise(sql);
            }
            return this.initDb().then(function(){
                self.db.setModel(self.name);
                return promise;
            });
        },
        /**
         * 等待第一个回调成功后，才执行后面的回调
         * @param  {[type]}   key      [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        waiting: function(key, callback){
            if (key in dbWaitingData) {
                if (dbWaitingData[key].status === 'done') {
                    return getPromise(dbWaitingData[key].data);
                }else{
                    var deferred = getDefer();
                    dbWaitingData[key].deferred.push(deferred);
                    return deferred.promise;
                }
            }
            dbWaitingData[key] = {data: null, status: "waiting", deferred: []};
            return getPromise(callback()).then(function(data){
                dbWaitingData[key].data = data;
                dbWaitingData[key].status = 'done';
                dbWaitingData[key].deferred.forEach(function(deferred){
                    deferred.resolve(data);
                });
                dbWaitingData[key].deferred.length = 0;
                return data;
            })
        },
        /**
         * 设置数据对象值
         * @return {[type]} [description]
         */
        data: function(data){
            if (data === true) {
                return this._data;
            }
            if (isString(data)) {
                data = querystring.parse(data);
            }
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
            }
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
            if (this.db) {
                this.db.close();
            }
        }
    };
}).extend(function(){
    "use strict";
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
        };
    });
    ['count','sum','min','max','avg'].forEach(function(item){
        methods[item] = function(data){
            var field = data || "*";
            return this.getField(item.toUpperCase() + "(" + field + ") AS thinkjs_" + item, true);
        };
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
        };
    });
    return methods;
});
/**
 * 关闭所有的数据库连接
 * @return {[type]} [description]
 */
Model.close = function(){
    "use strict";
    dbInstances.forEach(function(db){
        db.close();
    });
    dbInstances.length = 0;
    dbConfigs.length = 0;
};
/**
 * 清除数据库缓存
 * @return {[type]} [description]
 */
// Model.clearCache = function(){
//     var cacheType = C('db_cache_type');
//     if (cacheType === 'File') {
//         //this._options.cache.cache_path = CACHE_PATH + "/db";
//     }else{
//         dbCacheData = {};
//     }
// }