'use strict';

import Parse from './_parse_mongo.js';

let MongoSocket = think.adapter('socket', 'mongo');

/**
 * mongo db class
 */
export default class extends Parse {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    super.init();
    this.config = config;
    this.lastInsertId = 0;
    this._socket = null; //Mongo socket instance
  }
  /**
   * connect mongo socket
   * @return {Promise} []
   */
  socket(){
    if(this._socket){
      return this._socket;
    }
    this._socket = MongoSocket.getInstance(this.config, thinkCache.DB);
    return this._socket;
  }
  /**
   * get connection
   * @return {Promise} []
   */
  collection(table){
    let instance = this.socket();
    return instance.getConnection().then(db => db.collection(table));
  }
  /**
   * get last insert id
   * @return {String} []
   */
  getLastInsertId(){
    return this.lastInsertId;
  }
  /**
   * add data
   * @param {Objec} data    []
   * @param {Object} options []
   */
  async add(data, options){
    let collection = await this.collection(options.table);
    let result = await collection.insert(data);
    this.lastInsertId = data._id.toString();
    return result;
  }
  /**
   * add multi data
   * @param {Array} dataList []
   * @param {Object} options [ {ordered: true}. If false, perform an unordered insert, and if an error occurs with one of documents, continue processing the remaining documents in the array.}]
   * @param {Object} options  []
   */
  async addMany(dataList, options){
    let collection = await this.collection(options.table);
    let result = await collection.insert(dataList, options);
    let insertedIds = dataList.map(item => {
      return item._id.toString();
    });
    this.lastInsertId = insertedIds;
    return result;
  }
  /**
   * set collection limit
   * @param  {Object} collection []
   * @param  {String} limit      []
   * @return {Object}            []
   */
  limit(collection, limit){
    limit = this.parseLimit(limit);
    if(limit[0]){
      collection.skip(limit[0]);
    }
    if(limit[1]){
      collection.limit(limit[1]);
    }
    return collection;
  }
  /**
   * parse group
   * @param  {String} group []
   * @return {Object}       []
   */
  group(group){
    group = this.parseGroup(group);
    let length = group.length;
    if(length === 0){
      return {_id: null};
    }else if(length === 1){
      return {_id: `$${group[0]}`};
    }else {
      let result = {};
      group.forEach(item => {
        result[item] = `$${item}`;
      });
      return result;
    }
  }
  /**
   * select data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async select(options){
    let collection = await this.collection(options.table);
    let where = this.parseWhere(options.where);

    //get distinct field data
    let distinct = this.parseDistinct(options.distinct);
    if(distinct){
      return collection.distinct(distinct, where);
    }

    collection = collection.find(where, this.parseField(options.field));
    collection = this.limit(collection, options.limit);
    collection = collection.sort(this.parseOrder(options.order));
    return collection.toArray();
  }
  /**
   * update data
   * @param  {Object} data    []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async update(data, options){
    let collection = await this.collection(options.table);
    let where = this.parseWhere(options.where);

    let limit = this.parseLimit(options.limit);
    // updates multiple documents that meet the query criteria. 
    // default only updates one document
    if(limit[1] !== 1){
      options.multi = true;
    }

    // If set to true, creates a new document when no document matches the query criteria. 
    // The default value is false, which does not insert a new document when no match is found.
    if(!options.upsert){
      options.upsert = false;
    }

    //add $set for data
    let flag = true;
    for(let key in data){
      if(key[0] !== '$'){
        flag = false;
        break;
      }
    }
    if(!flag){
      data = {$set: data};
    }

    // update operator
    // http://docs.mongodb.org/manual/reference/operator/update/#id1
    return collection.update(where, data, options);
  }
  /**
   * delete data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async delete(options){
    let collection = await this.collection(options.table);
    let where = this.parseWhere(options.where);
    let limit = this.parseLimit(options.limit);

    //delete one row
    let removeOpt = {};
    if(limit[1] === 1){
      removeOpt.justOne = true;
    }
    
    return collection.remove(where, removeOpt);
  }
  /**
   * get count
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async count(options){
    let collection = await this.collection(options.table);
    let where = this.parseWhere(options.where);

    let group = this.group(options.group);
    group.total = {$sum: 1};

    let order = this.parseOrder(options.order);

    let aggregate = [];
    if(!think.isEmpty(where)){
      aggregate.push({$match: where});
    }
    aggregate.push({$group: group});
    if(!think.isEmpty(order)){
      aggregate.push({$sort: order});
    }
    //make aggregate method to be a promise
    let fn = think.promisify(collection.aggregate, collection);
    return fn(aggregate).then(data => {
      return data[0] && data[0].total || 0;
    });
  }
  /**
   * get sum
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async sum(options){
    let collection = await this.collection(options.table);
    let where = this.parseWhere(options.where);

    let group = this.group(options.group);
    group.total = {$sum: `$${options.field}`};

    let order = this.parseOrder(options.order);

    let aggregate = [];
    if(!think.isEmpty(where)){
      aggregate.push({$match: where});
    }
    aggregate.push({$group: group});
    if(!think.isEmpty(order)){
      aggregate.push({$sort: order});
    }
    //make aggregate method to be a promise
    let fn = think.promisify(collection.aggregate, collection);
    return fn(aggregate).then(data => {
      return data[0] && data[0].total || 0;
    });
  }
  /**
   * create collection indexes
   * @param  {String} table   []
   * @param  {Object} indexes []
   * @return {Promise}         []
   */
  ensureIndex(table, indexes, options = {}){
    if(options === true){
      options = {unique: true};
    }
    if(think.isString(indexes)){
      indexes = indexes.split(/\s*,\s*/);
    }
    if(think.isArray(indexes)){
      let result = {};
      indexes.forEach(item => {
        result[item] = 1;
      });
      indexes = result;
    }
    return this.collection(table).then(collection => {
      return collection.ensureIndex(indexes, options);
    });
  }
  /**
   * aggregate
   * @param  {String} table   []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  aggregate(table, options){
    return this.collection(table).then(collection => {
      let fn = think.promisify(collection.aggregate, collection);
      return fn(options);
    });
  }
  /**
   * close socket
   * @return {} []
   */
  close(){
    if(this._socket){
      this._socket.close();
      this._socket = null;
    }
  }
}