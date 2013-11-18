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
        connect: function(){

        },
        query: function(){

        },
        execute: function(){

        }
    }
});