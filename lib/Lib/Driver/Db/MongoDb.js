'use strict';

var mongoSocket = thinkRequire('MongoSocket');
var dbConnections = {};

module.exports = Class({
  /**
   * mongoSocket连接句柄
   * @type {[type]}
   */
  linkId: null,
  /**
   * 初始化
   * @param  {[type]} config         [description]
   * @param  {[type]} modelName      [description]
   * @param  {[type]} fields         [description]
   * @param  {[type]} schema_options [description]
   * @return {[type]}                [description]
   */
  init: function(config, modelName, fields, schema_options){
    this.config = config;
    this.modelName = modelName;
    this.fields = fields;
    this.schema_options = schema_options;
  },
  /**
   * 连接
   * @return {[type]} [description]
   */
  connect: function(){
    if (this.linkId) {
      return this.linkId.connect();
    }
    var key = md5(this.config);
    if (key in dbConnections) {
      this.linkId = dbConnections[key];
    }else{
      this.linkId = dbConnections[key] = mongoSocket(this.config);
    }
    return this.linkId.connect();
  },
  /**
   * 获取模型实例
   * @param  {[type]} modelName      [description]
   * @param  {[type]} fields         [description]
   * @param  {[type]} schema_options [description]
   * @return {[type]}                [description]
   */
  model: function(){
    var self = this;
    return this.connect().then(function(handle){
      var schema = self.linkId.mongoose.Schema(self.fields, self.schema_options);
      var model = handle.model(self.modelName, schema);
      return model;
    })
  },
  /**
   * 关闭mongoSocket连接
   * @return {[type]} [description]
   */
  close: function(){
    if (this.linkId) {
      this.linkId.close();
      this.linkId = null;
    }
  }
})