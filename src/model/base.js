'use strict';

import util from 'util';
import Base from './_base.js';

/**
 * model base class
 * @type {Class}
 */
export default class extends Base {
  /**
   * get table schema
   * @param  {String} table [table name]
   * @return {}       []
   */
  async getSchema(table){
    table = table || this.getTableName();
    let storeKey = `${this.config.type}_${table}_schema`;
    let schema = {};
    //force update table schema
    if(this.config.schema_force_update){
      schema = await this.db().getSchema(table);
    }else{
      schema = thinkCache(thinkCache.TABLE, storeKey);
      if(!schema){
        schema = await this.db().getSchema(table);
        thinkCache(thinkCache.TABLE, storeKey, schema);
      }
    }
    if(table !== this.getTableName()){
      return schema;
    }
    //get primary key
    for(let name in schema){
      if(schema[name].primary){
        this.pk = name;
        break;
      }
    }
    //merge user set schema config
    this.schema = think.extend({}, schema, this.schema);
    return this.schema;
  }
  /**
   * get table fields
   * @param  {String} table []
   * @return {Promise}       []
   */
  getTableFields(table){
    think.log('model.getTableFields is deprecated, use model.getSchema instead.', 'WARNING');
    return this.getSchema(table);
  }
  /**
   * get unique field
   * @param  {Object} data []
   * @return {Promise}      []
   */
  async getUniqueField(data){
    let schema = await this.getSchema();
    for(let name in schema){
      if(schema[name].unique && (!data || data[name])){
        return name;
      }
    }
  }
  /**
   * get last sql
   * @return {Promise} []
   */
  getLastSql(){
    return this.db().getLastSql();
  }
  /**
   * get primary key
   * @return {Promise} []
   */
  getPk(){
    if(this.pk !== 'id'){
      return Promise.resolve(this.pk);
    }
    return this.getSchema().then(() => this.pk);
  }
  /**
   * build sql
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  async buildSql(options, noParentheses){
    options = await this.parseOptions(options);
    let sql = this.db().buildSelectSql(options).trim();
    if(noParentheses){
      return sql;
    }
    return '( ' + sql + ' )';
  }
  /**
   * parse options
   * @param  {Object} options []
   * @return promise         []
   */
  async parseOptions(oriOpts, extraOptions){
    let options = think.extend({}, this._options);
    if (think.isObject(oriOpts)) {
      options = think.extend(options, oriOpts);
    }
    if(extraOptions){
      options = think.extend(options, extraOptions);
    }
    //clear options
    this._options = {};
    //get table name
    options.table = options.table || this.getTableName();

    options.tablePrefix = this.getTablePrefix();
    options.model = this.getModelName();

    //get table schema can not use table alias
    let schema = await this.getSchema(options.table);

    //table alias
    if (options.alias) {
      options.table += ' AS ' + options.alias;
    }

    if(oriOpts !== undefined && !think.isObject(oriOpts)){
      options = think.extend(options, this.parseWhereOptions(oriOpts));
    }
    //check where key
    if(options.where && !think.isEmpty(schema)){
      let keyReg = /^[\w\.\|\&]+$/;
      for(let key in options.where){
        if(!keyReg.test(key)){
          let msg = new Error(think.locale('FIELD_KEY_NOT_VALID', key));
          return think.reject(msg);
        }
      }
    }
    //field reverse
    if(options.field && options.fieldReverse){
      //reset fieldReverse value
      options.fieldReverse = false;
      let optionsField = options.field;
      options.field = Object.keys(schema).filter(item => {
        if(optionsField.indexOf(item) === -1){
          return item;
        }
      });
    }
    return this.optionsFilter(options, schema);
  }
  /**
   * parse where options
   * @return {Object}
   */
  parseWhereOptions(options){
    if (think.isNumber(options) || think.isString(options)) {
      options += '';
      let where = {
        [this.pk]: options.indexOf(',') > -1 ? {IN: options} : options
      };
      return {where: where};
    }
    return options;
  }
  /**
   * parse type
   * @param  {Object} data []
   * @param  {} key  []
   * @return {}      []
   */
  parseType(key, value){
    let fieldType = this.schema[key].type || '';
    if(fieldType.indexOf('enum') > -1 || fieldType.indexOf('set') > -1){
      return value;
    }
    if (fieldType.indexOf('bigint') === -1 && fieldType.indexOf('int') > -1) {
      return parseInt(value, 10) || 0;
    }else if(fieldType.indexOf('double') > -1 || fieldType.indexOf('float') > -1){
      return parseFloat(value) || 0.0;
    }else if(fieldType.indexOf('bool') > -1){
      return !!value;
    }
    return value;
  }
  /**
   * parse data, after fields getted
   * @param  {} data []
   * @return {}      []
   */
  parseData(data){
    //deep clone data
    data = think.extend({}, data);
    for(let key in data){
      let val = data[key];
      //remove data not in fields
      if (!this.schema[key]) {
        delete data[key];
      }else if(think.isNumber(val) || think.isString(val) || think.isBoolean(val)){
        data[key] = this.parseType(key, val);
      }
    }
    return this.dataFilter(data);
  }
  /**
   * add data
   * @param {Object} data    []
   * @param {Object} options []
   * @param {} replace []
   */
  async add(data, options, replace){
    if (options === true) {
      replace = true;
      options = {};
    }
    //copy data
    data = think.extend({}, this._data, data);
    //clear data
    this._data = {};

    options = await this.parseOptions(options);

    let parsedData = this.parseData(data);
    parsedData = await this.beforeAdd(parsedData, options);
    if (think.isEmpty(parsedData)) {
      let msg = new Error(think.locale('DATA_EMPTY'));
      return think.reject(msg);
    }

    let db = this.db();
    await db.add(parsedData, options, replace);
    let insertId = parsedData[this.pk] = db.getLastInsertId();
    let copyData = think.extend({}, data, parsedData, {[this.pk]: insertId});
    await this.afterAdd(copyData, options);
    return insertId;
  }
  /**
   * add data when not exist
   * @param  {Object} data       []
   * @param  {Object} where      []
   * @return {}            []
   */
  async thenAdd(data, where){
    let findData = await this.where(where).find();
    if(!think.isEmpty(findData)){
      return {[this.pk]: findData[this.pk], type: 'exist'};
    }
    let insertId = await this.add(data);
    return {[this.pk]: insertId, type: 'add'};
  }
  /**
   * update data when exist, otherwise add data
   * @return {id}
   */
  async thenUpdate(data, where){
    let findData = await this.where(where).find();
    if(think.isEmpty(findData)){
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
  async addMany(data, options, replace){
    if (!think.isArray(data) || !think.isObject(data[0])) {
      return think.reject(new Error(think.locale('DATA_MUST_BE_ARRAY')));
    }
    if (options === true) {
      replace = true;
      options = {};
    }
    options = await this.parseOptions(options);
    let promises = data.map(item => {
      item = this.parseData(item);
      return this.beforeAdd(item, options);
    });
    data = await Promise.all(promises);
    let db = this.db();
    await db.addMany(data, options, replace);
    let insertId = db.getLastInsertId();
    let insertIds = [];
    promises = data.map((item, i) => {
      let id = insertId + i;
      if(this.config.type === 'sqlite'){
        id = insertId - data.length + i + 1;
      }
      item[this.pk] = id;
      insertIds.push(id);
      return this.afterAdd(item, options);
    });
    data = await Promise.all(promises);
    return insertIds;
  }
  /**
   * delete data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async delete(options){
    options = await this.parseOptions(options);
    options = await this.beforeDelete(options);
    let rows = await this.db().delete(options);
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
  async update(data, options){

    data = think.extend({}, this._data, data);
    //clear data
    this._data = {};

    options = await this.parseOptions(options);

    let parsedData = this.parseData(data);

    //check where condition
    if(think.isEmpty(options.where)){
      //get where condition from data
      let pk = await this.getPk();
      if(parsedData[pk]){
        options.where = {[pk]: parsedData[pk]};
        delete parsedData[pk];
      }else{
        return think.reject(new Error(think.locale('MISS_WHERE_CONDITION')));
      }
    }

    parsedData = await this.beforeUpdate(parsedData, options);
    //check data is empty
    if (think.isEmpty(parsedData)) {
      return think.reject(new Error(think.locale('DATA_EMPTY')));
    }

    let rows = await this.db().update(parsedData, options);
    let copyData = think.extend({}, data, parsedData);
    await this.afterUpdate(copyData, options);
    return rows;
  }
  /**
   * update all data
   * @param  {Array} dataList []
   * @return {Promise}          []
   */
  updateMany(dataList, options){
    if (!think.isArray(dataList)) {
      //empty data and options
      this._options = {};
      this._data = {};

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
   * increment field data
   * @return {Promise} []
   */
  increment(field, step = 1){
    let data = {
      [field]: ['exp', `\`${field}\`+${step}`]
    };
    return this.update(data);
  }
  /**
   * decrement field data
   * @return {} []
   */
  decrement(field, step = 1){
    let data = {
      [field]: ['exp', `\`${field}\`-${step}`]
    };
    return this.update(data);
  }
  /**
   * find data
   * @return Promise
   */
  async find(options){
    options = await this.parseOptions(options, {limit: 1});
    options = await this.beforeFind(options);
    let data = await this.db().select(options);
    return this.afterFind(data[0] || {}, options);
  }
  /**
   * select
   * @return Promise
   */
  async select(options){
    options = await this.parseOptions(options);
    options = await this.beforeSelect(options);
    let data = await this.db().select(options);
    return this.afterSelect(data, options);
  }
  /**
   * select add
   * @param  {} options []
   * @return {Promise}         []
   */
  async selectAdd(options){
    let promise = Promise.resolve(options);
    let Class = module.exports.default || module.exports;
    if (options instanceof Class) {
      promise = options.parseOptions();
    }
    let data = await Promise.all([this.parseOptions(), promise]);
    let fields = data[0].field || Object.keys(this.schema);
    return this.db().selectAdd(fields, data[0].table, data[1]);
  }
  /**
   * count select
   * @param  options
   * @param  pageFlag
   * @return promise
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

    //delete table options avoid error when has alias
    delete options.table;
    //reserve and delete the possible order option
    let order = options.order;
    delete options.order;

    if(!count){
      count = await this.options(options).count(`${table}.${pk}`);
    }

    options.limit = options.limit || [0, this.config.nums_per_page];
    //recover the deleted possible order
    options.order = order;
    let numsPerPage = options.limit[1];
    //get page options
    let data = {numsPerPage: numsPerPage};
    let totalPage = Math.ceil(count / data.numsPerPage);

    data.currentPage = parseInt((options.limit[0] / options.limit[1]) + 1);

    if (think.isBoolean(pageFlag) && data.currentPage > totalPage) {
      if(pageFlag){
        data.currentPage = 1;
        options.limit = [0, numsPerPage];
      }else{
        data.currentPage = totalPage;
        options.limit = [(totalPage - 1) * numsPerPage, numsPerPage];
      }
    }
    let result = think.extend({count: count, totalPages: totalPage}, data);

    if(options.cache && options.cache.key){
      options.cache.key += '_count';
    }
    result.data = count ? await this.select(options) : [];
    return result;
  }
  /**
   * get field data
   * @return {[type]} [description]
   */
  async getField(field, one){
    let options = await this.parseOptions({'field': field});
    if (think.isNumber(one)) {
      options.limit = one;
    }else if (one === true) {
      options.limit = 1;
    }
    let data = await this.db().select(options);
    let multi = field.indexOf(',') > -1 && field.indexOf('(') === -1;
    if (multi) {
      let fields = field.split(/\s*,\s*/);
      let result = {};
      fields.forEach(item => result[item] = []);
      data.every(item => {
        fields.forEach(fItem => {
          if (one === true) {
            result[fItem] = item[fItem];
          }else{
            result[fItem].push(item[fItem]);
          }
        });
        return one !== true;
      });
      return result;
    }else{
      data = data.map(item => {
        for(let key in item){
          return item[key];
        }
      });
      return one === true ? data[0] : data;
    }
  }
  /**
   * get quote field
   * @param  {String} field []
   * @return {String}       []
   */
  async _getQuoteField(field){
    if(field){
      return /^\w+$/.test(field) ? '`' + field + '`' : field;
    }
    return await this.getPk() || '*';
  }
  /**
   * get count
   * @param  {String} field []
   * @return {Promise}       []
   */
  async count(field){
    field = await this._getQuoteField(field);
    return this.getField('COUNT(' + field + ') AS think_count', true);
  }
  /**
   * get sum
   * @param  {String} field []
   * @return {Promise}       []
   */
  async sum(field){
    field = await this._getQuoteField(field);
    return this.getField('SUM(' + field + ') AS think_sum', true);
  }
  /**
   * get min value
   * @param  {String} field []
   * @return {Promise}       []
   */
  async min(field){
    field = await this._getQuoteField(field);
    return this.getField('MIN(' + field + ') AS think_min', true);
  }
  /**
   * get max valud
   * @param  {String} field []
   * @return {Promise}       []
   */
  async max(field){
    field = await this._getQuoteField(field);
    return this.getField('MAX(' + field + ') AS think_max', true);
  }
  /**
   * get value average
   * @param  {String} field []
   * @return {Promise}       []
   */
  async avg(field){
    field = await this._getQuoteField(field);
    return this.getField('AVG(' + field + ') AS think_avg', true);
  }
  /**
   * query
   * @return {Promise} []
   */
  query(...args){
    let sql = this.parseSql(...args);
    return this.db().select(sql, this._options.cache);
  }
  /**
   * execute sql
   * @param  {[type]} sql   [description]
   * @param  {[type]} parse [description]
   * @return {[type]}       [description]
   */
  execute(...args){
    let sql = this.parseSql(...args);
    return this.db().execute(sql);
  }
  /**
   * parse sql
   * @return promise [description]
   */
  parseSql(...args){
    let sql = util.format(...args);
    //replace table name
    return sql.replace(/\s__([A-Z]+)__\s/g, (a, b) => {
      if(b === 'TABLE'){
        return ' `' + this.getTableName() + '` ';
      }
      return ' `' + this.getTablePrefix() + b.toLowerCase() + '` ';
    });
  }
  /**
   * start transaction
   * @return {Promise} []
   */
  startTrans(){
    return this.db(true).startTrans();
  }
  /**
   * commit transcation
   * @return {Promise} []
   */
  async commit(){
    let data = await this.db().commit();
    this.close();
    this._db = null;
    return data;
  }
  /**
   * rollback transaction
   * @return {Promise} []
   */
  async rollback(){
    let data = await this.db().rollback();
    this.close();
    this._db = null;
    return data;
  }
  /**
   * transaction exec functions
   * @param  {Function} fn [exec function]
   * @return {Promise}      []
   */
  async transaction(fn){
    let result;
    await this.startTrans();
    try{
      result = await think.co(fn());
      await this.commit();
    }catch(e){
      await this.rollback();
    }
    return result;
  }
}
