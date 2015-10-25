'use strict';

/**
 * base model class
 */
export default class extends think.base {
  /**
   * init
   * @param  {} name   []
   * @param  {} config []
   * @return {}        []
   */
  init(name = '', config = {}){

    let options = {
      pk: 'id', //primary key
      name: '', //model name
      tablePrefix: undefined, //table prefix
      tableName: '', //table name, without prefix
      /**
       * fields list
       * {
       *   name: {
       *     type: 'string',
       *     required: true,
       *     default: '',
       *     unique: true,
       *     primary: true,
       *     auto_increment: true
       *   }
       * }
       */
      fields: {}, //table fields
      /**
       * table indexes
       * {
       *   name: {name: 1, $unique: true}, //single indexes
       *   test1: {name1: 1, title1: 1, $unique: 1}, //compound indexes
       * }
       * @type {Object}
       */
      indexes: {},
      readonlyFields: []// readonly fields
    };
    //if is set in subclass, can't be override
    for(let key in options){
      if(this[key] === undefined){
        this[key] = options[key];
      }
    }

    if(think.isObject(name)){
      config = name;
      name = '';
    }

    this.config = config;
    this._db = null;
    this._data = {};
    this._options = {};

    //model name
    if(name){
      this.name = name;
    }
    // get table prefix from config
    if (this.config.prefix && this.tablePrefix === undefined) {
      this.tablePrefix = this.config.prefix;
    }
  }
  /**
   * get model instance
   * @param  {String} name    [model name]
   * @param  {Object} options [options]
   * @return {Object}         []
   */
  model(name, options, module){
    if(think.isString(options)){
      module = options;
      options = {};
    }
    if(!module){
      let filename = this.__filename || __filename;
      let seps = filename.split('/').reverse();
      module = seps[2];
    }
    options = think.extend({}, this.config, options);
    return think.model(name, options, module);
  }
  /**
   * get table prefix
   * @return {String} []
   */
  getTablePrefix(){
    return this.tablePrefix || '';
  }
  /**
   * get config key
   * @return {} []
   */
  getConfigKey(){
    if(this._configKey){
      return this._configKey;
    }
    this._configKey = think.md5(JSON.stringify(this.config));
    return this._configKey;
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
    if (!thinkCache(thinkCache.DB, configKey)) {
      let db = think.adapter('db', this.config.type);
      let instance = new db(this.config);
      thinkCache(thinkCache.DB, configKey, instance);
    }
    this._db = thinkCache(thinkCache.DB, configKey);
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
    this.name = filename.substr(last + 1, filename.length - last - 4);
    return this.name;
  }
  /**
   * get table name
   * @return {String} []
   */
  getTableName(){
    if(!this.tableName){
      this.tableName = this.getModelName();
    }
    return this.getTablePrefix() + this.tableName;
  }
  /**
   * set cache options
   * @param  {String} key     []
   * @param  {Number} timeout []
   * @return {}         []
   */
  cache(key, timeout = this.config.cache.timeout){
    if (key === undefined) {
      return this;
    }
    let options;
    if(!think.isObject(key)){
      if(think.isNumber(key)){
        timeout = key;
        key = '';
      }
      options = think.extend({}, this.config.cache, {key, timeout});
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
    this._options.limit = [offset, length];
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
    if(think.isArray(page)){
      listRows = page[1] || listRows;
      page = page[0];
    }
    page = parseInt(page) || 1;
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
    if(!field){
      return this;
    }
    if (think.isString(field)) {
      field = field.split(/\s*,\s*/);
    }
    this._options.field = field;
    this._options.fieldReverse = reverse;
    return this;
  }
  /**
   * set field reverse
   * @param  {String} field [field list]
   * @return {Object}       []
   */
  fieldReverse(field){
    return this.field(field, true);
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
    this._options.table = hasPrefix ? table : this.getTablePrefix() + table;
    return this;
  }
  /**
   * union options
   * @param  {} union []
   * @param  {} all   []
   * @return {}       []
   */
  union(union, all = false){
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
  /**
   * set order options
   * @param  {String} value []
   * @return {}       []
   */
  order(value){
    this._options.order = value;
    return this;
  }
  /**
   * set table alias
   * @param  {String} value []
   * @return {}       []
   */
  alias(value){
    this._options.alias = value;
    return this;
  }
  /**
   * set having options
   * @param  {String} value []
   * @return {}       []
   */
  having(value){
    this._options.having = value;
    return this;
  }
  /**
   * set group options
   * @param  {String} value []
   * @return {}       []
   */
  group(value){
    this._options.group = value;
    return this;
  }
  /**
   * set lock options
   * @param  {String} value []
   * @return {}       []
   */
  lock(value){
    this._options.lock = value;
    return this;
  }
  /**
   * set auto options
   * @param  {String} value []
   * @return {}       []
   */
  auto(value){
    this._options.auto = value;
    return this;
  }
  /**
   * set filter options
   * @param  {String} value []
   * @return {}       []
   */
  filter(value){
    this._options.filter = value;
    return this;
  }
  /**
   * set distinct options
   * @param  {String} data []
   * @return {}      []
   */
  distinct(data){
    this._options.distinct = data;
    if (think.isString(data)) {
      this._options.field = data;
    }
    return this;
  }
  /**
   * set explain
   * @param  {Boolean} explain []
   * @return {}         []
   */
  explain(explain){
    this._options.explain = explain;
    return this;
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
   * data filter
   * @param  {Object} data []
   * @return {}      []
   */
  _dataFilter(data){
    return data;
  }
  /**
   * before add
   * @param  {Object} data []
   * @return {}      []
   */
  _beforeAdd(data){
    return data;
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
   * after delete
   * @param  {Mixed} data []
   * @return {}      []
   */
  _afterDelete(data){
    return data;
  }
  /**
   * before update
   * @param  {Mixed} data []
   * @return {}      []
   */
  _beforeUpdate(data){
    return data;
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
   * after find
   * @return {} []
   */
  _afterFind(data){
    return data;
  }
  /**
   * after select
   * @param  {Mixed} result []
   * @return {}        []
   */
  _afterSelect(data){
    return data;
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
    this._data = data;
    return this;
  }
  /**
   * set options
   * @param  {Mixed} options []
   * @return {}         []
   */
  options(options = {}){
    if (options === true) {
      return this._options;
    }
    this._options = options;
    //page to limit
    if(options.page){
      this.page(options.page);
    }
    return this;
  }
  /**
   * close db socket
   * @return {} []
   */
  close(){
    //remove db instance from cache store
    thinkCache(thinkCache.DB, this.getConfigKey(), null);
    if (this._db) {
      this._db.close();
      this._db = null;
    }
  }
}