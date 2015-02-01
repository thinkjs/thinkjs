'use strict';
/**
 * REST Controller
 * @return {[type]} [description]
 */
module.exports = think.controller({
  init: function(http){
    this.super('init', http);
    //资源名
    this.resource = this.get('resource');
    //资源id
    this.id = this.get('id') | 0;
    //实例化对应的模型
    this.model = D(this.resource);
  },
  /**
   * 获取
   * @return {[type]} [description]
   */
  getAction: function(){
    var self = this;
    if (this.id) {
      return getPromise(this.model.getPk()).then(function(pk){
        return self.model.where(getObject(pk, self.id)).find();
      }).then(function(data){
        return self.success(data);
      }).catch(function(err){
        return self.error(err.message);
      })
    }
    return this.model.select().then(function(data){
      return self.success(data);
    }).catch(function(err){
      return self.error(err.message);
    });
  },
  /**
   * 新建
   * @return {[type]} [description]
   */
  postAction: function(){
    var self = this;
    return getPromise(this.model.getPk()).then(function(pk){
      var data = self.post();
      delete data[pk];
      if (isEmpty(data)) {
        return self.error('data is empty');
      }
      return self.model.add(data);
    }).then(function(insertId){
      return self.success({id: insertId});
    }).catch(function(err){
      var msg = isError(err) ? err.message : err;
      return self.error(msg);
    });
  },
  /**
   * 删除
   * @return {[type]} [description]
   */
  deleteAction: function(){
    if (!this.id) {
      return this.error('params error');
    }
    var self = this;
    return getPromise(this.model.getPk()).then(function(pk){
      return self.model.where(getObject(pk, self.id)).delete();
    }).then(function(affectedRows){
      return self.success({affectedRows: affectedRows});
    }).catch(function(err){
      return self.error(err.message);
    });
  },
  /**
   * 更新
   * @return {[type]} [description]
   */
  putAction: function(){
    if (!this.id) {
      return this.error('params error');
    }
    var self = this;
    return getPromise(this.model.getPk()).then(function(pk){
      var data = self.post();
      delete data[pk];
      if (isEmpty(data)) {
        return self.error('data is empty');
      }
      return self.model.where(getObject(pk, self.id)).update(data);
    }).then(function(affectedRows){
      return self.success({affectedRows: affectedRows});
    }).catch(function(err){
      var msg = isError(err) ? err.message : err;
      return self.error(msg);
    });
  },
  __call: function(action){
    return this.error('action `' + action + '` is not allowed');
  }
})