const Query = require('./query.js');
const path = require('path');
const helper = require('think-helper');

const MODELS = Symbol('think-models');
const DB = Symbol('think-model-db');

module.exports = class Mongo {
  constructor(modelName, config) {
    if (helper.isObject(modelName)) {
      [modelName, config] = [config, {}];
    }
    this.modelName = modelName;
    this.config = config;
    this.options = {};
  }
  /**
   * get all store models
   */
  get models() {
    return this[MODELS] || {};
  }
  /**
   * set models
   */
  set models(value) {
    this[MODELS] = value;
  }
  /**
   * get primary key
   */
  get pk() {
    return this._pk || '_id';
  }
  /**
   * get table prefix
   */
  get tablePrefix() {
    return this.config.prefix || '';
  }
  /**
   * get table name, with table prefix
   */
  get tableName() {
    return this.tablePrefix + this.modelName;
  }
  /**
   * get model instance
   * @param {String} name 
   */
  model(name) {
    const ModelClass = this.models[name];
    const modelName = path.basename(name);
    let instance;
    if (ModelClass) {
      instance = new ModelClass(modelName, this.config);
    } else {
      instance = new Mongo(modelName, this.config);
    }
    instance.models = this.models;
    return instance;
  }
  /**
   * get or set adapter
   * @param {Object} connection 
   */
  db(db) {
    if (db) {
      this[DB] = db;
      return this;
    }
    if (this[DB]) return this[DB];
    const instance = new Query(this.config);
    this[DB] = instance;
    return instance;
  }
  /**
   * set limit options
   * @param  {Number} offset []
   * @param  {Number} length []
   * @return {}        []
   */
  limit(offset, length) {
    if (offset === undefined) {
      return this;
    }
    if (helper.isArray(offset)) {
      length = offset[1] || length;
      offset = offset[0];
    }
    offset = Math.max(parseInt(offset) || 0, 0);
    if (length) {
      length = Math.max(parseInt(length) || 0, 0);
    }
    this.options.limit = [offset, length];
    return this;
  }
  /**
   * set page options
   * @param  {Number} page     []
   * @param  {} listRows []
   * @return {}          []
   */
  page(page, listRows = this.config.pagesize) {
    if (helper.isArray(page)) {
      listRows = page[1] || listRows;
      page = page[0];
    }
    page = Math.max(parseInt(page) || 1, 1);
    listRows = Math.max(parseInt(listRows) || 10, 1);
    this.options.limit = [listRows * (page - 1), listRows];
    return this;
  }
  /**
   * set where options
   * @return {} []
   */
  where(where) {
    if (!where) return this;
    if (helper.isString(where)) {
      where = {_string: where};
    }
    const options = this.options;
    if (options.where && helper.isString(options.where)) {
      options.where = {_string: options.where};
    }
    options.where = helper.extend({}, options.where, where);
    return this;
  }
  /**
   * set field options
   * @param  {String} field   []
   * @return {}         []
   */
  field(field) {
    if (!field) return this;
    this.options.field = field;
    return this;
  }
  /**
   * set table name
   * @param  {String} table []
   * @return {}       []
   */
  table(table, hasPrefix = false) {
    if (!table) return this;
    table = table.trim();
    if (!hasPrefix) {
      table = this.tablePrefix + table;
    }
    this.options.table = table;
    return this;
  }
  /**
   * set order options
   * @param  {String} value []
   * @return {}       []
   */
  order(value) {
    this.options.order = value;
    return this;
  }
  /**
   * set group options
   * @param  {String} value []
   * @return {}       []
   */
  group(value) {
    this.options.group = value;
    return this;
  }
  /**
   * set distinct options
   * @param  {String} data []
   * @return {}      []
   */
  distinct(data) {
    this.options.distinct = data;
    if (helper.isString(data)) {
      this.options.field = data;
    }
    return this;
  }
  /**
   * before add
   * @param  {Object} data []
   * @return {}      []
   */
  beforeAdd(data) {
    return data;
  }
  /**
   * after add
   * @param  {} data []
   * @return {}      []
   */
  afterAdd(data) {
    return data;
  }
  /**
   * before delete
   */
  beforeDelete(options) {
    return options;
  }
  /**
   * after delete
   * @param  {Mixed} data []
   * @return {}      []
   */
  afterDelete(data) {
    return data;
  }
  /**
   * before update
   * @param  {Mixed} data []
   * @return {}      []
   */
  beforeUpdate(data) {
    return data;
  }
  /**
   * after update
   * @param  {} data    []
   * @return {}         []
   */
  afterUpdate(data) {
    return data;
  }
  /**
   * before find
   */
  beforeFind(options) {
    return options;
  }
  /**
   * after find
   * @return {} []
   */
  afterFind(data) {
    return data;
  }
  /**
   * before select
   */
  beforeSelect(options) {
    return options;
  }
  /**
   * after select
   * @param  {Mixed} result []
   * @return {}        []
   */
  afterSelect(data) {
    return data;
  }
  /**
   * parse options
   * @param {Object} options 
   */
  parseOptions(options) {
    options = Object.assign({}, this.options, options);
    this.options = {};
    if (!options.table) {
      options.tabel = this.tableName;
    }
    options.tablePrefix = this.tablePrefix;
    options.model = this.modelName;
    return options;
  }
  /**
   * parse data
   * @param  {Object} data []
   * @return {Object}      []
   */
  parseData(data) {
    return data;
  }
  /**
   * add data
   * @param {Object} data    []
   * @param {Object} options []
   */
  async add(data, options) {
    // copy data
    data = Object.assign({}, data);
    if (helper.isEmpty(data)) {
      return Promise.reject(new Error('add data is empty'));
    }
    options = this.parseOptions(options);
    data = await this.beforeAdd(data, options);
    data = this.parseData(data);
    const insertId = await this.db().add(data, options);
    const copyData = Object.assign({}, data, {[this.pk]: insertId});
    await this.afterAdd(copyData, options);
    return insertId;
  }
  /**
   * then add
   * @param  {Object} data       []
   * @param  {Object} where      []
   * @return {}            []
   */
  async thenAdd(data, where) {
    const findData = await this.where(where).find();
    if (!helper.isEmpty(findData)) {
      return {[this.pk]: findData[this.pk], type: 'exist'};
    }
    const insertId = await this.add(data);
    return {[this.pk]: insertId, type: 'add'};
  }
  /**
   * update data when exist, otherwise add data
   * @return {id}
   */
  async thenUpdate(data, where) {
    const findData = await this.where(where).find();
    if (helper.isEmpty(findData)) {
      return this.add(data);
    }
    await this.where(where).update(data);
    return findData[this.pk];
  }
  /**
   * add multi data
   * @param {Object} data    []
   * @param {} options []
   * @param {} replace []
   */
  async addMany(data, options) {
    if (!helper.isArray(data) || !helper.isObject(data[0])) {
      return Promise.reject(new Error('addMany must be an array'));
    }
    options = this.parseOptions(options);
    data = await this.beforeAdd(data, options);
    const insertIds = await this.db().addMany(data, options);
    await this.afterAdd(data, options);
    return insertIds;
  }
  /**
   * delete data
   * @return {} []
   */
  async delete(options) {
    options = this.parseOptions(options);
    options = await this.beforeDelete(options);
    const data = await this.db().delete(options);
    await this.afterDelete(options);
    return data.result.n || 0;
  }
  /**
   * update data
   * @return {Promise} []
   */
  async update(data, options, ignoreDefault) {
    if (helper.isBoolean(options)) {
      [ignoreDefault, options] = [options, {}];
    }
    const pk = this.pk;
    if (data[pk]) {
      this.where({[pk]: data[pk]});
      delete data[pk];
    }
    options = this.parseOptions(options);
    if (ignoreDefault !== true) {
      data = await this.beforeUpdate(data, options);
    }
    const result = await this.db().update(data, options);
    await this.afterUpdate(data, options);
    return result.result.nModified || 0;
  }
  /**
   * update many data
   * @param  {Promise} dataList []
   * @return {Promise}          []
   */
  async updateMany(dataList, options) {
    if (!helper.isArray(dataList)) {
      return Promise.reject(new Error('dataList must be an array'));
    }
    const promises = dataList.map(data => {
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
  async select(options) {
    options = this.parseOptions(options);
    options = await this.beforeSelect(options);
    const data = await this.db().select(options);
    return this.afterSelect(data, options);
  }
  /**
   * count select
   * @param  {Object} options  []
   * @param  {Boolean} pageFlag []
   * @return {Promise}          []
   */
  async countSelect(options, pageFlag) {
    let count;
    if (helper.isBoolean(options)) {
      [pageFlag, options] = [options, {}];
    } else if (helper.isNumber(options)) {
      [count, options] = [options, {}];
    }

    options = this.parseOptions(options);
    if (!count) {
      // get count
      this.options = options;
      count = await this.count();
    }

    options.limit = options.limit || [0, this.config.pagesize];

    const pagesize = options.limit[1];
    // get page options
    const data = {pagesize: pagesize};
    data.currentPage = parseInt((options.limit[0] / options.limit[1]) + 1);
    const totalPage = Math.ceil(count / data.numsPerPage);
    if (helper.isBoolean(pageFlag) && data.currentPage > totalPage) {
      if (pageFlag) {
        data.currentPage = 1;
        options.limit = [0, pagesize];
      } else {
        data.currentPage = totalPage;
        options.limit = [(totalPage - 1) * pagesize, pagesize];
      }
    }
    const result = Object.assign({count: count, totalPages: totalPage}, data);
    result.data = count ? await this.select(options) : [];
    return result;
  }
  /**
   * select one row data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async find(options) {
    this.limit(1);
    options = this.parseOptions(options);
    options = await this.beforeFind(options);
    const data = await this.db().select(options);
    return this.afterFind(data[0] || {}, options);
  }
  /**
   * increment field data
   * @param  {String} field []
   * @param  {Number} step  []
   * @return {Promise}       []
   */
  increment(field, step = 1) {
    const options = this.parseOptions();
    return this.db().update({
      $inc: {
        [field]: step
      }
    }, options).then(data => {
      return data.result.n;
    });
  }
  /**
   * decrement field data
   * @param  {String} field []
   * @param  {Number} step  []
   * @return {Promise}       []
   */
  decrement(field, step = 1) {
    const options = this.parseOptions();
    return this.db().update({
      $inc: {
        [field]: 0 - step
      }
    }, options).then(data => {
      return data.result.n;
    });
  }
  /**
   * get count 
   * @param  {String} field []
   * @return {Promise}       []
   */
  count(field) {
    this.field(field);
    const options = this.parseOptions();
    return this.db().count(options);
  }
  /**
   * get sum
   * @param  {String} field []
   * @return {Promise}       []
   */
  sum(field) {
    this.field(field);
    const options = this.parseOptions();
    return this.db().sum(options);
  }
  /**
   * aggregate
   * http://docs.mongodb.org/manual/reference/sql-aggregation-comparison/
   * @param  {} options []
   * @return {}         []
   */
  aggregate(options) {
    return this.db().aggregate(this.tableName, options);
  }
  /**
   * map reduce
   * Examples: http://docs.mongodb.org/manual/tutorial/map-reduce-examples/
   * @param  {Function} map    []
   * @param  {Function} reduce []
   * @param  {Object} out    []
   * @return {Promise}        []
   */
  mapReduce(map, reduce, out) {
    const table = this.tableName;
    return this.db().socket.autoRelease(connection => {
      const collection = connection.collection(table);
      return collection.mapReduce(map, reduce, out);
    });
  }
  /**
   * create indexes
   * @param  {Object} indexes []
   * @return {Promise}         []
   */
  createIndex(indexes, options) {
    return this.db().ensureIndex(this.tableName, indexes, options);
  }
  /**
   * get collection indexes
   * @return {Promise} []
   */
  getIndexes() {
    const table = this.tableName;
    return this.db().socket.autoRelease(connection => {
      const collection = connection.collection(table);
      return collection.indexes();
    });
  }
};
