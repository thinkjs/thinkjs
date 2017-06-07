const util = require('util');
const helper = require('think-helper');
const Base = require('../base');

/**
 * base model class
 */
module.exports = class extends Base {
  /**
   * get table schema
   * @param  {String} table [table name]
   * @return {}       []
   */
  async getSchema(table){
    table = table || this.getTableName();
    let schema = await this.db().getSchema(table);

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
    this.schema = helper.extend({}, schema, this.schema);
    return this.schema;
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
   * @param oriOpts options
   * @param extraOptions 
   * @param flag 
   */
  async parseOptions(oriOpts, extraOptions, flag = false){
    let options = helper.extend({}, this._options);
    if(helper.isObject(oriOpts)) {
      options = helper.extend(options, oriOpts);
    }
    if(extraOptions){
      options = helper.extend(options, extraOptions);
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

    if(oriOpts !== undefined && !helper.isObject(oriOpts)){
      options = helper.extend(options, this.parseWhereOptions(oriOpts));
    }
    //check where key
    if(options.where && !helper.isEmpty(schema)){
      let keyReg = /^[\w\.\|\&]+$/;
      for(let key in options.where){
        if(!keyReg.test(key)){
          // let msg = new Error(think.locale('FIELD_KEY_NOT_VALID', key));
          // return Promise.reject(msg);
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


    if(flag){
      let camelCase = this.config.camel_case || false;
      if(camelCase){
        if(helper.isEmpty(options.field)){
          options.field = [];
          let keyArray = Object.keys(schema);
          for (let key of keyArray) {
            options.field.push(util.format('`%s` AS `%s`', key, helper.camelCase(key)));
          }
        } else {
          // make field camelCase
          let fields = options.field;
          options.field = [];
          for (let field of fields) {
            options.field.push(util.format('`%s` AS `%s`', field, helper.camelCase(field)));
          }
        }

        // make field camelCase in where condition
        let where = options.where;
        options.where = {};
        if(!helper.isEmpty(where)){
          let keyArray = Object.keys(where);
          for (let key of keyArray) {
            options.where[helper.snakeCase(key)] = where[key];
          }
        }
      }
    }
    
    return this.optionsFilter(options, schema);
  }
  /**
   * parse where options
   * @return {Object}
   */
  parseWhereOptions(options){
    if (helper.isNumber(options) || helper.isString(options)) {
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
    let fieldType = (this.schema[key].type || '').toLowerCase();
    if(fieldType.indexOf('enum') > -1 || fieldType.indexOf('set') > -1){
      return value;
    }
    if (fieldType.indexOf('bigint') === -1 && fieldType.indexOf('int') > -1) {
      return parseInt(value, 10) || 0;
    }else if(fieldType.indexOf('double') > -1 || fieldType.indexOf('float') > -1 || fieldType.indexOf('decimal') > -1){
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
    let camelCase = this.config.camel_case;
    if(camelCase){
      let tmpData = helper.extend({}, data);
      data = {};
      let keyArray = Object.keys(tmpData);
      for (let key of keyArray) {
        data[helper.snakeCase(key)] = tmpData[key];
      }
    }
    //deep clone data
    data = helper.extend({}, data);
    for(let key in data){
      let val = data[key];
      //remove data not in fields
      if (!this.schema[key]) {
        delete data[key];
      }else if(helper.isNumber(val) || helper.isString(val) || helper.isBoolean(val)){
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
    data = helper.extend({}, this._data, data);
    //clear data
    this._data = {};

    options = await this.parseOptions(options, {}, true);

    let parsedData = this.parseData(data);
    parsedData = await this.beforeAdd(parsedData, options);
    if (helper.isEmpty(parsedData)) {
      throw new Error('DATA_EMPTY');
    }

    let db = this.db();
    await db.add(parsedData, options, replace);
    let insertId = parsedData[this.pk] = db.getLastInsertId();
    let copyData = helper.extend({}, data, parsedData, {[this.pk]: insertId});
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
    if(!helper.isEmpty(findData)){
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
    if(helper.isEmpty(findData)){
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
    if (!helper.isArray(data) || !helper.isObject(data[0])) {
      throw new Error('DATA_MUST_BE_ARRAY');
    }
    if (options === true) {
      replace = true;
      options = {};
    }
    options = await this.parseOptions(options, {}, true);
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
    options = await this.parseOptions(options, {}, true);
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

    data = helper.extend({}, this._data, data);
    //clear data
    this._data = {};

    options = await this.parseOptions(options, {}, true);

    let parsedData = this.parseData(data);

    //check where condition
    if(helper.isEmpty(options.where)){
      //get where condition from data
      let pk = await this.getPk();
      if(parsedData[pk]){
        options.where = {[pk]: parsedData[pk]};
        delete parsedData[pk];
      }else{
        throw new Error('MISS_WHERE_CONDITION');
      }
    }

    parsedData = await this.beforeUpdate(parsedData, options);
    //check data is empty
    if (helper.isEmpty(parsedData)) {
      throw new Error('DATA_EMPTY');
    }

    let rows = await this.db().update(parsedData, options);
    let copyData = helper.extend({}, data, parsedData);
    await this.afterUpdate(copyData, options);
    return rows;
  }
  /**
   * update all data
   * @param  {Array} dataList []
   * @return {Promise}          []
   */
  updateMany(dataList, options){
    if (!helper.isArray(dataList)) {
      //empty data and options
      this._options = {};
      this._data = {};

      throw new Error('DATA_MUST_BE_ARRAY');
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
    options = await this.parseOptions(options, {limit: 1}, true);
    options = await this.beforeFind(options);
    let data = await this.db().select(options);
    return this.afterFind(data[0] || {}, options);
  }
  /**
   * select
   * @return Promise
   */
  async select(options){
    options = await this.parseOptions(options, {}, true);
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
    if (helper.isBoolean(options)) {
      pageFlag = options;
      options = {};
    }else if(helper.isNumber(options)){
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

    options.limit = options.limit || [0, this.config.pagesize || 10];
    //recover the deleted possible order
    options.order = order;
    let numsPerPage = options.limit[1];
    //get page options
    let data = {numsPerPage: numsPerPage};
    let totalPage = Math.ceil(count / data.numsPerPage);

    data.currentPage = parseInt((options.limit[0] / options.limit[1]) + 1);

    if (helper.isBoolean(pageFlag) && data.currentPage > totalPage) {
      if(pageFlag){
        data.currentPage = 1;
        options.limit = [0, numsPerPage];
      }else{
        data.currentPage = totalPage;
        options.limit = [(totalPage - 1) * numsPerPage, numsPerPage];
      }
    }
    let result = helper.extend({count: count, totalPages: totalPage}, data);

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
    if (helper.isNumber(one)) {
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
  startTrans(connection){
    return this.db().startTrans(connection);
  }
  /**
   * commit transcation
   * @return {Promise} []
   */
  commit(connection){
    return this.db().commit(connection);
  }
  /**
   * rollback transaction
   * @return {Promise} []
   */
  rollback(connection){
    return this.db().rollback(connection);
  }
  /**
   * transaction exec functions
   * @param  {Function} fn [async exec function]
   * @return {Promise}      []
   */
  transaction(fn, connection){
    return this.db().transaction(fn, connection);
  }
};