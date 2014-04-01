/**
 * DbSession
 * 需要在数据库中建立对应的数据表
 *
 *  DROP TABLE IF EXISTS `think_session`;
    CREATE TABLE `think_session` (
      `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
      `key` varchar(255) NOT NULL DEFAULT '',
      `data` text,
      `expire` bigint(11) NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `cookie` (`key`),
      KEY `expire` (`expire`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
 *
 * 
 * @return {[type]} [description]
 */
module.exports = Cache(function(){
    "use strict";
    return {
        /**
         * gc类型
         * @type {String}
         */
        gcType: "DbSession",
        /**
         * [init description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        init: function(options){
            this.super_("init", options);
            this.key = this.options.cookie;
            this.data = {};
            this.initData();
        },
        /**
         * 初始化数据
         * @return {[type]} [description]
         */
        initData: function(){
            var model = D('Session');
            var where = {key: this.key};
            var self = this;
            this.promise = model.where(where).find().then(function(data){
                self.data = {};
                if (isEmpty(data)) {
                    return model.add({
                        key: self.key,
                        expire: Date.now() + self.options.timeout * 1000
                    });
                }
                if (Date.now() > data.expire) {
                    return;
                }
                self.data = JSON.parse(data.data || "{}");
            });
        },
        /**
         * 获取
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            var self = this;
            return this.promise.then(function(){
                return self.data[name];
            });
        },
        /**
         * 设置
         * @param {[type]} name  [description]
         * @param {[type]} value [description]
         */
        set: function(name, value){
            var self = this;
            return this.promise.then(function(){
                self.data[name] = value;
            });
        },
        /**
         * 删除
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        rm: function(name){
            if (this.data) {
                delete this.data[name];
            }
        },
        /**
         * 将数据保存到数据库中
         * @return {[type]} [description]
         */
        flush: function(){
            var model = D("Session");
            var self = this;
            var data = {
                expire: Date.now() + self.options.timeout * 1000,
                data: JSON.stringify(self.data)
            };
            return this.promise.then(function(){
                return model.where({key: self.key}).update(data);
            });
        },
        /**
         * [gc description]
         * @param  {[type]} now [description]
         * @return {[type]}     [description]
         */
        gc: function(now){
            D("Session").where({
                expire: ["<", now]
            }).delete();
        }
    };
});