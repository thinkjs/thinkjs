'use strict';

import Base from './_base.js';

let MongoDb = think.adapter('db', 'mongo');

/**
 * mongodb model
 */
export default class extends Base {
  /**
   * get primary key
   * @return {Promise} []
   */
  getPk(){
    return '_id';
  }
  /**
   * parse options
   * @param  {Object} options []
   * @return promise         []
   */
  async parseOptions(oriOpts, extraOptions){
    let options = think.extend({}, this._options);
    if (think.isObject(oriOpts)) {
      options = think.extend(options, oriOpts, extraOptions);
    }
    //clear options
    this._options = {};
    //get table name
    options.table = options.table || this.getTableName();

    options.tablePrefix = this.tablePrefix;
    options.model = this.getModelName();

    if(!think.isObject(oriOpts)){
      options = think.extend(options, oriOpts, extraOptions);
    }
    return this._optionsFilter(options);
  }
  parseData(data){
    return data;
  }
  /**
   * add data
   * @param {Object} data    []
   * @param {Object} options []
   */
  async add(data, options){
    //copy data
    data = think.extend({}, this._data, data);
    //clear data
    this._data = {};
    if (think.isEmpty(data)) {
      let msg = new Error(think.locale('DATA_EMPTY'));
      return think.reject(msg);
    }
    options = await this.parseOptions(options);
    data = await this._beforeAdd(data, options);
    data = this.parseData(data);
    await this.db().add(data, options);
    await this._afterAdd(data, options);
    return this.db().getLastInsertId();
  }
  /**
   * if data not exist, then add. 
   * @param  {Object} data       []
   * @param  {Object} where      []
   * @param  {} returnType []
   * @return {}            []
   */
  thenAdd(data, where, returnType){

  }
  /**
   * add multi data
   * @param {Object} data    []
   * @param {} options []
   * @param {} replace []
   */
  async addMany(data, options){
    if (!think.isArray(data) || !think.isObject(data[0])) {
      let err = new Error(think.locale('DATA_MUST_BE_ARRAY'));
      return think.reject(err);
    }
    options = await this.parseOptions(options);
    data = await this._beforeAdd(data, options);
    await this.db().addMany(data, options);
    await this._afterAdd(data, options);
    return this.db().getLastInsertId();
  }
  /**
   * delete data
   * @return {} []
   */
  delete(options){

  }
  /**
   * update data
   * @return {[type]} [description]
   */
  update(data, options){

  }
  /**
   * update all data
   * @param  {[type]} dataList [description]
   * @return {[type]}          [description]
   */
  updateAll(dataList){
    
  }
}