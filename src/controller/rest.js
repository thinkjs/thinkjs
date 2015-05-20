'use strict';
/**
 * REST Base Controller
 * @return {} []
 */
module.exports = class extends think.controller.base {
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init(http){
    super.init(http);
    this.resource = this.get('resource');
    this.id = this.get('id') | 0;
    this.model = this.model(this.resource);
  }
  /**
   * get resource
   * @return {Promise} []
   */
  async getAction(){
    let data;
    if (this.id) {
      let pk = await this.model.getPk();
      data = await this.model.where({
        [pk]: this.id
      }).find();
      return this.success(data);
    }
    data = await this.model.select();
    return this.success(data);
  }
  /**
   * put resource
   * @return {Promise} []
   */
  async postAction(){
    let pk = await this.model.getPk();
    let data = this.post();
    delete data[pk];
    if(think.isEmpty(data)){
      return this.fail('data is empty');
    }
    let insertId = await this.model.add(data);
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
    let pk = await this.model.getPk();
    let rows = await this.model.where({
      [pk]: this.id
    }).delete();
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
    let pk = await this.model.getPk();
    let data = this.post();
    delete data[pk];
    if (think.isEmpty(data)) {
      return this.fail('data is empty');
    }
    let rows = await this.model.where({
      [pk]: this.id
    }).update(data);
    return this.success({affectedRows: rows});
  }
  /**
   * call
   * @return {Promise} []
   */
  __call(){
    return this.fail('action `' + action + '` is not allowed');
  }
}