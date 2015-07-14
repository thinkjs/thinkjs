'use strict';

import util from 'util';
import Base from './_base.js';

let tableFields = thinkCache(thinkCache.TABLE);
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
    if(this._isFieldGetted){
      return this.fields;
    }
    let fields;
    if(tableFields[table]){
      fields = tableFields[table];
    }else{
      fields = tableFields[table] = await this.db().getFields(table);
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
    //merge use set fields config
    this.fields = think.extend({}, fields, this.fields);
    this._isFieldGetted = true;
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

    options.tablePrefix = this.tablePrefix;
    options.model = this.getModelName();
    //table alias
    if (options.alias) {
      options.table += ' AS ' + options.alias;
    }
    let fields = await this.getTableFields(options.table);
    if(!think.isObject(oriOpts)){
      options = think.extend(options, this.parseWhereOptions(oriOpts, extraOptions));
    }
    //check where key
    if(options.where && !think.isEmpty(fields)){
      let keyReg = /^[\w\.\|\&]+$/;
      for(let key in options.where){
        if(!keyReg.test(key)){
          let msg = new Error(think.message('FIELD_KEY_NOT_VALID', key));
          return think.reject(msg);
        }
      }
    }
    //field reverse
    if(options.field && options.fieldReverse){
      options.fieldReverse = false;
      let optionsField = options.field;
      options.field = fields.filter(item => {
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
  parseWhereOptions(options = {}){
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
      let msg = new Error(think.message('DATA_EMPTY'));
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
   * @param  {} returnType []
   * @return {}            []
   */
  async thenAdd(data, where, returnType){
    if (where === true) {
      returnType = true;
      where = undefined;
    }
    let findData = await this.where(where).find();
    if(!think.isEmpty(findData)){
      let idValue = findData[this.pk];
      return returnType ? {[idValue]: idValue, type: 'exist'} : idValue;
    }
    let insertId = await this.add(data);
    return returnType ? {[this.pk]: insertId, type: 'add'} : insertId;
  }
  /**
   * add multi data
   * @param {Object} data    []
   * @param {} options []
   * @param {} replace []
   */
  async addMany(data, options, replace){
    if (!think.isArray(data) || !think.isObject(data[0])) {
      return think.reject(new Error('_DATA_TYPE_INVALID_'));
    }
    if (options === true) {
      replace = true;
      options = {};
    }
    let promises = data.map(item => {
      return this._beforeAdd(item);
    });
    await Promise.all(promises);
    options = await this.parseOptions(options);
    await this.db().addMany(data, options, replace);
    return this.db().getLastInsertId();
  }
  /**
   * delete data
   * @return {} []
   */
  async delete(options){
    options = await this.parseOptions(options);
    let rows = await this.db().delete(options);
    await this._afterDelete(options);
    return rows;
  }
  /**
   * update data
   * @return {[type]} [description]
   */
  async update(data, options){
    data = think.extend({}, this._data, data);
    //clear data
    this._data = {};
    if (think.isEmpty(data)) {
      return think.reject(new Error(think.message('DATA_EMPTY')));
    }
    options = await this.parseOptions(options);
    data = await this._beforeUpdate(data, options);
    data = this.parseData(data);
    let pk = await this.getPk();
    if(think.isEmpty(options.where)){
      if(!think.isEmpty(data[pk])){
        options.where = {[pk]: data[pk]};
        delete data[pk];
      }else{
        return think.reject(new Error(think.message('MISS_WHERE_CONDITION')));
      }
    }else{
      data[pk] = options.where[pk];
    }
    let rows = await this.db().update(data, options);
    await this._afterUpdate(data, options);
    return rows;
  }
  /**
   * update all data
   * @param  {[type]} dataList [description]
   * @return {[type]}          [description]
   */
  updateAll(dataList){
    if (!think.isArray(dataList) || !think.isObject(dataList[0])) {
      return think.reject(new Error(think.message('DATA_EMPTY')));
    }
    let promises = dataList.map(data => {
      return this.update(data);
    });
    return think.all(promises);
  }
  /**
   * increment field data
   * @return {[type]} [description]
   */
  increment(field, step = 1){
    let data = {
      [field]: ['exp', `${field}+${step}`]
    }
    return this.update(data);
  }
  /**
   * decrement field data
   * @return {} []
   */
  decrement(field, step = 1){
    let data = {
      [field]: ['exp', `${field}-${step}`]
    }
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
    if (think.isBoolean(options)) {
      pageFlag = options;
      options = {};
    }
    options = await this.parseOptions(options);
    let pk = await this.getPk();
    let table = options.alias || this.getTableName();
    //get count
    let count = await this.options({
      where: options.where,
      cache: options.cache,
      join: options.join,
      alias: options.alias,
      table: options.table,
      group: options.group
    }).count(`${table}.${pk}`);
    //get page options
    let pageOptions = {page: 1, num: this.config.nums_per_page};
    if(options.limit){
      pageOptions.page = parseInt((options.limit[0] / options.limit[1]) + 1);
    }
    let totalPage = Math.ceil(count / pageOptions.num);
    if (think.isBoolean(pageFlag)) {
      if (pageOptions.page > totalPage) {
        pageOptions.page = pageFlag === true ? 1 : totalPage;
      }
      options.page = pageOptions.page + ',' + pageOptions.num;
    }
    let result = think.extend({count: count, total: totalPage}, pageOptions);
    if (!options.page) {
      options.page = pageOptions.page;
    }
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
    return this.getField('COUNT(' + field + ') AS thinkjs_count', true);
  }
  /**
   * get sum
   * @param  {String} field []
   * @return {Promise}       []
   */
  async sum(field){
    field = field || await this.getPk();
    return this.getField('SUM(' + field + ') AS thinkjs_sum', true);
  }
  /**
   * get min value
   * @param  {String} field []
   * @return {Promise}       []
   */
  async min(field){
    field = field || await this.getPk();
    return this.getField('MIN(' + field + ') AS thinkjs_min', true);
  }
  /**
   * get max valud
   * @param  {String} field []
   * @return {Promise}       []
   */
  async max(field){
    field = field || await this.getPk();
    return this.getField('MAX(' + field + ') AS thinkjs_max', true);
  }
  /**
   * get value average
   * @param  {String} field []
   * @return {Promise}       []
   */
  async avg(field){
    field = field || await this.getPk();
    return this.getField('AVG(' + field + ') AS thinkjs_avg', true);
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
      return ' `' + this.tablePrefix + b.toLowerCase() + '` ';
    });
  }
  /**
   * start transaction
   * @return {Promise} []
   */
  startTrans(){
    return this.db().startTrans(this.getTableName());
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