/**
 * mysql socket
 * @return {[type]} [description]
 */

//暂时使用mysql库
var mysql = require("mysql");
var socket = module.exports = Class(function(){
    return {
        handle: null,
        error : "",
        config: null,
        deferred: null,
        init: function(config){
            this.handle = null;
            this.error = "";
            this.config = config;
            this.deferred = null;
        },
        /**
         * 建立数据库连接
         * @return {[type]} [description]
         */
        connect: function(){
            if (this.handle) {
                return true;
            };
            //清除错误信息
            this.error = "";

            var self = this;
            var deferred = when.defer();
            //创建连接
            var connection = mysql.createConnection({
                host     : this.config.hostname || "localhost",
                user     : this.config.username || "root",
                password : this.config.password || "",
                database : this.config.database || ""
            });
            //连接
            connection.connect(function(err){
                //连接失败
                if (err) {
                    console.log("== db connect error == ", err);
                    self.error = err;
                    self.close();
                }
                deferred.resolve();
            });
            //错误时关闭当前连接
            connection.on("error", function(err){
                console.log("== db lost connect ==", err);
                self.close();
            })
            //连接句柄
            this.handle = connection;
            //把上一次的promise resolve
            if (this.deferred) {
                this.deferred.resolve();
            };
            this.deferred = deferred;
        },
        /**
         * 查询sql语句，返回一个promise
         * @param  {[type]} sql [description]
         * @return {[type]}     [description]
         */
        query: function(sql){
            if (APP_DEBUG) {
                console.log(sql);
            };
            var self = this;
            self.connect();
            return this.deferred.promise.then(function(){
                var deferred = when.defer();
                if (self.error) {
                    process.nextTick(function(){
                        deferred.resolve({
                            errno: 1,
                            errmsg: self.error,
                        });
                    })
                }else{
                    self.handle.query(sql, function(err, rows, fields){
                        if (err) {
                            return deferred.resolve({
                                errno: 1,
                                errmsg: err,
                                fields: fields
                            });
                        };
                        deferred.resolve({
                            errno: 0,
                            data: rows || [],
                            fields: fields
                        });
                    });
                }
                return deferred.promise;
            })
        },
        /**
         * 关闭连接
         * @return {[type]} [description]
         */
        close: function(){
            try{
                this.handle && this.handle.destroy();
            }catch(e){}
            this.handle = null;
        }
    }
})