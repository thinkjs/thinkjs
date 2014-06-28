/**
 * mysql数据库
 * @return {[type]} [description]
 */
var mysqlSocket = thinkRequire('MysqlSocket');
module.exports = Db(function(){
    'use strict';
    var keyReg = /[,\'\"\*\(\)`.\s]/;
    return {
        init: function(config){
            this.super_('init');
            if (config) {
                this.config = config;
            }
            this.lastInsertId = 0;
            //查询等待
            this.queryWaiting = {};
        },
        /**
         * 连接数据库
         * @param  {[type]} config  [description]
         * @param  {[type]} linknum [description]
         * @return {[type]}         [description]
         */
        connect: function(config, linknum){
            linknum = linknum || 0;
            if (!this.linkIds[linknum]) {
                config = config || this.config;
                this.linkIds[linknum] = mysqlSocket(config);
                this.connected = true;
            }
            return this.linkIds[linknum];
        },
        /**
         * 查询一条sql
         * @param  string str
         * @return promise
         */
        query: function(str){
            this.initConnect(false);
            if (!this.linkId) {
                return getPromise('linkId is null', true);
            }
            this.queryStr = str;
            var self = this;
            if (!(str in this.queryWaiting)) {
                this.queryWaiting[str] = [];
                return this.linkId.query(str).then(function(data){
                    process.nextTick(function(){
                        self.queryWaiting[str].forEach(function(deferred){
                            deferred.resolve(data);
                        });
                        delete self.queryWaiting[str];
                    })
                    return data;
                });
            }else{
                var deferred = getDefer();
                this.queryWaiting[str].push(deferred);
                return deferred.promise;
            }
        },
        /**
         * 执行一条sql, 返回影响的行数
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
        execute: function(str){
            this.initConnect(false);
            if (!this.linkId) {
                return getPromise('linkId is null', true);
            }
            this.queryStr = str;
            var self = this;
            return this.linkId.query(str).then(function(data){
                self.lastInsertId = data.insertId;
                return data.affectedRows || 0;
            });
        },
        /**
         * 获取数据表字段信息
         * @param  string tableName 数据表名
         * @return promise 返回一个promise
         */
        getFields: function(tableName){
            var sql = 'SHOW COLUMNS FROM ' + this.parseKey(tableName);
            return this.query(sql).then(function(data){
                var ret = {};
                data.forEach(function(item){
                    ret[item.Field] = {
                        'name': item.Field,
                        'type': item.Type,
                        'notnull': item.Null === '',
                        'default': item.Default,
                        'primary': item.Key === 'PRI',
                        'unique': item.Key === 'UNI',
                        'autoinc': item.Extra.toLowerCase() === 'auto_increment'
                    };
                });
                return ret;
            });
        },
        /**
         * 获取数据库的表信息
         * @param  {[type]} dbName [description]
         * @return {[type]}        [description]
         */
        getTables: function(dbName){
            var sql = 'SHOW TABLES';
            if (dbName) {
                sql += ' FROM ' + dbName;
            }
            return this.query(sql).then(function(data){
                return data.map(function(item){
                    for(var key in item){
                        return item[key];
                    }
                });
            });
        },
        /**
         * 关闭连接
         * @return {[type]} [description]
         */
        close: function(){
            if (this.linkId) {
                this.linkId.close();
                this.linkId = null;
            }
        },
        /**
         * 解析key
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        parseKey: function(key){
            key = (key || '').trim();
            if (!keyReg.test(key)) {
                key = '`' + key + '`';
            }
            return key;
        },
        /**
         * 获取最后插入的id
         * @return {[type]} [description]
         */
        getLastInsertId: function(){
            return this.lastInsertId;
        }
    };
});