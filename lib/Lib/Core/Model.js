var util = require('util');
var querystring = require('querystring');

//数据库实例化对象
var dbInstances = {};
//数据表的字段信息
var tableFields = {};
//db缓存数据
var dbCacheData = {};

/**
 * Model类
 * @type {[type]}
 */
var Model = module.exports = Class(function(){
  'use strict';
  //解析page参数
  var parsePage = function(options){
    if ('page' in options) {
      var page = options.page + '';
      var num = 0;
      if (page.indexOf(',') > -1) {
        page = page.split(',');
        num = parseInt(page[1], 10);
        page = page[0];
      }
      num = num || C('db_nums_per_page');
      page = parseInt(page, 10) || 1;
      return {
        page: page,
        num: num
      };
    }
    return {
      page: 1,
      num: C('db_nums_per_page')
    };
  };
  /**
   * 字符串命名风格转换
   * @param  {[type]} name [description]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  var parseName = function(name, type){
    name = (name + '').trim();
    if (type) {
      name = name.replace(/_([a-zA-Z])/g, function(a, b){
        return b.toUpperCase();
      });
      return name.substr(0, 1).toUpperCase() + name.substr(1);
    } else {
      //首字母如果是大写，不转义为_x
      if (name.length >= 1) {
        name = name.substr(0, 1).toLowerCase() + name.substr(1);
      }
      return name.replace(/[A-Z]/g, function(a){
        return '_' + a;
      }).toLowerCase();
    }
  };

  return {
    // 当前数据库操作对象
    db: null,
    // 主键名称
    pk: 'id',
    // 数据表前缀
    tablePrefix: '',
    // 数据库配置信息
    config: null,
    // 配置信息key
    configKey: '',
    // 模型名称
    name: '',
    // 数据库名称
    dbName: '',
    // 数据表名（不包含表前缀）
    tableName: '',
    // 实际数据表名（包含表前缀）
    trueTableName: '',
    // 数据表子度信息
    fields: {},
    // 数据信息
    _data: {},
    // 参数
    _options: {},
    /**
     * 取得DB类的实例对象 字段检查
     * @access public
     * @param string $name 模型名称
     * @param string $tablePrefix 表前缀
     * @param mixed config 数据库连接信息
     */
    init: function(name, tablePrefix, config){
      // 获取模型名称
      if (name) {
        if (name.indexOf('.') > -1) {
          name = name.split('.');
          this.dbName = name[0];
          this.name = name[1];
        }else{
          this.name = name;
        }
      }else if(!this.name){
        this.getModelName();
      }
      if (!isString(tablePrefix)) {
        config = tablePrefix;
        tablePrefix = undefined;
      }
      this.config = config || '';
      //设置数据表前缀
      if (tablePrefix || this.config.db_prefix) {
        this.tablePrefix = tablePrefix || this.config.db_prefix;
      }else{
        if (!this.tablePrefix) {
          this.tablePrefix = C('db_prefix');
        }
      }
      //子类的init方法
      if (this._init) {
        this._init();
      }
    },
    /**
     * 初始化数据库连接
     * @access public
     * @param integer $linkNum  连接序号
     * @param mixed $config  数据库连接信息
     * @param array $params  模型参数
     * @return Model
     */
    initDb: function(){
      if (this.db) {
        return this.db;
      }
      var config = this.config;
      var configKey = md5(JSON.stringify(config));
      if (!dbInstances[configKey]) {
        if (config && isString(config) && config.indexOf('/') === -1) {
          config = C(config);
        }
        dbInstances[configKey] = thinkRequire('Db').getInstance(config);
      }
      this.db = dbInstances[configKey];
      this.configKey = configKey;
      return this.db;
    },
    /**
     * 获取模型名
     * @access public
     * @return string
     */
    getModelName: function(){
      if (this.name) {
        return this.name;
      }
      var filename = this.__filename || __filename;
      var name = filename.split('/').pop();
      this.name = name.substr(0, name.length - 8);
      return this.name;
    },
    /**
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName: function(){
      var tableName;
      if (!this.trueTableName) {
        tableName = this.tablePrefix || '';
        tableName += this.tableName || parseName(this.getModelName());
        this.trueTableName = tableName.toLowerCase();
      }
      tableName = (this.dbName ? this.dbName + '.' : '') + this.trueTableName;
      return tableName;
    },
    /**
     * 获取数据表信息
     * @access protected
     * @return Promise
     */
    getTableFields: function(table, all){
      this.initDb();
      if (table === true) {
        table = undefined;
        all = true;
      }
      if (!isEmpty(this.fields)) {
        return getPromise(all ? this.fields : this.fields._field);
      }
      var tableName = table || this.getTableName();
      var fields = tableFields[tableName];
      if (!isEmpty(fields)) {
        this.fields = fields;
        return getPromise(all ? fields : fields._field);
      }
      var self = this;
      //从数据表里查询字段信息
      return this.flushFields().then(function(fields){
        self.fields = fields;
        if (C('db_fields_cache')) {
          tableFields[tableName] = fields;
        }
        return getPromise(all ? fields : fields._field);
      });  
    },
    /**
     * 获取数据表信息
     * @param  {[type]} table [description]
     * @return Promise       [description]
     */
    flushFields: function(table){
      table = table || this.getTableName();
      return this.initDb().getFields(table).then(function(data){
        var fields = {
          '_field': Object.keys(data || {}),
          '_autoinc': false,
          '_unique': []
        };
        var types = {};
        for(var key in data){
          var val = data[key];
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
    },
    /**
     * 获取类型为唯一的字段
     * @return {[type]} [description]
     */
    // getUniqueField: function(data){
    //   var unqiueFileds = this.fields._unique;
    //   var unqiue = '';
    //   unqiueFileds.some(function(item){
    //     if (!data || data[item]) {
    //       unqiue = item;
    //       return unqiue;
    //     }
    //   });
    //   return unqiue;
    // },
    /**
     * 获取上一次操作的sql
     * @return {[type]} [description]
     */
    getLastSql: function(){
      return this.initDb().getLastSql();
    },
    /**
     * 获取主键名称，必须在getTableFields().then之后才能调用该方法
     * @access public
     * @return string
     */
    getPk: function(){
      return this.fields._pk || this.pk;
    },
    /**
     * 缓存
     * @param  {[type]} key    [description]
     * @param  {[type]} expire [description]
     * @param  {[type]} type   [description]
     * @return {[type]}        [description]
     */
    cache: function(key, timeout){
      if (key === undefined) {
        return this;
      }
      var options = this._getCacheOptions(key, timeout);
      this._options.cache = options;
      return this;
    },
    /**
     * 获取缓存的选项
     * @param  {[type]} key     [description]
     * @param  {[type]} timeout [description]
     * @return {[type]}         [description]
     */
    _getCacheOptions: function(key, timeout, type){
      if (isObject(key)) {
        return key;
      }
      if (isNumber(key)) {
        timeout = key;
        key = '';
      }
      var cacheType = type === undefined ? C('db_cache_type') : type;
      var options = {
        key: key,
        timeout: timeout || C('db_cache_timeout'),
        type: cacheType,
        gcType: 'dbCache'
      }
      if (cacheType === 'File') {
        options.cache_path = C('db_cache_path');
      }else{
        options.cacheData = dbCacheData;
      }
      return options;
    },
    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */
    limit: function(offset, length){
      this._options.limit = length === undefined ? offset : offset + ',' + length;
      return this;
    },
    /**
     * 指定分页
     * @return {[type]} [description]
     */
    page: function(page, listRows){
      this._options.page = listRows === undefined ? page : page + ',' + listRows;
      return this;
    },
    /**
     * where条件
     * @return {[type]} [description]
     */
    where: function(where){
      if (!where) {
        return this;
      }
      if (isString(where)) {
        where = {_string: where};
      }
      this._options.where = extend(this._options.where || {}, where);
      return this;
    },
    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @param  {[type]} reverse [description]
     * @return {[type]}         [description]
     */
    field: function(field, reverse){
      if (isArray(field)) {
        field = field.join(',');
      }else if (!field) {
        field = '*';
      }
      this._options.field = field;
      this._options.fieldReverse = reverse;
      return this;
    },
    /**
     * 联合查询
     * @return {[type]} [description]
     */
    union: function(union, all){
      if (!this._options.union) {
        this._options.union = [];
      }
      this._options.union.push({
        union: union,
        all: all
      });
      return this;
    },
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
    join: function(join){
      if (!this._options.join) {
        this._options.join = [];
      }
      if (isArray(join)) {
        this._options.join = this._options.join.concat(join);
      }else{
        this._options.join.push(join);
      }
      return this;
    },
    /**
     * 生成查询SQL 可用于子查询
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    buildSql: function(options){
      var self = this;
      return this.parseOptions(options).then(function(options){
        return '( ' + self.db.buildSelectSql(options) + ' )';
      });
    },
    /**
     * 解析参数
     * @param  {[type]} options [description]
     * @return promise         [description]
     */
    parseOptions: function(options, extraOptions){
      options = extend({}, this._options, this.parseWhereOptions(options), extraOptions);
      // 查询过后清空sql表达式组装 避免影响下次查询
      this._options = {};
      options.table = options.table || this.getTableName();
      //表前缀，Db里会使用
      options.tablePrefix = this.tablePrefix;
      options.model = this.name;
      var promise = this.getTableFields(options.table);
      //数据表别名
      if (options.alias) {
        options.table += ' AS ' + options.alias;
      }
      var self = this;
      var keyReg = /[\.\|\&]/;
      return promise.then(function(fields){
        // 字段类型验证
        if (isObject(options.where) && !isEmpty(fields)) {
          // 对数组查询条件进行字段类型检查
          for(var key in options.where){
            var val = options.where[key];
            key = key.trim();
            if (fields.indexOf(key) > -1) {
              if (isScalar(val)) {
                options.where[key] = self.parseType(options.where, key)[key];
              }
            }else if(key[0] !== '_' && !keyReg.test(key)){
              delete options.where[key];
            }
          }
        }
        //field反选
        if (options.field && options.fieldReverse) {
          var optionsField = options.field.split(',');
          options.field = fields.filter(function(item){
            if (optionsField.indexOf(item) > -1) {
              return;
            }
            return item;
          }).join(',');
        }
        return self._optionsFilter(options, fields);
      });
    },
    /**
     * 选项过滤器
     * 具体的Model类里进行实现
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _optionsFilter: function(options){
      return options;
    },
    /**
     * 数据类型检测
     * @param  {[type]} data [description]
     * @param  {[type]} key  [description]
     * @return {[type]}      [description]
     */
    parseType: function(data, key){
      var fieldType = this.fields._type[key] || '';
      if (fieldType.indexOf('bigint') === -1 && fieldType.indexOf('int') > -1) {
        data[key] = parseInt(data[key], 10) || 0;
      }else if(fieldType.indexOf('double') > -1 || fieldType.indexOf('float') > -1){
        data[key] = parseFloat(data[key]) || 0.0;
      }else if(fieldType.indexOf('bool') > -1){
        data[key] = !! data[key];
      }
      return data;
    },
    /**
     * 对插入到数据库中的数据进行处理，要在parseOptions后执行
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    parseData: function(data){
      data = extend({}, data);
      var key;
      if (!isEmpty(this.fields)) {
        for(key in data){
          var val = data[key];
          if (this.fields._field.indexOf(key) === -1) {
            delete data[key];
          }else if(isScalar(val)){
            data = this.parseType(data, key);
          }
        }
      }
      //安全过滤
      if (typeof this._options.filter === 'function') {
        for(key in data){
          data[key] = this._options.filter.call(this, key, data[key]);
        }
        delete this._options.filter;
      }
      data = this._dataFilter(data);
      return data;
    },
    /**
     * 数据过滤器
     * 具体的Model类里进行实现
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _dataFilter: function(data){
      return data;
    },
    /**
     * 数据插入之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeAdd: function(data){
      return data;
    },
    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterAdd: function(data){
      return data;
    },
    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add: function(data, options, replace){
      //copy data
      data = extend({}, data);
      if (isEmpty(data)) {
        if (!isEmpty(this._data)) {
          data = this._data;
          this._data = {};
        }else{
          return getPromise('_DATA_TYPE_INVALID_', true);
        }
      }
      var self = this;
      //解析后的选项
      var parsedOptions = {};
      //解析后的数据
      var parsedData = {};
      return this.parseOptions(options).then(function(options){
        parsedOptions = options;
        return self._beforeAdd(data, parsedOptions);
      }).then(function(data){
        parsedData = data;
        data = self.parseData(data);
        return self.db.insert(data, parsedOptions, replace);
      }).then(function(){
        parsedData[self.getPk()] = self.db.getLastInsertId();
        return self._afterAdd(parsedData, parsedOptions);
      }).then(function(){
        return parsedData[self.getPk()];
      });
    },
    /**
     * 如果当前条件的数据不存在，才添加
     * @param  {[type]} data      要插入的数据
     * @param  {[type]} where      where条件
     * @param  boolean returnType 返回值是否包含type
     * @return {[type]}            promise
     */
    thenAdd: function(data, where, returnType){
      this.where(where);
      var self = this;
      return this.find().then(function(findData){
        if (!isEmpty(findData)) {
          var idValue = findData[self.getPk()];
          return returnType ? {id: idValue, type: 'exist'} : idValue;
        }
        return self.add(data).then(function(insertId){
          return returnType ? {id: insertId, type: 'add'} : insertId;
        });
      });
    },
    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */
    addAll: function(data, options, replace){
      if (!isArray(data) || !isObject(data[0])) {
        return getPromise(L('_DATA_TYPE_INVALID_'), true);
      }
      var self = this;
      return this.parseOptions(options).then(function(options){
        return self.db.insertAll(data, options, replace);
      }).then(function(){
        return self.db.getLastInsertId();
      });
    },
    /**
     * 删除后续操作
     * @return {[type]} [description]
     */
    _afterDelete: function(data){
      return data;
    },
    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete: function(options){
      var self = this;
      var parsedOptions = {};
      var affectedRows = 0;
      return this.parseOptions(options).then(function(options){
        parsedOptions = options;
        return self.db.delete(options);
      }).then(function(rows){
        affectedRows = rows;
        return self._afterDelete(parsedOptions.where || {}, parsedOptions);
      }).then(function(){
        return affectedRows;
      })
    },
    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeUpdate: function(data){
      return data;
    },
    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterUpdate: function(data){
      return data;
    },
    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update: function(data, options){
      data = extend({}, data);
      if (isEmpty(data)) {
        if (!isEmpty(this._data)) {
          data = this._data;
          this._data = {};
        }else{
          return getPromise('_DATA_TYPE_INVALID_', true);
        }
      }
      var self = this;
      var pk = self.getPk();
      var parsedOptions = {};
      var parsedData = {};
      var affectedRows = 0;
      return this.parseOptions(options).then(function(options){
        parsedOptions = options;
        return self._beforeUpdate(data, options);
      }).then(function(data){
        parsedData = data;
        data = self.parseData(data);
        if (isEmpty(parsedOptions.where)) {
          // 如果存在主键数据 则自动作为更新条件
          if (!isEmpty(data[pk])) {
            parsedOptions.where = getObject(pk, data[pk]);
            delete data[pk];
          }else{
            return getPromise('_OPERATION_WRONG_', true);
          }
        }else{
          parsedData[pk] = parsedOptions.where[pk];
        }
        return self.db.update(data, parsedOptions);
      }).then(function(rows){
        affectedRows = rows;
        return self._afterUpdate(parsedData, parsedOptions);
      }).then(function(){
        return affectedRows;
      });
    },
    /**
     * 更新多个数据，自动用主键作为查询条件
     * @param  {[type]} dataList [description]
     * @return {[type]}          [description]
     */
    updateAll: function(dataList){
      if (!isArray(dataList) || !isObject(dataList[0])) {
        return getPromise('_DATA_TYPE_INVALID_', true);
      }
      var self = this;
      var promises = dataList.map(function(data){
        return self.update(data);
      });
      return Promise.all(promises);
    },
    /**
     * 更新某个字段的值
     * @param  {[type]} field [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    updateField: function(field, value){
      var data = {};
      if (isObject(field)) {
        data = field;
      }else{
        data[field] = value;
      }
      return this.update(data);
    },
    /**
     * 字段值增长
     * @return {[type]} [description]
     */
    updateInc: function(field, step){
      step = parseInt(step, 10) || 1;
      return this.updateField(field, ['exp', field + '+' + step]);
    },
    /**
     * 字段值减少
     * @return {[type]} [description]
     */
    updateDec: function(field, step){
      step = parseInt(step, 10) || 1;
      return this.updateField(field, ['exp', field + '-' + step]);
    },
    /**
     * 解析options中简洁的where条件
     * @return {[type]} [description]
     */
    parseWhereOptions: function(options){
      if (isNumber(options) || isString(options)) {
        var pk = this.getPk();
        options += '';
        var where = {};
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
    },
    /**
     * find查询后置操作
     * @return {[type]} [description]
     */
    _afterFind: function(result){
      return result;
    },
    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find: function(options){
      var self = this;
      var parsedOptions = {};
      return this.parseOptions(options, {
        limit: 1
      }).then(function(options){
        parsedOptions = options;
        return self.db.select(options);
      }).then(function(data){
        return self._afterFind(data[0] || {}, parsedOptions);
      });
    },
    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterSelect: function(result){
      return result;
    },
    /**
     * 查询数据
     * @return 返回一个promise
     */
    select: function(options){
      var self = this;
      var parsedOptions = {};
      return this.parseOptions(options).then(function(options){
        parsedOptions = options;
        return self.db.select(options);
      }).then(function(result){
        return self._afterSelect(result, parsedOptions);
      });
    },
    selectAdd: function(fields, table, options){
      var self = this;
      return this.parseOptions(options).then(function(options){
        fields = fields || options.field;
        table = table || self.getTableName();
        return self.db.selectInsert(fields, table, options);
      });
    },
    /**
     * 返回数据里含有count信息的查询
     * @param  options  查询选项
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise         
     */
    countSelect: function(options, pageFlag){
      if (isBoolean(options)) {
        pageFlag = options;
        options = {};
      }
      var self = this;
      //解析后的options
      var parsedOptions = {};
      var result = {};
      return this.parseOptions(options).then(function(options){
        delete options.table;
        parsedOptions = options;
        return self.options({
          where: options.where,
          cache: options.cache,
          join: options.join
        }).count(self.getTableName() + '.' + self.getPk());
      }).then(function(count){
        var pageOptions = parsePage(parsedOptions);
        var totalPage = Math.ceil(count / pageOptions.num);
        if (isBoolean(pageFlag)) {
          if (pageOptions.page > totalPage) {
            pageOptions.page = pageFlag === true ? 1 : totalPage;
          }
          parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
        }
        result = extend({count: count, total: totalPage}, pageOptions);
        return self.select(parsedOptions);
      }).then(function(data){
        result.data = data;
        return result;
      });
    },
    /**
     * 获取某个字段下的记录
     * @return {[type]} [description]
     */
    getField: function(field, one){
      var self = this;
      return this.parseOptions({'field': field}).then(function(options){
        if (isNumber(one)) {
          options.limit = one;
        }else if (one === true) {
          options.limit = 1;
        }
        return self.db.select(options);
      }).then(function(data){
        var multi = field.indexOf(',') > -1;
        if (multi) {
          var fields = field.split(/\s*,\s*/);
          var result = {};
          fields.forEach(function(item){
            result[item] = [];
          })
          data.every(function(item){
            fields.forEach(function(fItem){
              if (one === true) {
                result[fItem] = item[fItem];
              }else{
                result[fItem].push(item[fItem]);
              }
            })
            return one === true ? false : true;
          })
          return result;
        }else{
          data = data.map(function(item){
            return Object.values(item)[0];
          })
          return one === true ? data[0] : data;
        }
      });
    },
    /**
     * 根据某个字段值获取一条数据
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    getBy: function(name, value){
      var where = getObject(name, value);
      return this.where(where).find();
    },
    /**
     * SQL查询
     * @return {[type]} [description]
     */
    query: function(sql, parse){
      if (parse !== undefined && !isBoolean(parse) && !isArray(parse)) {
        parse = [].slice.call(arguments);
        parse.shift();
      }
      var self = this;
      return this.parseSql(sql, parse).then(function(sql){
        return self.db.query(sql);
      });
    },
    /**
     * 执行SQL语法，非查询类的SQL语句，返回值为影响的行数
     * @param  {[type]} sql   [description]
     * @param  {[type]} parse [description]
     * @return {[type]}       [description]
     */
    execute: function(sql, parse){
      if (parse !== undefined && !isBoolean(parse) && !isArray(parse)) {
        parse = [].slice.call(arguments);
        parse.shift();
      }
      var self = this;
      return this.parseSql(sql, parse).then(function(sql){
        return self.db.execute(sql);
      });
    },
    /**
     * 解析SQL语句
     * @return promise [description]
     */
    parseSql: function(sql, parse){
      var promise = null;
      var self = this;
      if (parse === true) {
        promise = this.parseOptions().then(function(options){
          return self.db.parseSql(options);
        });
      }else{
        if (parse === undefined) {
          parse = [];
        }else{
          parse = isArray(parse) ? parse : [parse];
        }
        parse.unshift(sql);
        sql = util.format.apply(null, parse);
        var map = {
          '__TABLE__': '`' + this.getTableName() + '`'
        };
        sql = sql.replace(/__([A-Z]+)__/g, function(a, b){
          return map[a] || ('`' + C('db_prefix') + b.toLowerCase() + '`');
        });
        promise = getPromise(sql);
      }
      this.initDb().setModel(self.name);
      return promise;
    },
    /**
     * 设置数据对象值
     * @return {[type]} [description]
     */
    data: function(data){
      if (data === true) {
        return this._data;
      }
      if (isString(data)) {
        data = querystring.parse(data);
      }
      this._data = data;
      return this;
    },
    /**
     * 设置操作选项
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    options: function(options){
      if (options === true) {
        return this._options;
      }
      this._options = options;
      return this;
    },
    /**
     * 关闭数据库连接
     * @return {[type]} [description]
     */
    close: function(){
      delete dbInstances[this.configKey];
      if (this.db) {
        this.db.close();
        this.db = null;
      }
    }
  };
}).extend(function(){
  'use strict';
  //追加的方法
  var methods = {};
  // 链操作方法列表
  var methodNameList = [
    'table','order','alias','having','group',
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
      var self = this;
      return this.getTableFields().then(function(){
        field = field || self.getPk();
        return self.getField(item.toUpperCase() + '(' + field + ') AS thinkjs_' + item, true);
      });
    };
  });
  //方法别名
  var aliasMethodMap = {
    update: 'save',
    updateField: 'setField',
    updateInc: 'setInc',
    updateDec: 'setDec'
  };
  Object.keys(aliasMethodMap).forEach(function(key){
    var value = aliasMethodMap[key];
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
Model.close = function(){
  'use strict';
  for(var key in dbInstances) {
    dbInstances[key].close();
  }
  dbInstances = {};
};