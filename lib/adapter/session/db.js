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
  'use strict';
  /**
   * Session的Model
   * @type {[type]}
   */
  var model = null;
  return {
    /**
     * gc类型
     * @type {String}
     */
    gcType: 'DbSession',
    /**
     * [init description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    init: function(options){
      this.super_('init', options);
      this.key = this.options.cookie;
      this.data = {};
      this.isChanged = false;
      if (!model) {
        model = D('Session');
      }
      this.model = model;
    },
    /**
     * 初始化数据
     * @return {[type]} [description]
     */
    initData: function(){
      if (!this.promise) {
        var self = this;
        this.promise = model.where({key: this.key}).find().then(function(data){
          if (isEmpty(data)) {
            return model.add({
              key: self.key,
              expire: Date.now() + self.options.timeout * 1000
            });
          }
          if (Date.now() > data.expire) {
            return;
          }
          self.data = JSON.parse(data.data || '{}');
        });
      }
      return this.promise;
    },
    /**
     * 获取
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
     * 设置
     * @param {[type]} name  [description]
     * @param {[type]} value [description]
     */
    set: function(name, value){
      var self = this;
      return this.initData().then(function(){
        self.isChanged = true;
        self.data[name] = value;
      });
    },
    /**
     * 删除
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    rm: function(name){
      var self = this;
      return this.initData().then(function(){
        self.isChanged = true;
        if (name) {
          delete self.data[name];
        }else{
          self.data = {};
        }
      })
    },
    /**
     * 将数据保存到数据库中
     * @return {[type]} [description]
     */
    flush: function(){
      var self = this;
      var data = {
        expire: Date.now() + self.options.timeout * 1000
      };
      return this.initData().then(function(){
        //数据有修改时才更新data字段
        if (self.isChanged) {
          data.data = JSON.stringify(self.data);
        }
        return model.where({key: self.key}).update(data);
      });
    },
    /**
     * [gc description]
     * @param  {[type]} now [description]
     * @return {[type]}     [description]
     */
    gc: function(now){
      return model.where({
        expire: ['<', now]
      }).delete();
    }
  };
});