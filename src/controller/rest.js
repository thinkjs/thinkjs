'use strict';
/**
 * REST Base Controller
 * @return {} []
 */
export default class extends think.controller.base {
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init(http){
    super.init(http);
    this.__isRest = true;
    this.resource = this.getResource();
    this.id = this.getId();
    this.modelInstance = this.model(this.resource);
  }
  /**
   * get resource
   * @return {String} [resource name]
   */
  getResource(){
    let last = __filename.lastIndexOf('/');
    return __filename.substr(last + 1, __filename.length - last - 3);
  }
  /**
   * get resource id
   * @return {String} []
   */
  getId(){
    let last = this.http.pathname.split('/').slice(-1)[0];
    if(last !== this.resource){
      return last;
    }
    return '';
  }
  /**
   * get resource
   * @return {Promise} []
   */
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
  /**
   * call
   * @return {Promise} []
   */
  __call(){
    return this.fail(`action is not allowed`);
  }
}