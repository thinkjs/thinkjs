/**
 * mysql数据库
 * @return {[type]} [description]
 */
var mysqlSocket = think_require("MysqlSocket");
var db = module.exports = Db(function(){
    return {
        init: function(config){
            this.super("init");
            if (config) {
                this.config = config;
            };
        },
        connect: function(config, linknum){
            linknum = linknum || 0;
            if (!this.linkID[linknum]) {
                config = config || this.config;
                var instance = this.linkID[linknum] = mysqlSocket(config);
                //设置字符集
                instance.query("SET NAMES '" + C('db_charset') + "'");
                this.connected = true;
            };
            return this.linkID[linknum];
        },
        query: function(str){
            this.initConnect(false);
            if (!this._linkID) {
                return false;
            };
            this.queryStr = str;
            if (this.queryID) {
                this.free();
            };
            N('db_query', 1);
            return this._linkID.query(str);
        },
        execute: function(str){
            return this.query(str);
        },
        /**
         * 获取数据表字段信息
         * @param  string tableName 数据表名
         * @return promise 返回一个promise
         */
        getFields: function(tableName){
            var deferred = when.defer();
            var result = this.query("SHOW COLUMNS FROM " + this.parseKey(tableName));
            if (result) {
                result.then(function(data){
                    var ret = {};
                    data.forEach(function(item){
                        ret[item.Field] = {
                            "name": item.Field,
                            "type": item.Type,
                            "notnull": item.Null === "",
                            "default": item.Default,
                            "primary": item.Key == 'pri',
                            "autoinc": item.Extra.toLowerCase() == 'auto_increment'
                        };
                    });
                    deferred.resolve(ret);
                })
            }else{
                process.nextTick(function(){
                    deferred.reject();
                })
            }
            return deferred.promise;
        },
        /**
         * 获取数据库的表信息
         * @param  {[type]} dbName [description]
         * @return {[type]}        [description]
         */
        getTables: function(dbName){
            var sql = "SHOW TABLES";
            if (dbName) {
                sql = "SHOW TABLES FROM " + dbName;
            };
            var deferred = when.defer();
            var result = this.query(sql);
            if (result) {
                result.then(function(data){
                    data = data.map(function(item){
                        for(var key in item){
                            return item[key];
                        }
                    });
                    deferred.resolve(data);
                })
            }else{
                process.nextTick(function(){
                    deferred.reject();
                })
            }
            return deferred.promise;
        },
        error: function(){
            
        },
        parseKey: function(key){
            key = (key || "").trim();
            var reg = /[,\'\"\*\(\)`.\s]/;
            if (!reg.test(key)) {
                key = '`' + key + '`';
            };
            return key;
        }
    }
});