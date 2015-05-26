'use strict';

import * as util from 'util';
import * as querystring from 'querystring';

let valid = think.require('valid');

let dbInstances = thinkCache(thinkCache.DB);
let tableFields = thinkCache(thinkCache.TABLE);
/**
 * model base class
 * @type {Class}
 */
export default class {
  /**
   * constructor
   * @param  {} args []
   * @return {}         []
   */
  constructor(...args){
    this.init(...args);
  }
  /**
   * init
   * @param  {} name   []
   * @param  {} config []
   * @return {}        []
   */
  init(name = '', config = {}){
    let options = {
      pk: 'id',
      name: '',
      tablePrefix: '',
      tableName: '',
      trueTableName: '',
      fields: {}
    }
    //if is set in user model, can't be override
    for(let key in options){
      if(this[key] === undefined){
        this[key] = options[key];
      }
    }
    if(think.isObject(name)){
      config = name;
      name = '';
    }
    this._db = null;
    this.config = config;
    this._data = {};
    this._options = {};
    //model name
    if(name){
      this.name = name;
    }
    //table prefix
    if (this.config.prefix && !this.tablePrefix) {
      this.tablePrefix = this.config.prefix;
    }
  }
  /**
   * get config key
   * @return {} []
   */
  getConfigKey(){
    return think.md5(JSON.stringify(this.config));
  }
  /**
   * get db instance
   * @return {Object} []
   */
  db(){
    if (this._db) {
      return this._db;
    }
    let configKey = this.getConfigKey();
    if (!dbInstances[configKey]) {
      let db = think.adapter('db', this.config.type);
      dbInstances[configKey] = new db(this.config);
    }
    this._db = dbInstances[configKey];
    return this._db;
  }
  /**
   * get model name
   * @return {String} []
   */
  getModelName(){
    if (this.name) {
      return this.name;
    }
    let filename = this.__filename || __filename;
    let last = filename.lastIndexOf('/');
    this.name = filename.substr(last + 1, filename.length - last - 3);
    return this.name;
  }
  /**
   * get table name
   * @return {String} []
   */
  getTableName(){
    if (!this.trueTableName) {
      this.trueTableName = (this.tablePrefix || '') + (this.tableName || this.getModelName());
    }
    return this.trueTableName;
  }
  /**
   * get table fields
   * @param  {String} table [table name]
   * @return {}       []
   */
  async getTableFields(table = this.getTableName()){
    if(this.isFieldGetted){
      return this.fields;
    }
    let fields;
    if(tableFields[table]){
      fields = tableFields[table];
    }else{
      fields = tableFields[table] = await this.db().getFields(table);
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
    this.isFieldGetted = true;
    return this.fields;
  }
  /**
   * get unique field
   * @param  {Object} data []
   * @return {Promise}      []
   */
  async getUniqueField(data){
    let fields = await this.getTableFields();
    let result = [];
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
   * set cache options
   * @param  {String} key     []
   * @param  {Number} timeout []
   * @return {}         []
   */
  cache(key, timeout){
    if (key === undefined) {
      return this;
    }
    let options;
    if(!think.isObject(key)){
      if(think.isNumber(key)){
        timeout = key;
        key = '';
      }
      options = think.extend({}, this.config.cache, {key, timeout})
    }else{
      options = key;
    }
    this._options.cache = options;
    return this;
  }
  /**
   * set limit options
   * @param  {Number} offset []
   * @param  {Number} length []
   * @return {}        []
   */
  limit(offset, length){
    if (offset === undefined) {
      return this;
    }
    this._options.limit = length === undefined ? [offset] : [offset, length];
    return this;
  }
  /**
   * set page options
   * @param  {Number} page     []
   * @param  {} listRows []
   * @return {}          []
   */
  page(page, listRows = this.config.nums_per_page){
    if (page === undefined) {
      return this;
    }
    this._options.limit = [listRows * (page - 1), listRows];
    return this;
  }
  /**
   * set where options
   * @return {} []
   */
  where(where){
    if (!where) {
      return this;
    }
    if (think.isString(where)) {
      where = {_string: where};
    }
    this._options.where = think.extend(this._options.where || {}, where);
    return this;
  }
  /**
   * set field options
   * @param  {String} field   []
   * @param  {Boolean} reverse []
   * @return {}         []
   */
  field(field, reverse = false){
    if (think.isString(field)) {
      field = field.split(',');
    }
    this._options.field = field;
    this._options.fieldReverse = reverse;
    return this;
  }
  /**
   * set table name
   * @param  {String} table []
   * @return {}       []
   */
  table(table, hasPrefix){
    if (!table) {
      return this;
    }
    table = table.trim();
    //table is sql, `SELECT * FROM`
    if (table.indexOf(' ') > -1) {
      hasPrefix = true;
    }
    this._options.table = hasPrefix ? table : this.tablePrefix + table;
    return this;
  }
  /**
   * union options
   * @param  {} union []
   * @param  {} all   []
   * @return {}       []
   */
  union(union, all){
    if (!union) {
      return this;
    }
    if (!this._options.union) {
      this._options.union = [];
    }
    this._options.union.push({
      union: union,
      all: all
    });
    return this;
  }
  /**
   * .join({
   *   'xxx': {
   *     join: 'left',
   *     as: 'c',
   *     on: ['id', 'cid']
   *   }
   * })
   * @param  {[type]} join [description]
   * @return {[type]}      [description]
   */
  join(join){
    if (!join) {
      return this;
    }
    if (!this._options.join) {
      this._options.join = [];
    }
    if (think.isArray(join)) {
      this._options.join = this._options.join.concat(join);
    }else{
      this._options.join.push(join);
    }
    return this;
  }
  order(value){
    this._options.order = value;
    return this;
  }
  alias(value){
    this._options.alias = value;
    return this;
  }
  having(value){
    this._options.having = value;
    return this;
  }
  group(value){
    this._options.group = value;
    return this;
  }
  lock(value){
    this._options.lock = value;
    return this;
  }
  auto(value){
    this._options.auto = value;
    return this;
  }
  filter(value){
    this._options.filter = value;
    return this;
  }
  validate(value){
    this._options.validate = value;
    return this;
  }
  distinct(data){
    this._options.distinct = data;
    if (think.isString(data)) {
      this._options.field = data;
    }
    return this;
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
          return Promise.reject(msg);
        }
      }
    }
    //field reverse
    if(options.field && options.fieldReverse){
      options.fieldReverse = false;
      let optionsField = option.field;
      options.field = fields.filter(item => {
        if(optionsField.indexOf(item) === -1){
          return item;
        }
      })
    }
    return this._optionsFilter(options, fields);
  }
  /**
   * options filter
   * @param  {Object} options []
   * @return {}         []
   */
  _optionsFilter(options){
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
      return !! value;
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
   * data filter
   * @param  {Object} data []
   * @return {}      []
   */
  _dataFilter(data){
    return data;
  }
  /**
   * check data before insert to db
   * @return {} []
   */
  _validData(data){
    let field, value, checkData = [];
    for(field in data){
      if (field in this.fields) {
        value = think.extend({}, this.fields[field], {name: field, value: data[field]});
        checkData.push(value);
      }
    }
    if (think.isEmpty(checkData)) {
      return data;
    }
    let result = Valid(checkData);
    if (think.isEmpty(result)) {
      return data;
    }
    let json_message = JSON.stringify(result);
    let err = new Error(json_message.slice(1, -1));
    err.json_message = json_message;
    return Promise.reject(err, true);
  }
  /**
   * before add
   * @param  {Object} data []
   * @return {}      []
   */
  _beforeAdd(data){
    return this._validData(data);
  }
  /**
   * after add
   * @param  {} data []
   * @return {}      []
   */
  _afterAdd(data){
    return data;
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
      return Promise.reject(msg);
    }
    options = await this.parseOptions(options);
    data = await this._beforeAdd(data, options);
    data = this.parseData(data);
    await this.db.insert(data, options, replace);
    let insertId = data[this.pk] = this.db.getLastInsertId();
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
  async addAll(data, options, replace){
    if (!think.isArray(data) || !think.isObject(data[0])) {
      return Promise.reject(new Error('_DATA_TYPE_INVALID_'));
    }
    if (options === true) {
      replace = true;
      options = {};
    }
    let promises = data.map(item => {
      return this._beforeAdd(item);
    })
    await Promise.all(promises);
    options = await this.parseOptions(options);
    await this.db.insertAll(data, options, replace);
    return this.db.getLastInsertId();
  }
  /**
   * after delete
   * @param  {Mixed} data []
   * @return {}      []
   */
  _afterDelete(data){
    return data;
  }
  /**
   * delete data
   * @return {} []
   */
  async delete(options){
    options = await this.parseOptions(options);
    let rows = await this.db.delete(options);
    await this._afterDelete(options.where || {}, options);
    return rows;
  }
  /**
   * before update
   * @param  {Mixed} data []
   * @return {}      []
   */
  _beforeUpdate(data){
    return this._validData(data);
  }
  /**
   * after update
   * @param  {} data    []
   * @param  {} options []
   * @return {}         []
   */
  _afterUpdate(data){
    return data;
  }
  /**
   * 更新数据
   * @return {[type]} [description]
   */
  async update(data, options){
    data = extend({}, this._data, data);
    //clear data
    this._data = {};
    if (think.isEmpty(data)) {
      return Promise.reject(new Error(think.message('DATA_EMPTY')));
    }
    options = await this.parseOptions(options);
    data = await this._beforeUpdate(data, options);
    data = this.parseData(data);
    let pk = this.getPk();
    if(think.isEmpty(options.where)){
      if(!think.isEmpty(data[pk])){
        options.where = {[pk]: data[pk]};
        delete data[pk];
      }else{
        return Promise.reject(new Error(think.message('MISS_WHERE_CONDITION')));
      }
    }else{
      data[pk] = options.where[pk];
    }
    let rows = await this.db.update(data, options);
    await this._afterUpdate(data, options);
    return rows;
  }
  /**
   * 更新多个数据，自动用主键作为查询条件
   * @param  {[type]} dataList [description]
   * @return {[type]}          [description]
   */
  updateAll(dataList){
    if (!think.isArray(dataList) || !think.isObject(dataList[0])) {
      return Promise.reject(new Error(think.message('DATA_EMPTY')));
    }
    let promises = dataList.map(data => {
      return this.update(data);
    });
    return Promise.all(promises);
  }
  /**
   * update field
   * @param  {String} field []
   * @param  {Mixed} value []
   * @return {Promise}       []
   */
  updateField(field, value){
    let data = {};
    if (think.isObject(field)) {
      data = field;
    }else{
      data[field] = value;
    }
    return this.update(data);
  }
  /**
   * update inc
   * @return {[type]} [description]
   */
  updateInc(field, step = 1){
    return this.updateField(field, ['exp', `${field}+${step}`]);
  }
  /**
   * update dec
   * @return {} []
   */
  updateDec(field, step = 1){
    return this.updateField(field, ['exp', `${field}-${step}`]);
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
   * after find
   * @return {} []
   */
  _afterFind(result){
    return result;
  }
  /**
   * find data
   * @return Promise
   */
  async find(options){
    options = await this.parseOptions(options, {limit: 1});
    let data = await this.db.select(options);
    return this._afterFind(data[0] || {}, options);
  }
  /**
   * after select
   * @param  {Mixed} result []
   * @return {}        []
   */
  _afterSelect(result){
    return result;
  }
  /**
   * select
   * @return Promise
   */
  async select(options){
    options = await this.parseOptions(options);
    let data = await this.db.select(options);
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
    return this.db.selectAdd(fields, data[0].table, data[1]);
  }
  /**
   * 返回数据里含有count信息的查询
   * @param  options  查询选项
   * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
   * @return promise         
   */
  async countSelect(options, pageFlag){
    if (think.isBoolean(options)) {
      pageFlag = options;
      options = {};
    }
    options = await this.parseOptions(options);
    let count = await this.options({
      where: options.where,
      cache: options.cache,
      join: options.join,
      alias: options.alias
    }).count((options.alias || this.getTableName()) + '.' + this.getPk());
    let pageOptions = parsePage(options);
    let totalPage = Math.ceil(count / pageOptions.num);
    if (think.isBoolean(pageFlag)) {
      if (pageOptions.page > totalPage) {
        pageOptions.page = pageFlag === true ? 1 : totalPage;
      }
      options.page = pageOptions.page + ',' + pageOptions.num;
    }
    result = think.extend({count: count, total: totalPage}, pageOptions);
    if (!options.page) {
      options.page = pageOptions.page;
    }
    let data = await this.select(options);
    result.data = data;
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
    let data = await this.db.select(options);
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
        })
        return one !== true;
      })
      return result;
    }else{
      data = data.map(item => {
        for(let key in item){
          return item[key];
        }
      })
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
   * get by
   * @param  {String} name  []
   * @param  {Mixed} value []
   * @return {Promise}       []
   */
  getBy(name, value){
    return this.where({[name]: value}).find();
  }
  /**
   * query
   * @return {Promise} []
   */
  async query(sql, ...args){
    sql = this.parseSql(sql, args);
    let data = await this.db().select(sql, this._options.cache);
    this._options = {};
    return data;
  }
  /**
   * execute sql
   * @param  {[type]} sql   [description]
   * @param  {[type]} parse [description]
   * @return {[type]}       [description]
   */
  execute(sql, ...args){
    sql = this.parseSql(sql, args);
    return this.db().execute(sql);
  }
  /**
   * parse sql
   * @return promise [description]
   */
  parseSql(sql, args){
    args.unshift(sql);
    sql = util.format(...args);
    //replace table name
    return sql.replace(/__([A-Z]+)__/g, (a, b) => {
      if(b === 'TABLE'){
        return '`' + this.getTableName() + '`'
      }
      return '`' + this.tablePrefix + b.toLowerCase() + '`';
    });
  }
  /**
   * start transaction
   * @return {Promise} []
   */
  async startTrans(){
    let db = this.db();
    await db.commit();
    return db.startTrans(this.getTableName());
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
   * set data
   * @param  {Mixed} data []
   * @return {}      []
   */
  data(data){
    if (data === true) {
      return this._data;
    }
    if (think.isString(data)) {
      data = querystring.parse(data);
    }
    this._data = data;
    return this;
  }
  /**
   * set options
   * @param  {Mixed} options []
   * @return {}         []
   */
  options(options){
    if (options === true) {
      return this._options;
    }
    this._options = options;
    return this;
  }
  /**
   * close db
   * @return {} []
   */
  close(){
    delete dbInstances[this.getConfigKey()];
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
  /**
   * close all db connections
   * @return {} []
   */
  static close(){
    for(let key in dbInstances){
      dbInstances[key].close();
    }
  }
}