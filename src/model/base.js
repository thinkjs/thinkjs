'use strict';

var util = require('./util.js');

module.exports = think.Class({
  /**
   * primary key
   * @type {String}
   */
  pk: 'id',
  /**
   * model name
   * @type {String}
   */
  name: '',
  /**
   * prefix
   * @type {String}
   */
  tablePrefix: '',
  /**
   * table name
   * @type {String}
   */
  tableName: '',
  /**
   * table name with prefix
   * @type {String}
   */
  trueTableName: '',
  /**
   * db instance
   * @type {[type]}
   */
  _db: null,
  /**
   * options
   * @type {Object}
   */
  _options: {},
  /**
   * table fields
   * @type {Object}
   */
  fields: {},
  /**
   * init method
   * @param  {String} name   [model name]
   * @param  {Object} config [configs]
   * @return {}        []
   */
  init: function(name, config){
    // if (think.isObject(name)) {
    //   config = name;
    //   name = '';
    // }
    if (name) {
      this.name = name;
    }
    this.config = think.extend({}, think.config('db'), config);
    if (!this.tablePrefix) {
      this.tablePrefix = this.config.prefix;
    }
  },
  /**
   * get db instance
   * @return {Object} []
   */
  db: function(){
    if (!this._db) {
      this._db = util.getDbInstance(this.config);
    }
    return this._db;
  },
  /**
   * get model name
   * @return {String} []
   */
  getModelName: function(){
    if (!this.name) {
      var filename = this.__filename || __filename;
      var last = filename.lastIndexOf('/');
      this.name = filename.substr(last + 1, filename.length - last - 3);
    }
    return this.name;
  },
  /**
   * get table name
   * @return {String} []
   */
  getTableName: function(){
    if (!this.trueTableName) {
      this.trueTableName = this.tablePrefix + (this.tableName || this.getModelName());
    }
    return this.trueTableName;
  },
  /**
   * get last sql
   * @return {String} []
   */
  getLastSql: function(){
    return this.db().getLastSql();
  },
  /**
   * cache sql data
   * @param  {String} key     [cache key]
   * @param  {Object} options [cache options]
   * @return {Object}         []
   */
  cache: function(key, options){
    if (key === undefined) {
      return this;
    }
    this._options.cache = util.getCacheOptions(key, options, this.config);
    return this;
  },
  /**
   * limit
   * @param  {Number} offset []
   * @param  {} length []
   * @return {}        []
   */
  limit: function(offset, length){
    if (offset === undefined) {
      return this;
    }
    if (length === undefined) {
      this._options.limit = [offset];
    }else{
      this._options.limit = [offset, length];
    }
    return this;
  },
  /**
   * page
   * @param  {int} page     [current page, from 1]
   * @param  {[]} listRows [nums on page]
   * @return {}          []
   */
  page: function(page, listRows){
    page = page || 1;
    listRows = listRows || this.config.page_nums;
    this._options.limit = [offset, listRows * (page - 1)];
    return this;
  },
  /**
   * where condition
   * @param  {Mixed} where []
   * @return {}       []
   */
  where: function(where){
    if (!where) {
      return this;
    }
    if (think.isString(where)) {
      where = {
        _string: where
      }
    }
    this._options.where = think.extend(this._options.where, where);
    return this;
  },
  /**
   * set select field
   * @param  {String} field   [fields list]
   * @param  {Boolean} reverse [reverse fields]
   * @return {}         []
   */
  field: function(field, reverse){
    if (!field) {
      return this;
    }
    this._options.field = field;
    this._options.fieldReverse = reverse;
    return this;
  },
  /**
   * set table
   * @param  {String} table []
   * @return {}       []
   */
  table: function(table){
    if (!table) {
      return this;
    }
    //also has table prefix
    if (this.tablePrefix && table.indexOf(this.tablePrefix) === 0) {
      this._options.table = table;
    }
    //table is sql, like `(SELECT * FROM XXX)`
    else if (table.indexOf(' ') > -1) {
      this._options.table = table;
    }
    //auto add table prefix for table
    else{
      this._options.table = this.tablePrefix + table;
    }
    return this;
  },
  /**
   * set union options
   * @param  {String} union []
   * @param  {Boolean} all   []
   * @return {}       []
   */
  union: function(union, all){
    if (!union) {
      return this;
    }
    if (!this._options.union) {
      this._options.union = [];
    }
    tihs.options.union.push({
      union: union,
      all: all
    })
    return this;
  },
  /**
   * set join options
   * @param  {String} join []
   * @return {}      []
   */
  join: function(join){
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
  },
  /**
   * get select sql
   * @param  {Object} options []
   * @return {Promise}         []
   */
  buildSql: function(options){
    var self = this;
    return this.parseOptions(options).then(function(options){
      return '( ' + self.db.buildSelectSql(options).trim() + ' )';
    });
  },
  /**
   * parse simple where options
   * @param  {Mixed} options []
   * @return {}         []
   */
  parseWhereOptions: function(options){
    if (!options || think.isObject(options)) {
      return options;
    }
    var where = think.getObject(this.pk, {
      IN: options
    });
    return {
      where: where
    }
  },
  /**
   * parse options
   * @param  {Mixed} options      []
   * @param  {Mixed} extraOptions []
   * @return {}              []
   */
  parseOptions: function(options, extraOptions){
    options = this.parseWhereOptions(options);
    options = think.extend({}, this._options, options, extraOptions);
    //set this.options empty
    this._options = {};

  }
}, true);