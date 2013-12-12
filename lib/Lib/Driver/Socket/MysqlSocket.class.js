/**
 * mysql socket
 * @return {[type]} [description]
 */

//暂时使用mysql库
var mysql = require("mysql");
var socket = module.exports = Class(function(){
    return {
        connect: null,
        error : "",
        init: function(config){
            this.connect = null;
            this.error = "";
            var self = this;
            //创建连接
            var connection = mysql.createConnection({
                host     : config.host || "localhost",
                user     : config.user || "root",
                password : config.password || "",
                database : config.database || ""
            });
            //连接
            connection.connect(function(err){
                if (err) {
                    console.log('error when connecting to db:', err);
                };
            });
            //错误时重新连接
            connection.on("error", function(err){
                if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                    self.init(config);                         
                } else {
                    self.error = err;                                  
                    console.log("db error:" , err); 
                }
            })
            this.connect = connection;
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
            var deferred = when.defer();
            var self = this;
            if (this.error) {
                process.nextTick(function(){
                    deferred.resolve({
                        errno: 1,
                        errmsg: "db error",
                    });
                })
            }else{
                this.connect.query(sql, function(err, rows, fields){
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
        },
        /**
         * 关闭连接
         * @return {[type]} [description]
         */
        close: function(){
            this.connect && this.connect.end();
            this.connect = null;
        }
    }
})