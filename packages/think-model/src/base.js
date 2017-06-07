const path = require('path');
const helper = require('think-helper');
const values = require('./lib/values');
const MysqlInstance = require('./mysql/instance');


module.exports = class {
  /**
   * constructor
   * @param  {} name   []
   * @param  {} config []
   * @return {}        []
   */
  constructor(name = '', config = {}){

    let options = {
      pk: 'id', //primary key
      name: '', //model name
      tablePrefix: undefined, //table prefix
      tableName: '', //table name, without prefix
      /**
       * schema
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
      schema: {}, //table schema
      // /**
      //  * table indexes
      //  * {
      //  *   name: {name: 1, $unique: true}, //single indexes
      //  *   test1: {name1: 1, title1: 1, $unique: 1}, //compound indexes
      //  * }
      //  * @type {Object}
      //  */
      // indexes: {}
    };
    //if is set in subclass, can't be override
    for(let key in options){
      if(this[key] === undefined){
        this[key] = options[key];
      }
    }

    if(helper.isObject(name)){
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
   * @return {Object}         []
   */
  model(name) {
    if(!name) {
      return this;
    }
    let model = this.config.models[name];
    if(model) {
      return new model(name, this.config);
    }
    return new this.constructor(name, this.config);
  }
  /**
   * get table prefix
   * @return {String} []
   */
  getTablePrefix(){
    return this.tablePrefix || '';
  }
  /**
   * get db lib
   * @return {Object} []
   */
  getDB() {
    return MysqlInstance;
  }
  /**
   * get db instance
   * @return {Object} []
   */
  db(db){
    // set db
    if(db){
      if('lastInsertId' in db){
        this._db = db;
      }else{
        this.options.connection = db;
      }
      return this;
    }
    if (this._db && !this.config.parser) {
      return this._db;
    }
    let DB = this.getDB();
    this._db = new DB(this.config);
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
    let last = filename.lastIndexOf(path.sep);
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
  cache(key, config){
    if (key === undefined) {
      return this;
    }
    
    if(!helper.isString(key)) {
      [key, config] = ['', key];
    }

    if(helper.isNumber(config)) {
      config = {timeout: config};
    }
    
    let options = helper.parseAdapterConfig(this.config.cache, config);
    if(!options.key) { options.key = key; }
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
    if(helper.isArray(offset)){
      length = offset[1] || length;
      offset = offset[0];
    }
    offset = Math.max(parseInt(offset) || 0, 0);
    if(length){
      length = Math.max(parseInt(length) || 0, 0);
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
  page(page, listRows = this.config.pagesize){
    if (page === undefined) {
      return this;
    }
    if(helper.isArray(page)){
      listRows = page[1] || listRows;
      page = page[0];
    }
    page = Math.max(parseInt(page) || 1, 1);
    listRows = Math.max(parseInt(listRows) || 10, 1);
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
    if (helper.isString(where)) {
      where = {_string: where};
    }
    let options = this._options;
    if(options.where && helper.isString(options.where)){
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
  field(field, reverse = false){
    if(!field){
      return this;
    }
    if (helper.isString(field)) {
      if(field.indexOf(')') === -1){
        field = field.split(/\s*,\s*/);
      }
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
    if (helper.isArray(join)) {
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
    if (helper.isString(data)) {
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
  optionsFilter(options){
    return options;
  }
  /**
   * data filter
   * @param  {Object} data []
   * @return {}      []
   */
  dataFilter(data){
    return data;
  }
  /**
   * before add
   * @param  {Object} data []
   * @return {}      []
   */
  beforeAdd(data, options, schema){
     
    //for addMany invoked
    if(helper.isArray(data)){
      return data.map(item => this.beforeAdd(item, options));
    }

    let ret = {};
    let extRet = {};
    schema = schema || this.schema;
    //fields in schema
    for(let field in schema){
      let fieldSchema = schema[field];
      let _default = fieldSchema.default;
      //default value is setted
      if(!helper.isTrueEmpty(_default)){
        ret[field] = {
          value: data[field],
          default: _default
        };
      }else{
        if(this._isSubSchema(fieldSchema)){
          extRet[field] = this.beforeAdd(data[field] || {}, options, fieldSchema);
        }
      }
    }
    for(let field in data){
      if(!ret[field] && !extRet[field]){
        ret[field] = {
          value: data[field]
        };
      }
    }
    ret = values(ret);
    if(!helper.isEmpty(extRet)){
      ret = helper.extend(ret, extRet);
    }
    return ret;
  }
  /**
   * check is sub schema
    // meta: {
    //   createAt: {
    //     default: ()=>new Date()
    //   },
    //   updateAt: {
    //     default: ()=>new Date()
    //   }
    // }
   * @param  {Mixed}  schema []
   * @return {Boolean}        []
   */
  _isSubSchema(schema){
    if(!schema || !helper.isObject(schema)){
      return false;
    }
    let keys = Object.keys(schema);
    return keys.length && keys.every(key => helper.isObject(schema[key]));
  }
  /**
   * after add
   * @param  {} data []
   * @return {}      []
   */
  afterAdd(data){
    return data;
  }
  /**
   * before delete
   */
  beforeDelete(options){
    return options;
  }
  /**
   * after delete
   * @param  {Mixed} data []
   * @return {}      []
   */
  afterDelete(data){
    return data;
  }
  /**
   * before update
   * @param  {Mixed} data []
   * @return {}      []
   */
  beforeUpdate(data, options, schema){
    let ret = {};
    let extRet = {};
    schema = schema || this.schema;

    for(let field in data){
      let fieldSchema = schema[field];
      if(!fieldSchema){
        ret[field] = {value: data[field]};
      }else{
        if(this._isSubSchema(fieldSchema)){
          let result = this.beforeUpdate(data[field] || {}, options, fieldSchema);
          if(!helper.isEmpty(result)){
            extRet[field] = result;
          }
        }else if(!fieldSchema.readonly){
          ret[field] = {value: data[field]};
        }
      }
    }

    for(let field in schema){
      let fieldSchema = schema[field];
      let _default = fieldSchema.default;
      if(!helper.isTrueEmpty(_default) && !fieldSchema.readonly && fieldSchema.update){
        ret[field] = {
          value: data[field],
          default: _default
        };
      }else if(this._isSubSchema(fieldSchema)){
        let result = this.beforeUpdate(data[field] || {}, options, fieldSchema);
        if(!helper.isEmpty(result)){
          extRet[field] = result;
        }
      }
    }
    ret = values(ret);
    if(!helper.isEmpty(extRet)){
      ret = helper.extend(ret, extRet);
    }
    return ret;
  }
  /**
   * after update
   * @param  {} data    []
   * @param  {} options []
   * @return {}         []
   */
  afterUpdate(data){
    return data;
  }
  /**
   * before find
   */
  beforeFind(options){
    return options;
  }
  /**
   * after find
   * @return {} []
   */
  afterFind(data){
    return data;
  }
  /**
   * before select
   */
  beforeSelect(options){
    return options;
  }
  /**
   * after select
   * @param  {Mixed} result []
   * @return {}        []
   */
  afterSelect(data){
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
  options(options){
    if (!options) {
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
    if (this._db) {
      this._db.close();
      this._db = null;
    }
  }
  
}