/**
 * 文件Session
 * @return {[type]} [description]
 */

var redis = thinkRequire('RedisSocket');
module.exports = Cache(function(){
	'use strict';
	var instance = null;
	return {
		namePrefix: C('session_key_prefix'),
		/**
		 * 差异化的init
		 * @return {[type]} [description]
		 */
		init: function(options){
			options = options || {};
			this.super_('init', options);
			if (!instance) {
				instance = redis();
			}
			this.handle = instance;
			this.key = this.namePrefix + options.cookie;
			this.data = {};
		},
		/**
		 * 初始化数据
		 * @return {[type]} [description]
		 */
		initData: function(){
			if (!this.promise) {
				var self = this;
				this.promise = this.handle.get(this.key).then(function(value){
					self.data = value ? JSON.parse(value) : {};
					return self.data;
				});
			}
			return this.promise;
		},
		/**
		 * 获取数据
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		get: function(name){
			var self = this;
			return this.initData().then(function(){
				return self.data[name];
			});
		},
		/**
		 * 设置数据
		 * @param {[type]} name    [description]
		 * @param {[type]} value   [description]
		 * @param {[type]} timeout [description]
		 */
		set: function(name, value, timeout){
			var self = this;
			return this.initData().then(function(){
				self.data[name] = value;
				if (timeout) {
					self.options.timeout = timeout;
				}
			});
		},
		/**
		 * 删除数据
		 * @return {[type]} [description]
		 */
		rm: function(name){
			var self = this;
			return this.initData().then(function(){
				if (name) {
					delete self.data[name];
				}else{
					self.data = null;
				}
			})
		},
		/**
		 * 将数据写入到文件中
		 * @return {[type]} [description]
		 */
		flush: function(){
			var self = this;
			return this.initData().then(function(){
				if (self.data == null) {
					return self.handle.delete(self.key);
				} else {
					return self.handle.set(self.key, JSON.stringify(self.data), self.options.timeout);
				}
			})
		}
	};
});