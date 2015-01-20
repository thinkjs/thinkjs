'use strict';

var mongoDb = thinkRequire('mongoDb');
/**
 * mongodb model
 * @type {[type]}
 */
module.exports = Class({
  /**
   * 模型名
   * @type {String}
   */
  name: '',
  /**
   * 连接mongodb句柄
   * @type {[type]}
   */
  db: null,
  /**
   * 字段列表
   * @type {Object}
   */
  fields: {},
  /**
   * 选项列表
   * @type {Object}
   */
  schema_options: {},
  /**
   * 操作选项
   * @type {Object}
   */
  _options: {},
  /**
   * 初始化
   * @return {[type]} [description]
   */
  init: function(config){
    this.config = extend({
      db_host: C('db_host'),
      db_port: C('db_port'),
      db_name: C('db_name')
    }, config || {});
  },
  /**
   * 初始化db
   * @return {[type]} [description]
   */
  initDb: function(){
    if (this.db) {
      return this.db;
    }
    var modelName = this.getModelName();
    this.db = mongoDb(this.config, modelName, this.fields, this.schema_options);
    return this.db;
  },
  /**
   * 获取model
   * @return {[type]} [description]
   */
  model: function(){
    return this.initDb().model();
  },
  /**
   * 获取模型名
   * @access public
   * @return string
   */
  getModelName: function(){
    if (this.name) {
      return this.name;
    }
    var filename = this.__filename || __filename;
    var last = filename.lastIndexOf('/');
    this.name = filename.substr(last + 1, filename.length - last - 9);
    return this.name;
  },
  /**
   * 查询条件
   * @param  {[type]} where [description]
   * @return {[type]}       [description]
   */
  where: function(where){
    if (!where) {
      return this;
    }
    this._options.where = extend(this._options.where || {}, where);
    return this;
  },
  /**
   * 字段
   * @param  {[type]} field   [description]
   * @param  {[type]} reverse [description]
   * @return {[type]}         [description]
   */
  field: function(field){
    if (!field) {
      return this;
    }
    if (isArray(field)) {
      field = field.join(' ');
    }
    this._options.field = field;
    return this;
  },
  /**
   * 指定查询数量
   * @param  {[type]} offset [description]
   * @param  {[type]} length [description]
   * @return {[type]}        [description]
   */
  limit: function(offset, length){
    if (offset === undefined) {
      return this;
    }
    this._options.limit = length === undefined ? offset : offset + ',' + length;
    return this;
  },
  /**
   * 排序方式
   * @param  {[type]} order [description]
   * @return {[type]}       [description]
   */
  order: function(order){
    if (order === undefined) {
      return this;
    }
    this._options.order = order;
  },
  /**
   * 添加数据
   * @param {[type]} data [description]
   */
  add: function(data){
    return this.model().then(function(model){
      var instance = new model(data);
      var deferred = getDefer();
      instance.save(function(err){
        if (err) {
          deferred.reject(err);
        }else{
          deferred.resolve();
        }
      })
      return deferred.promise;
    })
  },
  /**
   * 添加多个数据
   * @param {[type]} data [description]
   */
  addAll: function(data){
    var self = this;
    var promises = data.map(function(item){
      return self.add(item);
    })
    return Promise.all(promises);
  },
  /**
   * 删除数据
   * @return {[type]} [description]
   */
  delete: function(){
    var self = this;
    return this.model().then(function(model){
      var where = self.parseWhere();
      var deferred = getDefer();
      model.remove(where, function(err, data){
        if (err) {
          deferred.reject(err);
        }else{
          deferred.resolve(data);
        }
      })
      return deferred.promise;
    })
  },
  /**
   * 更新
   * @param  {[type]} data      [description]
   * @param  {[type]} ignoreRet [description]
   * @return {[type]}           [description]
   */
  update: function(data, ignoreRet){
    var self = this;
    return this.model().then(function(model){
      var method = ignoreRet ? 'update' : 'findByIdAndUpdate';
      var deferred = getDefer();
      model[method](self._options.where, data, function(err, data){
        if (err) {
          deferred.reject(err);
        }else{
          deferred.resolve(data);
        }
      })
      return deferred.promise;
    })
  },
  /**
   * 查询数据
   * @return {[type]} [description]
   */
  select: function(){
    var self = this;
    return this.model().then(function(model){
      var where = self.parseWhere();
      model = model.where(where).limit(self._options.limit).sort(self._options.order).select(self._options.field);
      var deferred = getDefer();
      model.exec(function(err, data){
        if (err) {
          deferred.reject(err);
        }else{
          deferred.resolve(data);
        }
      })
      return deferred.promise;
    })
  },
  /**
   * 查询单条数据
   * @return {[type]} [description]
   */
  find: function(){
    var self = this;
    return this.model().then(function(model){
      var deferred = getDefer();
      model.findOne(self._options.where, self._options.field, function(err, data){
        if (err) {
          deferred.reject(err);
        }else{
          deferred.resolve(data);
        }
      })
      return deferred.promise;
    })
  },
  /**
   * 解析where
   * @param  {[type]} model [description]
   * @return {[type]}       [description]
   */
  parseWhere: function(){
    return this._options.where;
  }
})