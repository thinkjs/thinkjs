const helper = require('think-helper');
const path = require('path');
const assert = require('assert');
const Relation = require('./relation/relation.js');
const util = require('util');

const MODELS = Symbol('think-models');
const DB = Symbol('think-model-db');

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
    this.options = {};
    this.data = {};
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
    const Handle = this.config.handle;
    const instance = new Handle(this);
    this[DB] = instance;
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
   * parse options, reset this.options to {}
   * @param {Object} options 
   */
  async parseOptions(options) {
    if (helper.isNumber(options) || helper.isString(options)) {
      options += '';
      const where = {
        [this.pk]: options.indexOf(',') > -1 ? {IN: options} : options
      };
      options = {where};
    }
    options = Object.assign({}, this.options, options);
    this.options = {};
    options.table = options.table || this.tableName;
    options.tablePrefix = this.tablePrefix;
    if (options.field && options.fieldReverse) {
      options.field = await this.db().getReverseFields(options.field);
    }
    return options;
  }
  /**
   * add data
   * @param {Object} data 
   * @param {Object} options 
   */
  async add(data, options) {
    options = await this.parseOptions(options);
    let parsedData = await this.db().parseData(data, false, options.table);
    parsedData = await this.beforeAdd(parsedData, options);
    if (helper.isEmpty(parsedData)) return Promise.reject(new Error('add data is empty'));
    const lastInsertId = await this.db().add(parsedData, options);
    const copyData = Object.assign({}, data, parsedData, {[this.pk]: lastInsertId});
    await this.afterAdd(copyData, options);
    return lastInsertId;
  }

  /**
   * add data when not exist
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
      return Promise.reject(new Error('data must be an array'));
    }
    options = await this.parseOptions(options);
    let promises = data.map(async item => {
      item = await this.db().parseData(item, false, options.table);
      return this.beforeAdd(item, options);
    });
    data = await Promise.all(promises);
    const insertIds = await this.db().addMany(data, options);
    promises = data.map((item, i) => {
      item[this.pk] = insertIds[i];
      return this.afterAdd(item, options);
    });
    await Promise.all(promises);
    return insertIds;
  }

  /**
   * delete data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async delete(options) {
    options = await this.parseOptions(options);
    options = await this.beforeDelete(options);
    const rows = await this.db().delete(options);
    await this.afterDelete(options);
    return rows;
  }

  /**
   * update data
   * @param  {Object} data      []
   * @param  {Object} options   []
   * @param  {Boolean} ignoreWhere []
   * @return {Promise}          []
   */
  async update(data, options) {
    options = await this.parseOptions(options);
    let parsedData = await this.db().parseData(data, false, options.table);
    // check where condition
    if (helper.isEmpty(options.where)) {
      if (parsedData[this.pk]) {
        options.where = {[this.pk]: parsedData[this.pk]};
        delete parsedData[this.pk];
      } else {
        return Promise.reject(new Error('miss where condition on update'));
      }
    }
    parsedData = await this.beforeUpdate(parsedData, options);
    // check data is empty
    if (helper.isEmpty(parsedData)) {
      return Promise.reject(new Error('update data is empty'));
    }
    const rows = await this.db().update(parsedData, options);
    const copyData = Object.assign({}, data, parsedData);
    await this.afterUpdate(copyData, options);
    return rows;
  }

  /**
   * update all data
   * @param  {Array} dataList []
   * @return {Promise}          []
   */
  updateMany(dataList, options) {
    if (!helper.isArray(dataList)) {
      this.options = {};
      return Promise.reject(new Error('updateMany data must be an array'));
    }
    const promises = dataList.map(data => {
      return this.update(data, options);
    });
    return Promise.all(promises).then(data => {
      return data.reduce((a, b) => a + b);
    });
  }
  /**
   * find data
   * @return Promise
   */
  async find(options) {
    options = await this.parseOptions(options);
    options.limit = 1;
    options = await this.beforeFind(options);
    const data = await this.db().select(options);
    return this.afterFind(data[0] || {}, options);
  }
  /**
   * select
   * @return Promise
   */
  async select(options) {
    options = await this.parseOptions(options);
    options = await this.beforeSelect(options);
    const data = await this.db().select(options);
    return this.afterSelect(data, options);
  }
  /**
   * select add
   * @param  {} options []
   * @return {Promise}         []
   */
  async selectAdd(options) {
    let promise = Promise.resolve(options);
    const Class = this.constructor;
    if (options instanceof Class) {
      promise = options.parseOptions();
    }
    const data = await Promise.all([this.parseOptions(), promise]);
    let fields = data[0].field;
    if (!fields) {
      fields = await this.db().getSchema();
    }
    return this.db().selectAdd(fields, data[0].table, data[1]);
  }
  /**
   * count select
   * @param  options
   * @param  pageFlag
   * @return promise
   */
  async countSelect(options, pageFlag) {
    let count;
    if (helper.isBoolean(options)) {
      [options, pageFlag] = [{}, options];
    } else if (helper.isNumber(options)) {
      [count, options] = [options, {}];
    }

    options = await this.parseOptions(options);
    const table = options.alias || this.tableName;

    // delete table options avoid error when has alias
    delete options.table;
    // reserve and delete the possible order option
    const order = options.order;
    delete options.order;

    if (!count) {
      this.options = options;
      count = await this.count(`${table}.${this.pk}`);
    }

    options.limit = options.limit || [0, this.config.pagesize || 10];
    // recover the deleted possible order
    options.order = order;
    const pagesize = options.limit[1];
    // get page options
    const data = {pagesize};
    const totalPage = Math.ceil(count / data.pagesize);

    data.currentPage = parseInt((options.limit[0] / options.limit[1]) + 1);

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

    if (options.cache && options.cache.key) {
      options.cache.key += '_count';
    }
    result.data = count ? await this.select(options) : [];
    return result;
  }
  /**
   * get field data
   * @return {[type]} [description]
   */
  async getField(field, one) {
    const options = await this.parseOptions({'field': field});
    if (helper.isNumber(one)) {
      options.limit = one;
    } else if (one === true) {
      options.limit = 1;
    }
    let data = await this.db().select(options);
    const multi = field.indexOf(',') > -1 && field.indexOf('(') === -1;
    if (multi) {
      const fields = field.split(/\s*,\s*/);
      const result = {};
      fields.forEach(item => {
        result[item] = [];
      });
      data.every(item => {
        fields.forEach(fItem => {
          if (one === true) {
            result[fItem] = item[fItem];
          } else {
            result[fItem].push(item[fItem]);
          }
        });
        return one !== true;
      });
      return result;
    } else {
      data = data.map(item => {
        for (const key in item) {
          return item[key];
        }
      });
      return one === true ? data[0] : data;
    }
  }
  /**
   * increment field data
   * @return {Promise} []
   */
  increment(field, step = 1) {
    let data = {};
    if (helper.isArray(field)) {
      field.forEach(item => {
        data[item] = ['exp', `\`${item}\`+${step}`];
      });
    } else if (helper.isObject(field)) {
      for (const key in field) {
        data[key] = ['exp', `\`${key}\`+${field[key]}`];
      }
    } else {
      data = {
        [field]: ['exp', `\`${field}\`+${step}`]
      };
    }
    return this.update(data);
  }
  /**
   * decrement field data
   * @return {} []
   */
  decrement(field, step = 1) {
    let data = {};
    if (helper.isArray(field)) {
      field.forEach(item => {
        data[item] = ['exp', `\`${item}\`-${step}`];
      });
    } else if (helper.isObject(field)) {
      for (const key in field) {
        data[key] = ['exp', `\`${key}\`-${field[key]}`];
      }
    } else {
      data = {
        [field]: ['exp', `\`${field}\`-${step}`]
      };
    }
    return this.update(data);
  }
  /**
   * quote field
   * @param {String} field 
   */
  quoteField(field) {
    if (field) {
      return /^\w+$/.test(field) ? '`' + field + '`' : field;
    }
    return this.pk || '*';
  }
  /**
   * get count
   * @param  {String} field []
   * @return {Promise}       []
   */
  count(field) {
    field = this.quoteField(field);
    return this.getField('COUNT(' + field + ') AS think_count', true);
  }
  /**
   * get sum
   * @param  {String} field []
   * @return {Promise}       []
   */
  sum(field) {
    field = this.quoteField(field);
    return this.getField('SUM(' + field + ') AS think_sum', true);
  }
  /**
   * get min value
   * @param  {String} field []
   * @return {Promise}       []
   */
  min(field) {
    field = this.quoteField(field);
    return this.getField('MIN(' + field + ') AS think_min', true);
  }
  /**
   * get max valud
   * @param  {String} field []
   * @return {Promise}       []
   */
  max(field) {
    field = this.quoteField(field);
    return this.getField('MAX(' + field + ') AS think_max', true);
  }
  /**
   * get value average
   * @param  {String} field []
   * @return {Promise}       []
   */
  avg(field) {
    field = this.quoteField(field);
    return this.getField('AVG(' + field + ') AS think_avg', true);
  }
  /**
   * query
   * @return {Promise} []
   */
  query(...args) {
    if (helper.isObject(args[0])) {
      return this.db().select(args[0], this.options.cache);
    }
    const sql = this.parseSql(...args);
    return this.db().select(sql, this.options.cache);
  }
  /**
   * execute sql
   * @param  {[type]} sql   [description]
   * @param  {[type]} parse [description]
   * @return {[type]}       [description]
   */
  execute(...args) {
    const sql = this.parseSql(...args);
    return this.db().execute(sql);
  }
  /**
   * parse sql
   * @return promise [description]
   */
  parseSql(...args) {
    const sql = util.format(...args);
    // replace table name
    return sql.replace(/\s__([A-Z]+)__\s/g, (a, b) => {
      if (b === 'TABLE') {
        return ' `' + this.tableName + '` ';
      }
      return ' `' + this.tablePrefix + b.toLowerCase() + '` ';
    });
  }
  /**
   * start transaction
   * @return {Promise} []
   */
  startTrans(connection) {
    return this.db().startTrans(connection);
  }
  /**
   * commit transcation
   * @return {Promise} []
   */
  commit(connection) {
    return this.db().commit(connection);
  }
  /**
   * rollback transaction
   * @return {Promise} []
   */
  rollback(connection) {
    return this.db().rollback(connection);
  }
  /**
   * transaction exec functions
   * @param  {Function} fn [async exec function]
   * @return {Promise}      []
   */
  transaction(fn, connection) {
    return this.db().transaction(fn, connection);
  }
  /**
   * close socket connection
   * @return {} []
   */
  close() {
    return this.db().close();
  }
};

module.exports.HAS_ONE = Relation.HAS_ONE;
module.exports.HAS_MANY = Relation.HAS_MANY;
module.exports.BELONG_TO = Relation.BELONG_TO;
module.exports.MANY_TO_MANY = Relation.MANY_TO_MANY;
