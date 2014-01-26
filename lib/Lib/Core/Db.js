var url = require("url");
var querystring = require("querystring");
/**
 * 数据库基类
 * @return {[type]} [description]
 */
var Db = module.exports = Class(function(){
    return {
        /**
         * where条件里的表达式
         * @type {Object}
         */
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
        /**
         * 用于查询的sql语句，所有select语句根据该语句解析
         * @type {String}
         */
        selectSql: 'SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT% %UNION%%COMMENT%',
        /**
         * 初始化一些属性，不能直接放在原型上
         * @return {[type]} [description]
         */
        initAttr: function(){
            // 数据库类型
            this.dbType = null;
            // 当前操作所属的模型名
            this.model = "_think_";
            // 当前SQL指令
            this.queryStr = "";
            // 操作的sql列表
            this.modelSql = [];
            // 数据库连接ID 支持多个连接
            this.linkIds = [];
            // 当前连接ID
            this.linkId = null;
            // 是否已经连接数据库
            this.connected = false;
            // 数据库连接参数配置
            this.config = '';
        },
        /**
         * 初始化，类似于constrcut，类实例化时自动调用
         * @return {[type]} [description]
         */
        init: function(){
            this.initAttr();
        },
        /**
         * 连接数据库
         * @return {[type]} [description]
         */
        initConnect: function(){
            if (!this.connected) {
                this.linkId = this.connect();
            };
        },
        /**
         * 解析set集合
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        parseSet: function(data){
            data = data || {};
            var set = [];
            for(var key in data){
                var value = this.parseValue(data[key]);
                if (isScalar(value)) {
                    set.push(this.parseKey(key) + "=" + value);
                };
            }
            return "SET " + set.join(",");
        },
        /**
         * 解析字段名，具体的数据库里实现
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        parseKey: function(key){
            return key;
        },
        /**
         * value分析
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        parseValue: function(value){
            if (isString(value)) {
                value = '\'' + this.escapeString(value) + '\'';
            }else if(isArray(value)){
                if ((value[0] + "").toLowerCase() == 'exp') {
                    value = this.escapeString(value[1]);
                }else{
                    var self = this;
                    value = value.map(function(item){
                        return self.parseValue(item);
                    });
                }
            }else if(isBoolean(value)){
                value = value ? "1" : "0";
            }else if (value === null) {
                value = 'null';
            };
            return value;
        },
        /**
         * field分析
         * parseField("name");
         * parseField("name,email");
         * parseField({
         *     xx_name: "name",
         *     xx_email: "email"
         * })
         * @return {[type]} [description]
         */
        parseField: function(fields){
            if (isString(fields) && fields.indexOf(',') > -1) {
                fields = fields.split(",");
            };
            if (isArray(fields)) {
                var self = this;
                return fields.map(function(item){
                    return self.parseKey(item);
                }).join(",");
            }else if(isObject(fields)){
                var data = [];
                for(var key in fields){
                    data.push(this.parseKey(key) + " AS " + this.parseKey(fields[key]));
                }
                return data.join(",");
            }else if(isString(fields) && fields){
                return this.parseKey(fields);
            }
            return "*";
        },
        /**
         * table别名分析
         * @param  {[type]} tables [description]
         * @return {[type]}        [description]
         */
        parseTable: function(tables){
            if (isString(tables)) {
                tables = tables.split(",");
            };
            if (isArray(tables)) {
                var self = this;
                return tables.map(function(item){
                    return self.parseKey(item);
                }).join(",");
            }else if (isObject(tables)) {
                var data = [];
                for(var key in tables){
                    data.push(this.parseKey(key) + " AS " + this.parseKey(tables[key]));
                }
                return data.join(",");
            }
            return "";
        },
        /**
         * where条件分析
         * @param  {[type]} where [description]
         * @return {[type]}       [description]
         */
        parseWhere: function(where){
            var whereStr = "";
            var self = this;
            where = where || {};
            if (isString(where)) {
                whereStr = where;
            }else{
                // 定义逻辑运算规则 例如 OR XOR AND NOT
                var oList = ["AND", "OR", "XOR"];
                var operate = (where["_logic"] + "").toUpperCase();
                delete where["_logic"];
                operate = oList.indexOf(operate) > -1 ? " " + operate + " " : " AND ";
                //key值的安全检测正则
                var keySafeRegExp = /^[\w\|\&\-\.\(\)\,]+$/;
                var multi = where['_multi'];
                delete where['_multi'];

                for(var key in where){
                    key = key.trim();
                    var val = where[key];
                    whereStr += "( ";
                    if (key.indexOf("_") === 0) {
                        // 解析特殊条件表达式
                        whereStr += this.parseThinkWhere(key, val);
                    }else{
                        if (!keySafeRegExp.test(key)) {
                            console.log(key + " is not safe");
                            continue;
                        };
                        // 支持 name|title|nickname 方式定义查询字段
                        if (key.indexOf('|') > -1) {
                            var arr = key.split("|");
                            whereStr += arr.map(function(item, i){
                                var v = multi ? val[i] : val;
                                return "(" + self.parseWhereItem(self.parseKey(item), v) + ")";
                            }).join(" OR ");
                        }else if (key.indexOf("&") > -1) {
                            var arr = key.split("&");
                            whereStr += arr.map(function(item, i){
                                var v = multi ? val[i] : val;
                                return "(" + self.parseWhereItem(self.parseKey(item), v) + ")";
                            }).join(" AND ");
                        }else{
                            whereStr += this.parseWhereItem(this.parseKey(key), val);
                        }
                    }
                    whereStr += ")" + operate;
                }
                whereStr = whereStr.substr(0, whereStr.length - operate.length);
            }

            return whereStr ? (" WHERE " + whereStr) : "";
        },
        /**
         * 解析单个查询条件
         * @param  {[type]} key [description]
         * @param  {[type]} val [description]
         * @return {[type]}     [description]
         */
        parseWhereItem: function(key, val){
            var whereStr = "";
            if (isArray(val)) {
                if (isString(val[0])) {
                    var reg = /^(EQ|NEQ|GT|EGT|LT|ELT)$/i;
                    var reg1 = /^(NOTLIKE|LIKE)$/i;
                    if (reg.test(val[0])) { // 比较运算
                        whereStr += key + " " + this.comparison[val[0].toLowerCase()] + " " + this.parseValue(val[1]);
                    }else if (reg1.test(val[0])) { // 模糊查找
                        if (isArray(val[1])) {
                            var likeLogic = (val[2] ? val[2] : "OR").toUpperCase();
                            var likesLogic = ['AND','OR','XOR'];
                            if (likesLogic.indexOf(likeLogic) > -1) {
                                var likeStr = this.comparison[val[0].toLowerCase()];
                                var like = val[1].map(function(item){
                                    return key + " " + likeStr + " " + this.parseValue(item);
                                }).join(likeLogic);
                                whereStr += "(" + like + ")";
                            };
                        }else{
                            whereStr += key + " " + this.comparison[val[0].toLowerCase()] + " " + this.parseValue(val[1]);
                        }
                    }else if(val[0].toLowerCase() == 'exp'){ // 使用表达式
                        whereStr += "(" + key + " " + val[1] + ")";
                    }else if(/IN/i.test(val[0])){ // IN 运算
                        if (val[2] == 'exp') {
                            whereStr += key + " " + val[0].toUpperCase() + " " + val[1];
                        }else{
                            if (isString(val[1])) {
                                val[1] = val[1].split(",");
                            };
                            var zone = this.parseValue(val[1]).join(",");
                            whereStr += key + " " + val[0].toUpperCase() + " (" + zone + ")";
                        }
                    }else if(/BETWEEN/i.test(val[0])){ // BETWEEN运算
                        var data = isString(val[1]) ? val[1].split(",") : val[1];
                        if (!isArray(data)) {
                            data = [val[1], val[2]];
                        };
                        whereStr += " (" + key + " " + val[0].toUpperCase() + " " + this.parseValue(data[0]) + " AND " + this.parseValue(data[1]) + ")";
                    }else{
                        console.log("_EXPRESS_ERROR_" + key + val);
                        return "";
                    }
                }else{
                    var length = val.length;
                    var rule = val[val.length - 1] || "";
                    var ruleList = ['AND','OR','XOR'];
                    if (rule && ruleList.indexOf(rule) > -1) {
                        length = length - 1;
                    }else{
                        rule = "AND";
                    }
                    for(var i=0; i<length; i++){
                        var data = isArray(val[i]) ? val[i][1] : val[i];
                        var exp = ((isArray(val[i]) && val[i][0]) + "").toLowerCase();
                        if (exp == 'exp') {
                            whereStr += "(" + key + " " + data + ") " + rule + " ";
                        }else{
                            var op = isArray(val[i]) ? this.comparison[val[i][0].toLowerCase()] : "=";
                            whereStr += "(" + key + " " + op + " " + this.parseValue(data) + ") " + rule + " ";
                        }
                    }
                    whereStr = whereStr.substr(0, whereStr.length - 4);
                }
            }else{
                //对字符串类型字段采用模糊匹配
                if (C('db_like_fields') && (new RegExp(C('db_like_fields'), "i")).test(key)) {
                    whereStr += key + " LIKE " + this.parseValue("%" + val + "%");
                }else{
                    whereStr = key + " = " + this.parseValue(val);
                }
            }
            return whereStr;
        },
        /**
         * 解析一些特殊的where条件
         * @param  {[type]} key [description]
         * @param  {[type]} val [description]
         * @return {[type]}     [description]
         */
        parseThinkWhere: function(key, val){
            var whereStr = "";
            switch(key){
                // 字符串模式查询条件
                case "_string":
                    return val;
                // 复合查询条件
                case "_complex":
                    return this.parseWhere(val).substr(6);
                // 字符串模式查询条件
                case "_query":
                    var where = querystring.parse(val);
                    var op = " AND ";
                    if ("_logic" in where) {
                        op = " " + where["_logic"].toLowerCase() + " ";
                        delete where["_logic"];
                    };
                    var arr = [];
                    for(var name in where){
                        var val = where[name];
                        val = this.parseKey(name) + " = " + this.parseValue(val);
                        arr.push(val);
                    }
                    whereStr = arr.join(op);
                    return whereStr;
                default:
                    return "";
            }
            return "";
        },
        /**
         * 解析limit，对非法的limit进行过滤
         * @param  {[type]} limit [description]
         * @return {[type]}       [description]
         */
        parseLimit: function(limit){
            limit = (limit + "").split(",").slice(0, 2);
            var flag = limit.every(function(item){
                return isNumberString(item);
            });
            if (!flag) {
                return "";
            };
            limit = limit.join(",");
            return limit ? (" LIMIT " + limit) : "";
        },
        /**
         * 解析join
         * @param  {[type]} join [description]
         * @return {[type]}      [description]
         */
        parseJoin: function(join){
            var joinStr = "";
            if (join) {
                if (isObject(join)) {
                    for(var key in join){
                        var val = join[key];
                        if (val.toLowerCase().indexOf("join") > -1) {
                            joinStr += val;
                        }else{
                            joinStr += " LEFT JOIN " + val;
                        }
                    }
                }else{
                    joinStr += " LEFT JOIN " + join;
                }
            };
            //将__TABLE_NAME__这样的字符串替换成正规的表名,并且带上前缀和后缀
            joinStr = joinStr.replace(/__([A-Z_-]+)__/g, function(a, b){
                return C('db_prefix') + b.toLowerCase();
            });
            return joinStr;
        },
        /**
         * 解析order
         * @param  {[type]} order [description]
         * @return {[type]}       [description]
         */
        parseOrder: function(order){
            var orderStr = "";
            var self = this;
            if (isArray(order)) {
                orderStr = order.map(function(item){
                    return self.parseKey(item);
                }).join(",");
            }else if (isObject(order)) {
                var arr = [];
                for(var key in order){
                    var val = order[key];
                    val = this.parseKey(key) + " " + val;
                    arr.push(val);
                }
                orderStr = arr.join(",");
            };
            return order ? (" ORDER BY " + order) : "";
        },
        /**
         * 解析group
         * @param  {[type]} group [description]
         * @return {[type]}       [description]
         */
        parseGroup: function(group){
            return group ? (" GROUP BY " + group) : "";
        },
        /**
         * 解析having
         * @param  {[type]} having [description]
         * @return {[type]}        [description]
         */
        parseHaving: function(having){
            return having ? (" HAVING " + having) : "";
        },
        /**
         * 解析注释，一般情况下用不到
         * @param  {[type]} comment [description]
         * @return {[type]}         [description]
         */
        parseComment: function(comment){
            return comment ? (" /* " + comment + "*/") : "";   
        },
        /**
         * 解析Distinct
         * @param  {[type]} distinct [description]
         * @return {[type]}          [description]
         */
        parseDistinct: function(distinct){
            return distinct ? (" Distinct " + distinct) : "";
        },
        /**
         * 解析Union
         * @param  {[type]} union [description]
         * @return {[type]}       [description]
         */
        parseUnion: function(union){
            if (!union) {
                return "";
            };
            var str = "";
            if ("_all" in union) {
                str = "UNION ALL ";
                delete union["_all"];
            }else{
                str = "UNION ";
            }
            var sql = [];
            for(var key in union){
                var val = union[key];
                val = str + (isArray(val) ? this.buildSelectSql(val) : val);
                sql.push(sql);
            }
            return sql.join(" ");
        },
        /**
         * 解析Lock
         * @param  {[type]} lock [description]
         * @return {[type]}      [description]
         */
        parseLock: function(lock){
            if (!lock) {
                return "";
            };
            return " FOR UPDATE ";
        },
        /**
         * 将page转化为sql里的limit
         * @return {[type]} [description]
         */
        pageToLimit: function(options){
            options = options || {};
            //根据page生成limit
            if ("page" in options) {
                var page = options.page + "";
                var listRows = 0;
                if (page.indexOf(",") > -1) {
                    page = page.split(",");
                    listRows = page[1];
                    page = page[0];
                }
                page = parseInt(page, 10) || 1;
                if (!listRows) {
                    listRows = isNumberString(options.limit) ? options.limit : C('db_nums_per_page');
                };
                var offset = listRows * (page - 1);
                options.limit = offset + "," + listRows;
            };
            return options;
        },
        /**
         * 拼接select查询语句
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        buildSelectSql: function(options){
            options = options || {};
            options = this.pageToLimit(options);
            var sql = this.parseSql(this.selectSql, options);
            sql += this.parseLock(options.lock);
            return sql;
        },
        /**
         * 解析sql语句
         * @param  {[type]} sql     [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        parseSql: function(sql, options){
            options = options || {};
            var self = this;
            return sql.replace(/\%([A-Z]+)\%/g, function(a, type){
                type = type.toLowerCase();
                return self["parse" + ucfirst(type)](options[type] || "");
            })
        },
        /**
         * 插入一条记录
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @param  {[type]} replace [description]
         * @return {[type]}         [description]
         */
        insert: function(data, options, replace){
            data = data || {};
            options = options || {};
            var values = [];
            var fields = [];
            this.model = options.model;
            for(var key in data){
                var val = data[key];
                val = this.parseValue(val);
                if (isScalar(val)) {
                    values.push(val);
                    fields.push(this.parseKey(key));
                };
            }
            var sql = (replace ? "REPLACE" : "INSERT") + " INTO ";
            sql += this.parseTable(options.table) + " (" + fields.join(",") + ") ";
            sql += "VALUES(" + values.join(",") + ")";
            sql += this.parseLock(options.lock) + this.parseComment(options.comment);
            return this.execute(sql);
        },
        /**
         * 插入多条记录
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @param  {[type]} replace [description]
         * @return {[type]}         [description]
         */
        insertAll: function(data, options, replace){
            var fields = Object.keys(data[0]);
            var self = this;
            fields = fields.map(function(item){
                return self.parseKey(item);
            }).join(",");
            var values = data.map(function(item){
                var value = [];
                for(var key in item){
                    var val = item[key];
                    val = self.parseValue(val);
                    if (isScalar(val)) {
                        value.push(val);
                    };
                }
                return "(" + value.join(",") + ")";
            }).join(",");
            var sql = replace ? "REPLACE" : "INSERT";
            sql += " INTO " + this.parseTable(options.table) + "(" + fields + ") VALUES " + values;
            return this.execute(sql);
        },
        /**
         * 从一个选择条件的结果插入记录
         * @param  {[type]} fields  [description]
         * @param  {[type]} table   [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        selectInsert: function(fields, table, options){
            options = options || {};
            this.model = options.model;
            if (isString(fields)) {
                fields = fields.split(",");
            };
            var self = this;
            fields = fields.map(function(item){
                return self.parseKey(item);
            });
            var sql = "INSERT INTO " + this.parseTable(options.table) + " (" + fields.join(",") + ")";
            sql += this.buildSelectSql(options);
            return this.execute(sql);
        },
        /**
         * 删除记录
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        delete: function(options){
            options = options || {};
            this.model = options.model;
            var sql = [
                "DELETE FROM ",
                this.parseTable(options.table),
                this.parseWhere(options.where),
                this.parseOrder(options.order),
                this.parseLimit(options.limit),
                this.parseLock(options.lock),
                this.parseComment(options.comment)
            ].join("");
            return this.execute(sql);
        },
        /**
         * 更新数据
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        update: function(data, options){
            options = options || {};
            this.model = options.model;
            var sql = [
                "UPDATE ",
                this.parseTable(options.table),
                this.parseSet(data),
                this.parseWhere(options.where),
                this.parseOrder(options.order),
                this.parseLimit(options.limit),
                this.parseLock(options.lock),
                this.parseComment(options.comment)
            ].join("");
            return this.execute(sql);
        },
        /**
         * 数据查询
         * @todo 返回是个promise，缓存调用需要修改
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        select: function(options){
            if (isString(options) && options.indexOf('SELECT') > -1) {
                var sql = options;
                var cache = arguments[1];
            }else{
                options = options || {};
                this.model = options.model;
                var sql = this.buildSelectSql(options);
                var cache = options.cache;
            }
            var self = this;
            //获取数据
            function queryData(){
                return this.query(sql).then(function(data){
                    if (cache) {
                        S(key, data, cache);
                    };
                    return data;
                });
            }
            if (!isEmpty(cache) && C('db_cache_on')) {
                var key = isString(cache.key) && cache.key ? cache.key : md5(sql);
                return S(key, undefined, cache).then(function(value){
                    return value || queryData.call(self);
                })
            };
            return queryData.call(this);
        },
        /**
         * 转义字符
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
        escapeString: function(str){
            if (!str) {
                return "";
            };
            return str.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
                switch(s) {
                    case "\0": return "\\0";
                    case "\n": return "\\n";
                    case "\r": return "\\r";
                    case "\b": return "\\b";
                    case "\t": return "\\t";
                    case "\x1a": return "\\Z";
                    default: return "\\"+s;
                }
          });
        },
        /**
         * 获取上次的sql语句
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        getLastSql: function(model){
            return model ? this.modelSql[model] : this.queryStr;
        },
        /**
         * 设置模型
         * @param {[type]} model [description]
         */
        setModel: function(model){
            this.model = model;
            return this;
        }
    }
});
/**
 * 解析dsn
 * 格式： mysql://username:passwd@localhost:3306/DbName
 * @param  string dsn [description]
 * @return {[type]}     [description]
 */
Db.parseDSN = function(dsn){
    if (!dsn) {
        return false;
    };
    var info = url.parse(dsn);
    var auth = (info.auth || "").split(":");
    return {
        "dbms": info.protocol,
        "username": auth[0] || "",
        "password": auth[1] || "",
        "hostname": info.hostname || "",
        "hostport": info.port || "",
        "database": (info.pathname || "").substr(1),
        "dsn": ""
    }
}
/**
 * 解析配置
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
Db.parseConfig = function(config){
    if (config && isString(config)) {
        return this.parseDSN(config);
    }else if(isObject(config)){
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
};
/**
 * 根据配置获取对应的数据库实例
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
Db.getInstance = function(config){
    config = this.parseConfig(config);
    if (!config.dbms) {
        console.log("no dbms config");
        return false;
    };
    //数据库类型
    var dbType = config.dbms.toLowerCase();
    dbType = dbType.substr(0, 1).toUpperCase() + dbType.substr(1);
    var instance = thinkRequire(dbType + "Db")(config);
    instance.dbType = dbType.toUpperCase();
    return instance;
}