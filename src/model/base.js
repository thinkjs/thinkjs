'use strict';

import util from 'util';
import Base from './_base.js';

/**
 * model base class
 * @type {Class}
 */
export default class extends Base {
  /**
   * get table fields
   * @param  {String} table [table name]
   * @return {}       []
   */
  async getTableFields(table){
    table = table || this.getTableName();
    let storeKey = `${this.config.type}_${table}_fields`;
    let fields = thinkCache(thinkCache.TABLE, storeKey);
    if(!fields){
      fields = await this.db().getFields(table);
      thinkCache(thinkCache.TABLE, storeKey, fields);
    }
    if(table !== this.getTableName()){
      return fields;
    }
    //get primary key
    for(let name in fields){
      if(fields[name].primary){
        this.pk = name;
        break;
      }
    }
    //merge user set fields config
    this.fields = think.extend({}, fields, this.fields);
    return this.fields;
  }
  /**
   * get unique field
   * @param  {Object} data []
   * @return {Promise}      []
   */
  async getUniqueField(data){
    let fields = await this.getTableFields();
    for(let name in fields){
      if(fields[name].unique && (!data || data[name])){
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
    return this.getTableFields().then(() => this.pk);
  }
  /**
   * build sql
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  async buildSql(options){
    options = await this.parseOptions(options);
    return '( ' + this.db().buildSelectSql(options).trim() + ' )';
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

    options.tablePrefix = this.getTablePrefix();
    options.model = this.getModelName();
    
    //get table fields can not use table alias
    let fields = await this.getTableFields(options.table);

    //table alias
    if (options.alias) {
      options.table += ' AS ' + options.alias;
    }

    if(!think.isObject(oriOpts)){
      options = think.extend(options, this.parseWhereOptions(oriOpts, extraOptions));
    }
    //check where key
    if(options.where && !think.isEmpty(fields)){
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
      options.field = Object.keys(fields).filter(item => {
        if(optionsField.indexOf(item) === -1){
          return item;
        }
      });
    }
    return this._optionsFilter(options, fields);
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
    let fieldType = this.fields[key].type || '';
    if (fieldType.indexOf('bigint') === -1 && fieldType.indexOf('int') > -1) {
      return String(parseInt(value, 10) || 0);
    }else if(fieldType.indexOf('double') > -1 || fieldType.indexOf('float') > -1){
      return String(parseFloat(value) || 0.0);
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
      if (!this.fields[key]) {
        delete data[key];
      }else if(think.isNumber(val) || think.isString(val) || think.isBoolean(val)){
        data[key] = this.parseType(key, val);
      }
    }
    return this._dataFilter(data);
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
    if (think.isEmpty(data)) {
      let msg = new Error(think.locale('DATA_EMPTY'));
      return think.reject(msg);
    }
    options = await this.parseOptions(options);
    data = await this._beforeAdd(data, options);
    data = this.parseData(data);
    await this.db().add(data, options, replace);
    let insertId = data[this.pk] = this.db().getLastInsertId();
    await this._afterAdd(data, options);
    return insertId;
  }
  /**
   * then add
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
      return this._beforeAdd(item, options);
    });
    data = await Promise.all(promises);
    await this.db().addMany(data, options, replace);
    let insertId = this.db().getLastInsertId() - data.length + 1;
    let insertIds = [];
    promises = data.map((item, i) => {
      let id = insertId + i;
      item[this.pk] = id;
      insertIds.push(id);
      return this._afterAdd(item, options);
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
    let rows = await this.db().delete(options);
    await this._afterDelete(options);
    return rows;
  }
  /**
   * update data
   * @return {Promise} []
   */
  async update(data, options){
    data = think.extend({}, this._data, data);
    //clear data
    this._data = {};

    //get where condition from data
    let pk = await this.getPk();
    if(data[pk]){
      this.where({[pk]: data[pk]});
      delete data[pk];
    }

    //remove readonly field data
    this.readonlyFields.forEach(item => {
      delete data[item];
    });

    if (think.isEmpty(data)) {
      return think.reject(new Error(think.locale('DATA_EMPTY')));
    }
    
    options = await this.parseOptions(options);
    data = await this._beforeUpdate(data, options);
    data = this.parseData(data);
    let rows = await this.db().update(data, options);
    await this._afterUpdate(data, options);
    return rows;
  }
  /**
   * update all data
   * @param  {Array} dataList []
   * @return {Promise}          []
   */
  updateMany(dataList, options){
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
   * increment field data
   * @return {Promise} []
   */
  increment(field, step = 1){
    let data = {
      [field]: ['exp', `${field}+${step}`]
    };
    return this.update(data);
  }
  /**
   * decrement field data
   * @return {} []
   */
  decrement(field, step = 1){
    let data = {
      [field]: ['exp', `${field}-${step}`]
    };
    return this.update(data);
  }
  /**
   * find data
   * @return Promise
   */
  async find(options){
    options = await this.parseOptions(options, {limit: 1});
    let data = await this.db().select(options);
    return this._afterFind(data[0] || {}, options);
  }
  /**
   * select
   * @return Promise
   */
  async select(options){
    options = await this.parseOptions(options);
    let data = await this.db().select(options);
    return this._afterSelect(data, options);
  }
  /**
   * select add
   * @param  {} options []
   * @return {Promise}         []
   */
  async selectAdd(options){
    let promise = Promise.resolve(options);
    if (options instanceof module.exports) {
      promise = options.parseOptions();
    }
    let data = await Promise.all([this.parseOptions(), promise]);
    let fields = data[0].field || Object.keys(this.fields);
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

    if(!count){
      //get count
      delete options.alias;
      count = await this.options(options).count(`${table}.${pk}`);
    }

    options.limit = options.limit || [1, this.config.nums_per_page];

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
    result.data = await this.select(options);
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
    let multi = field.indexOf(',') > -1;
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
   * get count
   * @param  {String} field []
   * @return {Promise}       []
   */
  async count(field){
    field = field || await this.getPk();
    return this.getField('COUNT(' + field + ') AS think_count', true);
  }
  /**
   * get sum
   * @param  {String} field []
   * @return {Promise}       []
   */
  async sum(field){
    field = field || await this.getPk();
    return this.getField('SUM(' + field + ') AS think_sum', true);
  }
  /**
   * get min value
   * @param  {String} field []
   * @return {Promise}       []
   */
  async min(field){
    field = field || await this.getPk();
    return this.getField('MIN(' + field + ') AS think_min', true);
  }
  /**
   * get max valud
   * @param  {String} field []
   * @return {Promise}       []
   */
  async max(field){
    field = field || await this.getPk();
    return this.getField('MAX(' + field + ') AS think_max', true);
  }
  /**
   * get value average
   * @param  {String} field []
   * @return {Promise}       []
   */
  async avg(field){
    field = field || await this.getPk();
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
    return this.db().startTrans();
  }
  /**
   * commit transcation
   * @return {Promise} []
   */
  commit(){
    return this.db().commit();
  }
  /**
   * rollback transaction
   * @return {Promise} []
   */
  rollback(){
    return this.db().rollback();
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
      result = await think.co(fn);
      await this.commit();
    }catch(e){
      await this.rollback();
    }
    return result;
  }
}