const helper = require('think-helper');
const path = require('path');
const assert = require('assert');
const Relation = require('./relation/relation.js');

const MODELS = Symbol('think-models');
const CONNECTION = Symbol('think-model-connection');

module.exports = class Model {
  /**
   * constructor
   * @param  {} name   []
   * @param  {} config []
   * @return {}        []
   */
  constructor(modelName = '', config = {}) {
    if (helper.isObject(modelName)) {
      [modelName, config] = [config, {}];
    }
    assert(helper.isFunction(config.handle), 'config.handle must be a function');
    this.config = config;
    this.modelName = modelName;
    if (this.config.prefix) {
      this.tablePrefix = this.config.prefix;
    }
    this.options = {};
    this.data = {};
  }
  /**
   * get or set connection
   * @param {Object} connection 
   */
  connection(connection) {
    if (connection) {
      this[CONNECTION] = connection;
      return this;
    }
    if (this[CONNECTION]) return this[CONNECTION];
    const Handle = this.config.handle;
    const instance = new Handle(this.config);
    this[CONNECTION] = instance;
    return instance;
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
   * get primary key
   */
  get pk() {
    return this._pk || 'id';
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
      instance = new Model(modelName, this.config);
    }
    instance.models = this.models;
    return instance;
  }
  /**
   * set cache options
   * @param  {String} key     []
   * @param  {Number} timeout []
   * @return {}         []
   */
  cache(key, config) {
    if (key === undefined) {
      return this;
    }
    if (!helper.isString(key)) {
      [key, config] = ['', key];
    }
    if (helper.isNumber(config)) {
      config = {timeout: config};
    }
    const options = helper.parseAdapterConfig(this.config.cache, config);
    if (!options.key) { options.key = key }
    this.options.cache = options;
    return this;
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
   * @param  {Boolean} reverse []
   * @return {}         []
   */
  field(field, reverse = false) {
    if (!field) return this;
    this.options.field = field;
    this.options.fieldReverse = reverse;
    return this;
  }
  /**
   * set field reverse
   * @param  {String} field [field list]
   * @return {Object}       []
   */
  fieldReverse(field) {
    return this.field(field, true);
  }
  /**
   * set table name
   * @param  {String} table []
   * @return {}       []
   */
  table(table, hasPrefix = false) {
    if (!table) return this;
    table = table.trim();
    // table is sql, `SELECT * FROM`
    if (table.indexOf(' ') > -1) {
      hasPrefix = true;
    } else if (!hasPrefix) {
      table = this.tablePrefix + table;
    }
    this.options.table = table;
    return this;
  }
  /**
   * union options
   * @param  {} union []
   * @param  {} all   []
   * @return {}       []
   */
  union(union, all = false) {
    if (!union) return this;
    if (!this.options.union) {
      this.options.union = [];
    }
    this.options.union.push({
      union: union,
      all: all
    });
    return this;
  }
  /**
   * join
   * @param  {[type]} join [description]
   * @return {[type]}      [description]
   */
  join(join) {
    if (!join) return this;
    if (!this.options.join) {
      this.options.join = [];
    }
    if (helper.isArray(join)) {
      this.options.join = this.options.join.concat(join);
    } else {
      this.options.join.push(join);
    }
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
   * set table alias
   * @param  {String} value []
   * @return {}       []
   */
  alias(value) {
    this.options.alias = value;
    return this;
  }
  /**
   * set having options
   * @param  {String} value []
   * @return {}       []
   */
  having(value) {
    this.options.having = value;
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
   * set lock options
   * @param  {String} value []
   * @return {}       []
   */
  lock(value) {
    this.options.lock = value;
    return this;
  }
  /**
   * set auto options
   * @param  {String} value []
   * @return {}       []
   */
  auto(value) {
    this.options.auto = value;
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
   * set explain
   * @param  {Boolean} explain []
   * @return {}         []
   */
  explain(explain) {
    this.options.explain = explain;
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
    const relation = new Relation(this);
    return relation.afterFind(data);
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
    const relation = new Relation(this);
    return relation.afterSelect(data);
  }
  /**
   * close socket connection
   * @return {} []
   */
  close() {
    this.connection().close();
  }
};
