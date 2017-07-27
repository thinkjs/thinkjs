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
  }
};
