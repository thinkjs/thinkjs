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

  }
  /**
   * add data
   * @param {Object} data    []
   * @param {Object} options []
   * @param {} replace []
   */
  add(data, options, replace){

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
  addAll(data, options, replace){

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