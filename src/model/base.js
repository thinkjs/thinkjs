'use strict';

let util = require('util');
let querystring = require('querystring');
let Db = think.adapter('db', 'base');
let valid = think.require('valid');
/**
 * model base class
 * @type {Class}
 */
module.exports = class extends think.base {
  /**
   * constructor
   * @param  {} args []
   * @return {[type]}         []
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
    this.db = null;
    this.pk = 'id';
    this.name = name;
    this.config = config;
    this.configKey = '';
    this.tablePrefix = '';
    this.tableName = '';
    this.trueTableName = '';
    this._fields = {};
    this._data = {};
    this._options = {};
    this.fields = {};
    //table prefix
    if (this.config.prefix) {
      this.tablePrefix = this.config.prefix;
    }
  }
  /**
   * 初始化数据库连接
   * @return {[type]} [description]
   */
  initDb(){
    if (this.db) {
      return this.db;
    }
    let config = this.config;
    let configKey = think.md5(JSON.stringify(config));
    if (!dbInstances[configKey]) {
      dbInstances[configKey] = Db.getInstance(config);
    }
    this.db = dbInstances[configKey];
    this.configKey = configKey;
    return this.db;
  }
  /**
   * 获取模型名
   * @access public
   * @return string
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
   * 获取表名
   * @return {[type]} [description]
   */
  getTableName(){
    if (!this.trueTableName) {
      let tableName = this.tablePrefix || '';
      tableName += this.tableName || parseName(this.getModelName());
      this.trueTableName = tableName.toLowerCase();
    }
    return this.trueTableName;
  }
  /**
   * 获取数据表信息
   * @access protected
   * @return Promise
   */
  getTableFields(table, all){
    this.initDb();
    if (table === true) {
      table = undefined;
      all = true;
    }
    if (!think.isEmpty(this._fields)) {
      return getPromise(all ? this._fields : this._fields._field);
    }
    let tableName = table || this.getTableName();
    let fields = tableFieldsCache[tableName];
    if (!isEmpty(fields)) {
      this._fields = fields;
      return getPromise(all ? fields : fields._field);
    }
    let self = this;
    //从数据表里查询字段信息
    return this.flushFields(tableName).then(function(fields){
      self._fields = fields;
      if (C('db_fields_cache')) {
        tableFieldsCache[tableName] = fields;
      }
      return getPromise(all ? fields : fields._field);
    });  
  }
  /**
   * 获取数据表信息
   * @param  {[type]} table [description]
   * @return Promise       [description]
   */
  flushFields(table){
    table = table || this.getTableName();
    return this.initDb().getFields(table).then(function(data){
      let fields = {
        '_field': Object.keys(data),
        '_autoinc': false,
        '_unique': []
      };
      let types = {};
      for(let key in data){
        let val = data[key];
        types[key] = val.type;
        if (val.primary) {
          fields._pk = key;
          if (val.autoinc) {
            fields._autoinc = true;
          }
        }else if (val.unique) {
          fields._unique.push(key);
        }
      }
      fields._type = types;
      return fields;
    })
  }
  /**
   * 根据数据获取类型为唯一的字段
   * @return {[type]} [description]
   */
  getUniqueField(data){
    if (!data) {
      return this._fields._unique[0];
    }
    let fields = this._fields._unique;
    for(let i = 0, length = fields.length; i < length; i++){
      if (data[fields[i]]) {
        return fields[i];
      }
    }
  }
  /**
   * 获取上一次操作的sql
   * @return {[type]} [description]
   */
  getLastSql(){
    return this.initDb().getLastSql();
  }
  /**
   * 获取主键名称
   * @access public
   * @return string
   */
  getPk(){
    //如果fields为空，那么异步去获取
    if (isEmpty(this._fields)) {
      let self = this;
      return this.getTableFields().then(function(){
        return self._fields._pk || self.pk;
      })
    }
    return this._fields._pk || this.pk;
  }
  /**
   * 缓存
   * @param  {[type]} key    [description]
   * @param  {[type]} expire [description]
   * @param  {[type]} type   [description]
   * @return {[type]}        [description]
   */
  cache(key, timeout){
    if (key === undefined) {
      return this;
    }
    let options = this._getCacheOptions(key, timeout);
    this._options.cache = options;
    return this;
  }
  /**
   * 获取缓存的选项
   * @param  {[type]} key     [description]
   * @param  {[type]} timeout [description]
   * @return {[type]}         [description]
   */
  _getCacheOptions(key, timeout, type){
    if (think.isObject(key)) {
      return key;
    }
    if (isNumber(key)) {
      timeout = key;
      key = '';
    }
    //如果key为true，那么使用sql的md5值
    if (key === true) {
      key = '';
    }
    let cacheType = type === undefined ? C('db_cache_type') : type;
    let options = {
      key: key,
      timeout: timeout || C('db_cache_timeout'),
      type: cacheType,
      gcType: 'dbCache'
    }
    if (cacheType === 'File') {
      options.cache_path = C('db_cache_path');
    }
    return options;
  }
  /**
   * 指定查询数量
   * @param  {[type]} offset [description]
   * @param  {[type]} length [description]
   * @return {[type]}        [description]
   */
  limit(offset, length){
    if (offset === undefined) {
      return this;
    }
    this._options.limit = length === undefined ? offset : offset + ',' + length;
    return this;
  }
  /**
   * 指定分页
   * @return {[type]} [description]
   */
  page(page, listRows){
    if (page === undefined) {
      return this;
    }
    this._options.page = listRows === undefined ? page : page + ',' + listRows;
    return this;
  }
  /**
   * where条件
   * @return {[type]} [description]
   */
  where(where){
    if (!where) {
      return this;
    }
    if (isString(where)) {
      where = {_string: where};
    }
    this._options.where = think.extend(this._options.where || {}, where);
    return this;
  }
  /**
   * 要查询的字段
   * @param  {[type]} field   [description]
   * @param  {[type]} reverse [description]
   * @return {[type]}         [description]
   */
  field(field, reverse){
    if (think.isArray(field)) {
      field = field.join(',');
    }else if (!field) {
      field = '*';
    }
    this._options.field = field;
    this._options.fieldReverse = reverse;
    return this;
  }
  /**
   * 设置表名
   * @param  {[type]} table [description]
   * @return {[type]}       [description]
   */
  table(table, hasPrefix){
    if (!table) {
      return this;
    }
    this._options.table = hasPrefix ? table : this.tablePrefix + table;
    return this;
  }
  /**
   * 联合查询
   * @return {[type]} [description]
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
   * 联合查询
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
    if (isArray(join)) {
      this._options.join = this._options.join.concat(join);
    }else{
      this._options.join.push(join);
    }
    return this;
  }
  /**
   * 生成查询SQL 可用于子查询
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  buildSql(options){
    let self = this;
    return this.parseOptions(options).then(function(options){
      return '( ' + self.db.buildSelectSql(options).trim() + ' )';
    });
  }
  /**
   * 解析参数
   * @param  {[type]} options [description]
   * @return promise         [description]
   */
  parseOptions(oriOpts, extraOptions){
    let options;
    if (isScalar(oriOpts)) {
      options = extend({}, this._options);
    }else{
      options = extend({}, this._options, oriOpts, extraOptions);
    }
    //查询过后清空sql表达式组装 避免影响下次查询
    this._options = {};
    //获取表名
    let table = options.table = options.table || this.getTableName();
    //表前缀，Db里会使用
    options.tablePrefix = this.tablePrefix;
    options.model = this.getModelName();
    //数据表别名
    if (options.alias) {
      options.table += ' AS ' + options.alias;
    }
    let promise = this.getTableFields(table).then(function(fields){
      if (isScalar(oriOpts)) {
        options = extend(options, self.parseWhereOptions(oriOpts), extraOptions);
      }
      return fields;
    })
    let self = this;
    return promise.then(function(fields){
      // 字段类型验证
      if (isObject(options.where) && !isEmpty(fields)) {
        let keyReg = /[\.\|\&]/;
        // 对数组查询条件进行字段类型检查
        for(let key in options.where){
          let val = options.where[key];
          key = key.trim();
          if (fields.indexOf(key) > -1) {
            if (isScalar(val) || !val) {
              options.where[key] = self.parseType(options.where, key)[key];
            }
          }else if(key[0] !== '_' && !keyReg.test(key)){ //字段名不合法，报错
            return getPromise(new Error('field `' + key + '` in where condition is not valid'), true);
          }
        }
      }
      //field反选
      if (options.field && options.fieldReverse) {
        //fieldReverse设置为false
        options.fieldReverse = false;
        let optionsField = options.field.split(',');
        options.field = fields.filter(function(item){
          if (optionsField.indexOf(item) > -1) {
            return;
          }
          return item;
        }).join(',');
      }
      return self._optionsFilter(options, fields);
    });
  }
  /**
   * 选项过滤器
   * 具体的Model类里进行实现
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  _optionsFilter(options){
    return options;
  }
  /**
   * 数据类型检测
   * @param  {[type]} data [description]
   * @param  {[type]} key  [description]
   * @return {[type]}      [description]
   */
  parseType(data, key){
    let fieldType = this._fields._type[key] || '';
    if (fieldType.indexOf('bigint') === -1 && fieldType.indexOf('int') > -1) {
      data[key] = parseInt(data[key], 10) || 0;
    }else if(fieldType.indexOf('double') > -1 || fieldType.indexOf('float') > -1){
      data[key] = parseFloat(data[key]) || 0.0;
    }else if(fieldType.indexOf('bool') > -1){
      data[key] = !! data[key];
    }
    return data;
  }
  /**
   * 对插入到数据库中的数据进行处理，要在parseOptions后执行
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  parseData(data){
    //因为会对data进行修改，所以这里需要深度拷贝
    data = think.extend({}, data);
    let key;
    if (!isEmpty(this._fields)) {
      for(key in data){
        let val = data[key];
        if (this._fields._field.indexOf(key) === -1) {
          delete data[key];
        }else if(isScalar(val)){
          data = this.parseType(data, key);
        }
      }
    }
    //安全过滤
    if (isFunction(this._options.filter)) {
      for(key in data){
        let ret = this._options.filter.call(this, key, data[key]);
        if (ret === undefined) {
          delete data[key];
        }else{
          data[key] = ret;
        }
      }
      delete this._options.filter;
    }
    data = this._dataFilter(data);
    return data;
  }
  /**
   * 数据过滤器
   * 具体的Model类里进行实现
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  _dataFilter(data){
    return data;
  }
  /**
   * 检测数据是否合法
   * @return {[type]} [description]
   */
  _validData(data){
    if (isEmpty(this.fields) || isEmpty(data)) {
      return data;
    }
    let field, value, checkData = [];
    for(field in data){
      if (field in this.fields) {
        value = extend({}, this.fields[field], {name: field, value: data[field]});
        checkData.push(value);
      }
    }
    if (isEmpty(checkData)) {
      return data;
    }
    let result = Valid(checkData);
    if (isEmpty(result)) {
      return data;
    }
    let json_message = JSON.stringify(result);
    let err = new Error(json_message.slice(1, -1));
    err.json_message = json_message;
    return getPromise(err, true);
  }
  /**
   * 数据插入之前操作，可以返回一个promise
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  _beforeAdd(data){
    return this._validData(data);
  }
  /**
   * 数据插入之后操作，可以返回一个promise
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  _afterAdd(data){
    return data;
  }
  /**
   * 添加一条数据
   * @param {[type]} data    [description]
   * @param {[type]} options [description]
   * @param int 返回插入的id
   */
  async add(data, options, replace){
    if (options === true) {
      replace = true;
      options = {};
    }
    //copy data
    data = think.extend({}, this._data, data);
    this._data = {};
    if (think.isEmpty(data)) {
      return Promise.reject(new Error('_DATA_TYPE_INVALID_'));
    }
    //解析后的选项
    let parsedOptions = await this.parseOptions(options);
    //解析后的数据
    let parsedData = await this._beforeAdd(data, parsedOptions);
    data = this.parseData(data);
    await this.db.insert(data, parsedOptions, replace);
    let insertId = parsedData[this.getPk()] = this.db.getLastInsertId();
    await this._afterAdd(parsedData, parsedOptions);
    return insertId;
  }
  /**
   * 如果当前条件的数据不存在，才添加
   * @param  {[type]} data      要插入的数据
   * @param  {[type]} where      where条件
   * @param  boolean returnType 返回值是否包含type
   * @return {[type]}            promise
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
   * 插入多条数据
   * @param {[type]} data    [description]
   * @param {[type]} options [description]
   * @param {[type]} replace [description]
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
   * 删除后续操作
   * @return {[type]} [description]
   */
  _afterDelete(data){
    return data;
  }
  /**
   * 删除数据
   * @return {[type]} [description]
   */
  async delete(options){
    options = await this.parseOptions(options);
    let rows = await this.db.delete(options);
    await this._afterDelete(options.where || {}, options);
    return rows;
  }
  /**
   * 更新前置操作
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  _beforeUpdate(data){
    return this._validData(data);
  }
  /**
   * 更新后置操作
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
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
    this._data = {};
    if (think.isEmpty(data)) {
      return Promise.reject(new Error('_DATA_TYPE_INVALID_'));
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
        return Promise.reject(new Error('_OPERATION_WRONG_'));
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
      return Promise.reject(new Error('_DATA_TYPE_INVALID_'));
    }
    let promises = dataList.map(data => {
      return this.update(data);
    });
    return Promise.all(promises);
  }
  /**
   * 更新某个字段的值
   * @param  {[type]} field [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
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
   * 字段值增长
   * @return {[type]} [description]
   */
  updateInc(field, step){
    step = parseInt(step, 10) || 1;
    return this.updateField(field, ['exp', field + '+' + step]);
  }
  /**
   * 字段值减少
   * @return {[type]} [description]
   */
  updateDec(field, step){
    step = parseInt(step, 10) || 1;
    return this.updateField(field, ['exp', field + '-' + step]);
  }
  /**
   * 解析options中简洁的where条件
   * @return {[type]} [description]
   */
  parseWhereOptions(options){
    if (think.isNumber(options) || think.isString(options)) {
      let pk = this.getPk();
      options += '';
      let where = {};
      if (options.indexOf(',') > -1) {
        where[pk] = ['IN', options];
      }else{
        where[pk] = options;
      }
      options = {
        where: where
      };
    }
    return options || {};
  }
  /**
   * find查询后置操作
   * @return {[type]} [description]
   */
  _afterFind(result){
    return result;
  }
  /**
   * 查询一条数据
   * @return 返回一个promise
   */
  async find(options){
    options = await this.parseOptions(options, {limit: 1});
    let data = await this.db.select(options);
    return this._afterFind(data[0] || {}, options);
  }
  /**
   * 查询后置操作
   * @param  {[type]} result  [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  _afterSelect(result){
    return result;
  }
  /**
   * 查询数据
   * @return 返回一个promise
   */
  async select(options){
    options = await this.parseOptions(options);
    let data = this.db.select(options);
    return this._afterSelect(data, options);
  }
  /**
   * 查询添加
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  selectAdd(options){
    let self = this;
    let promise = getPromise(options);
    if (options instanceof Model) {
      promise = options.parseOptions();
    }
    return Promise.all([this.parseOptions(), promise]).then(function(data){
      let fields = data[0].field || self._fields._field;
      return self.db.selectAdd(fields, data[0].table, data[1]);
    });
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
   * 获取某个字段下的记录
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
      fields.forEach(item => result[item] = [])
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
   * 根据某个字段值获取一条数据
   * @param  {[type]} name  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  getBy(name, value){
    return this.where({[name]: value}).find();
  }
  /**
   * SQL查询
   * @return {[type]} [description]
   */
  async query(sql, parse){
    if (parse !== undefined && !think.isBoolean(parse) && !think.isArray(parse)) {
      parse = [].slice.call(arguments, 1);
    }
    sql = this.parseSql(sql, parse);
    let data = await this.initDb().select(sql, this._options.cache);
    this._options = {};
    return data;
  }
  /**
   * 执行SQL语法，非查询类的SQL语句，返回值为影响的行数
   * @param  {[type]} sql   [description]
   * @param  {[type]} parse [description]
   * @return {[type]}       [description]
   */
  execute(sql, parse){
    if (parse !== undefined && !think.isBoolean(parse) && !think.isArray(parse)) {
      parse = [].slice.call(arguments, 1);
    }
    sql = this.parseSql(sql, parse);
    return this.initDb().execute(sql);
  }
  /**
   * 解析SQL语句
   * @return promise [description]
   */
  parseSql(sql, parse){
    if (parse === undefined) {
      parse = [];
    }else if(!think.isArray(parse)){
      parse = [parse];
    }
    parse.unshift(sql);
    sql = util.format.apply(null, parse);
    let map = {
      '__TABLE__': '`' + this.getTableName() + '`'
    };
    sql = sql.replace(/__([A-Z]+)__/g, (a, b) => {
      return map[a] || ('`' + this.tablePrefix + b.toLowerCase() + '`');
    });
    return sql;
  }
  /**
   * 启动事务
   * @return {[type]} [description]
   */
  async startTrans(){
    await this.initDb().commit();
    return this.initDb().startTrans();
  }
  /**
   * 提交事务
   * @return {[type]} [description]
   */
  commit(){
    return this.initDb().commit();
  }
  /**
   * 回滚事务
   * @return {[type]} [description]
   */
  rollback(){
    return this.initDb().rollback();
  }
  /**
   * 设置数据对象值
   * @return {[type]} [description]
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
   * 设置操作选项
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  options(options){
    if (options === true) {
      return this._options;
    }
    this._options = options;
    return this;
  }
  /**
   * 关闭数据库连接
   * @return {[type]} [description]
   */
  close(){
    delete dbInstances[this.configKey];
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/*.extend(function(){
  'use strict';
  //追加的方法
  let methods = {};
  // 链操作方法列表
  let methodNameList = [
    'order','alias','having','group',
    'lock','auto','filter','validate'
  ];
  methodNameList.forEach(function(item){
    methods[item] = function(data){
      this._options[item] = data;
      return this;
    };
  });
  methods.distinct = function(data){
    this._options.distinct = data;
    //如果传过来一个字段，则映射到field上
    if (isString(data)) {
      this._options.field = data;
    }
    return this;
  };
  ['count','sum','min','max','avg'].forEach(function(item){
    methods[item] = function(field){
      field = field || this.pk;
      return this.getField(item.toUpperCase() + '(' + field + ') AS thinkjs_' + item, true);
    };
  });
  //方法别名
  let aliasMethodMap = {
    update: 'save',
    updateField: 'setField',
    updateInc: 'setInc',
    updateDec: 'setDec'
  };
  Object.keys(aliasMethodMap).forEach(function(key){
    let value = aliasMethodMap[key];
    methods[value] = function(){
      return this[key].apply(this, arguments);
    };
  });
  return methods;
});
/**
 * 关闭所有的数据库连接
 * @return {[type]} [description]
 */
// Model.close = function(){
//   'use strict';
//   for(let key in dbInstances) {
//     dbInstances[key].close();
//   }
//   dbInstances = {};
// };
// *
//  * 清除数据表字段缓存
//  * @return {[type]} [description]
 
// Model.clearTableFieldsCache = function(){
//   'use strict';
//   tableFieldsCache = {};
// }