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
    this.pk = '_id';
    return Promise.resolve(this.pk);
  }
  /**
   * create index from this.indexes
   * @return {Promise} []
   */
  async _createIndexes(){
    let storeKey = `mongo_${this.getTableName()}_indexes`;
    let isSet = thinkCache(thinkCache.TABLE, storeKey);
    if(isSet){
      return;
    }
    let indexes = this.indexes;
    if(think.isEmpty(indexes)){
      return;
    }

    return think.await(storeKey, () => {
      let promises = [];
      for(let key in indexes){
        let value = indexes[key];
        if(think.isObject(value)){
          let unique = value.unique;
          delete value.unique;
          if(think.isEmpty(value)){
            value[key] = 1;
          }
          promises.push(this.createIndex(value, {unique: unique}));
        }else{
          value = {[key]: value};
          promises.push(this.createIndex(value));
        }
      }
      return Promise.all(promises).then(() => {
        thinkCache(thinkCache.TABLE, storeKey, 1);
      });

    });
  }
  /**
   * parse options
   * @param  {Object} options []
   * @return {Promise}         []
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
    
    await this._createIndexes();

    return this._optionsFilter(options);
  }
  /**
   * parse data
   * @param  {Object} data []
   * @return {Object}      []
   */
  parseData(data){
    return data;
  }
  /**
   * get table connection
   * @return {Promise} []
   */
  collection(table){
    table = table || this.getTableName();
    return this.db().collection(table);
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
  async delete(options){
    options = await this.parseOptions(options);
    let data = await this.db().delete(options);
    await this._afterDelete(options);
    return data.result.n || 0;
  }
  /**
   * update data
   * @return {Promise} []
   */
  async update(data, options){
    options = await this.parseOptions(options);
    let pk = await this.getPk();
    if(data[pk]){
      this.where({[pk]: data[pk]});
      delete data[pk];
    }
    let result = await this.db().update(data, options);
    await this._afterUpdate(data, options);
    return result.result.nModified || 0;
  }
  /**
   * update many data
   * @param  {Promise} dataList []
   * @return {Promise}          []
   */
  async updateMany(dataList, options){
    if (!think.isArray(dataList)) {
      return think.reject(new Error(think.locale('DATA_MUST_BE_ARRAY')));
    }
    let promises = dataList.map(data => {
      return this.update(data, options);
    });
    return Promise.all(promises).then(data => {
      return data.reduce((a, b) => a + b);
    });
  }
  /**
   * select data
   * @return {Promise} []
   */
  async select(options){
    options = await this.parseOptions(options);
    let data = await this.db().select(options);
    return this._afterSelect(data, options);
  }
  /**
   * count select
   * @param  {Object} options  []
   * @param  {Boolean} pageFlag []
   * @return {Promise}          []
   */
  async countSelect(options, pageFlag){
    let count;
    if (think.isBoolean(options)) {
      pageFlag = options;
      options = {};
    }else if(think.isNumber(options)){
      count = options;
      options = {};
    }

    options = await this.parseOptions(options);
    let pk = this.pk;
    let table = options.alias || this.getTableName();

    if(!count){
      //get count
      count = await this.options(options).count();
    }

    //get page options
    let data = {numsPerPage: this.config.nums_per_page};
    data.currentPage = parseInt((options.limit[0] / options.limit[1]) + 1);
    let totalPage = Math.ceil(count / data.numsPerPage);
    if (think.isBoolean(pageFlag) && data.currentPage > totalPage) {
      if(pageFlag){
        data.currentPage = 1;
        options.limit = [0, this.config.nums_per_page];
      }else{
        data.currentPage = totalPage;
        options.limit = [(totalPage - 1) * this.config.nums_per_page, this.config.nums_per_page];
      }
    }
    let result = think.extend({count: count, totalPages: totalPage}, data);
    result.data = await this.select(options);
    return result;
  }
  /**
   * select one row data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async find(options){
    options = await this.parseOptions(options, {limit: 1});
    let data = await this.db().select(options);
    return this._afterFind(data[0] || {}, options);
  }
  /**
   * increment field data
   * @param  {String} field []
   * @param  {Number} step  []
   * @return {Promise}       []
   */
  async increment(field, step = 1){
    let options = await this.parseOptions(options);
    return this.db().update({
      $inc: {
        [field]: step
      }
    }, options);
  }
  /**
   * decrement field data
   * @param  {String} field []
   * @param  {Number} step  []
   * @return {Promise}       []
   */
  async decrement(field, step = 1){
    let options = await this.parseOptions(options);
    return this.db().update({
      $inc: {
        [field]: 0 - step
      }
    }, options);
  }
  /**
   * get count 
   * @param  {String} field []
   * @return {Promise}       []
   */
  async count(field){
    this.field(field);
    let options = await this.parseOptions();
    return this.db().count(options);
  }
  /**
   * get sum
   * @param  {String} field []
   * @return {Promise}       []
   */
  async sum(field){
    this.field(field);
    let options = await this.parseOptions();
    return this.db().sum(options);
  }
  /**
   * aggregate
   * http://docs.mongodb.org/manual/reference/sql-aggregation-comparison/
   * @param  {} options []
   * @return {}         []
   */
  aggregate(options){
    return this.db().aggregate(this.getTableName(), options);
  }
  /**
   * map reduce
   * Examples: http://docs.mongodb.org/manual/tutorial/map-reduce-examples/
   * @param  {Function} map    []
   * @param  {Function} reduce []
   * @param  {Object} out    []
   * @return {Promise}        []
   */
  mapReduce(map, reduce, out){
    return this.collection().then(collection => {
      return collection.mapReduce(map, reduce, out);
    })
  }
  /**
   * create indexes
   * @param  {Object} indexes []
   * @return {Promise}         []
   */
  createIndex(indexes, options){
    return this.db().ensureIndex(this.getTableName(), indexes, options);
  }
  /**
   * get collection indexes
   * @return {Promise} []
   */
  getIndexes(){
    return this.collection().then(collection => {
      return collection.indexes();
    })
  }
}