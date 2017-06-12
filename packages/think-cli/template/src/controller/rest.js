const path = require('path');
const assert = require('assert');

module.exports = class extends think.Controller {
  constructor(ctx){
    super(ctx);
    this.resource = this.getResource();
    this.id = this.getId();
    assert(think.isFunction(this.model), 'this.model must be a function');
    this.modelInstance = this.modelInstance(this.resource);
  }
  __before(){}
  /**
   * get resource
   * @return {String} [resource name]
   */
  getResource(){
    let filename = this.__filename || __filename;
    let last = filename.lastIndexOf(path.sep);
    return filename.substr(last + 1, filename.length - last - 4);
  }
  getId(){
    let id = this.get('id');
    if(id && think.isString(id) || think.isNumber(id)){
      return id;
    }
    let last = this.ctx.path.split('/').slice(-1)[0];
    if(last !== this.resource){
      return last;
    }
    return '';
  }
  async getAction(){
    let data;
    if (this.id) {
      let pk = await this.modelInstance.getPk();
      data = await this.modelInstance.where({[pk]: this.id}).find();
      return this.success(data);
    }
    data = await this.modelInstance.select();
    return this.success(data);
  }
  /**
   * put resource
   * @return {Promise} []
   */
  async postAction(){
    let pk = await this.modelInstance.getPk();
    let data = this.post();
    delete data[pk];
    if(think.isEmpty(data)){
      return this.fail('data is empty');
    }
    let insertId = await this.modelInstance.add(data);
    return this.success({id: insertId});
  }
  /**
   * delete resource
   * @return {Promise} []
   */
  async deleteAction(){
    if (!this.id) {
      return this.fail('params error');
    }
    let pk = await this.modelInstance.getPk();
    let rows = await this.modelInstance.where({[pk]: this.id}).delete();
    return this.success({affectedRows: rows});
  }
  /**
   * update resource
   * @return {Promise} []
   */
  async putAction(){
    if (!this.id) {
      return this.fail('params error');
    }
    let pk = await this.modelInstance.getPk();
    let data = this.post();
    delete data[pk];
    if (think.isEmpty(data)) {
      return this.fail('data is empty');
    }
    let rows = await this.modelInstance.where({[pk]: this.id}).update(data);
    return this.success({affectedRows: rows});
  }
  __call(){
    
  }
}