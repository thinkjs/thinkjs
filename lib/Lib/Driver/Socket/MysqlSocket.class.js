/**
 * mysql socket
 * @return {[type]} [description]
 */

//暂时使用mysql库
var mysql = require("mysql");
var socket = module.exports = Class(function(){
    return {
        connect: null,
        init: function(config){
            this.connect = null;
            var connection = mysql.createConnection({
                host     : config.host || "localhost",
                user     : config.user || "root",
                password : config.password || "",
                database : config.database || ""
            });
            connection.connect();
            this.connect = connection;
        },
        query: function(sql){
            var deferred = when.defer();
            this.connect.query(sql, function(err, rows, fields){
                if (err) {
                    return deferred.reject(err);
                };
                deferred.resolve(rows || [], fields);
            })
            return deferred.promise;
        },
        close: function(){
            this.connect && this.connect.end();
        }
    }
})