function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
  getSchema(table) {
    var _this = this;

    return _asyncToGenerator(function* () {
      table = table || _this.getTableName();
      let schema = yield _this.db().getSchema(table);

      if (table !== _this.getTableName()) {
        return schema;
      }

      //get primary key
      for (let name in schema) {
        if (schema[name].primary) {
          _this.pk = name;
          break;
        }
      }

      //merge user set schema config
      _this.schema = helper.extend({}, schema, _this.schema);
      return _this.schema;
    })();
  }
  /**
   * get unique field
   * @param  {Object} data []
   * @return {Promise}      []
   */
  getUniqueField(data) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let schema = yield _this2.getSchema();
      for (let name in schema) {
        if (schema[name].unique && (!data || data[name])) {
          return name;
        }
      }
    })();
  }
  /**
   * get last sql
   * @return {Promise} []
   */
  getLastSql() {
    return this.db().getLastSql();
  }
  /**
   * get primary key
   * @return {Promise} []
   */
  getPk() {
    if (this.pk !== 'id') {
      return Promise.resolve(this.pk);
    }
    return this.getSchema().then(() => this.pk);
  }
  /**
   * build sql
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  buildSql(options, noParentheses) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      options = yield _this3.parseOptions(options);
      let sql = _this3.db().buildSelectSql(options).trim();
      if (noParentheses) {
        return sql;
      }
      return '( ' + sql + ' )';
    })();
  }
  /**
   * parse options
   * @param oriOpts options
   * @param extraOptions 
   * @param flag 
   */
  parseOptions(oriOpts, extraOptions, flag = false) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      let options = helper.extend({}, _this4._options);
      if (helper.isObject(oriOpts)) {
        options = helper.extend(options, oriOpts);
      }
      if (extraOptions) {
        options = helper.extend(options, extraOptions);
      }
      //clear options
      _this4._options = {};
      //get table name
      options.table = options.table || _this4.getTableName();

      options.tablePrefix = _this4.getTablePrefix();
      options.model = _this4.getModelName();

      //get table schema can not use table alias
      let schema = yield _this4.getSchema(options.table);

      //table alias
      if (options.alias) {
        options.table += ' AS ' + options.alias;
      }

      if (oriOpts !== undefined && !helper.isObject(oriOpts)) {
        options = helper.extend(options, _this4.parseWhereOptions(oriOpts));
      }
      //check where key
      if (options.where && !helper.isEmpty(schema)) {
        let keyReg = /^[\w\.\|\&]+$/;
        for (let key in options.where) {
          if (!keyReg.test(key)) {
            // let msg = new Error(think.locale('FIELD_KEY_NOT_VALID', key));
            // return Promise.reject(msg);
          }
        }
      }

      //field reverse
      if (options.field && options.fieldReverse) {
        //reset fieldReverse value
        options.fieldReverse = false;
        let optionsField = options.field;
        options.field = Object.keys(schema).filter(function (item) {
          if (optionsField.indexOf(item) === -1) {
            return item;
          }
        });
      }

      if (flag) {
        let camelCase = _this4.config.camel_case || false;
        if (camelCase) {
          if (helper.isEmpty(options.field)) {
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
          if (!helper.isEmpty(where)) {
            let keyArray = Object.keys(where);
            for (let key of keyArray) {
              options.where[helper.snakeCase(key)] = where[key];
            }
          }
        }
      }

      return _this4.optionsFilter(options, schema);
    })();
  }
  /**
   * parse where options
   * @return {Object}
   */
  parseWhereOptions(options) {
    if (helper.isNumber(options) || helper.isString(options)) {
      options += '';
      let where = {
        [this.pk]: options.indexOf(',') > -1 ? { IN: options } : options
      };
      return { where: where };
    }
    return options;
  }
  /**
   * parse type
   * @param  {Object} data []
   * @param  {} key  []
   * @return {}      []
   */
  parseType(key, value) {
    let fieldType = (this.schema[key].type || '').toLowerCase();
    if (fieldType.indexOf('enum') > -1 || fieldType.indexOf('set') > -1) {
      return value;
    }
    if (fieldType.indexOf('bigint') === -1 && fieldType.indexOf('int') > -1) {
      return parseInt(value, 10) || 0;
    } else if (fieldType.indexOf('double') > -1 || fieldType.indexOf('float') > -1 || fieldType.indexOf('decimal') > -1) {
      return parseFloat(value) || 0.0;
    } else if (fieldType.indexOf('bool') > -1) {
      return !!value;
    }
    return value;
  }
  /**
   * parse data, after fields getted
   * @param  {} data []
   * @return {}      []
   */
  parseData(data) {
    let camelCase = this.config.camel_case;
    if (camelCase) {
      let tmpData = helper.extend({}, data);
      data = {};
      let keyArray = Object.keys(tmpData);
      for (let key of keyArray) {
        data[helper.snakeCase(key)] = tmpData[key];
      }
    }
    //deep clone data
    data = helper.extend({}, data);
    for (let key in data) {
      let val = data[key];
      //remove data not in fields
      if (!this.schema[key]) {
        delete data[key];
      } else if (helper.isNumber(val) || helper.isString(val) || helper.isBoolean(val)) {
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
  add(data, options, replace) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (options === true) {
        replace = true;
        options = {};
      }
      //copy data
      data = helper.extend({}, _this5._data, data);
      //clear data
      _this5._data = {};

      options = yield _this5.parseOptions(options, {}, true);

      let parsedData = _this5.parseData(data);
      parsedData = yield _this5.beforeAdd(parsedData, options);
      if (helper.isEmpty(parsedData)) {
        throw new Error('DATA_EMPTY');
      }

      let db = _this5.db();
      yield db.add(parsedData, options, replace);
      let insertId = parsedData[_this5.pk] = db.getLastInsertId();
      let copyData = helper.extend({}, data, parsedData, { [_this5.pk]: insertId });
      yield _this5.afterAdd(copyData, options);
      return insertId;
    })();
  }
  /**
   * add data when not exist
   * @param  {Object} data       []
   * @param  {Object} where      []
   * @return {}            []
   */
  thenAdd(data, where) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      let findData = yield _this6.where(where).find();
      if (!helper.isEmpty(findData)) {
        return { [_this6.pk]: findData[_this6.pk], type: 'exist' };
      }
      let insertId = yield _this6.add(data);
      return { [_this6.pk]: insertId, type: 'add' };
    })();
  }
  /**
   * update data when exist, otherwise add data
   * @return {id}
   */
  thenUpdate(data, where) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      let findData = yield _this7.where(where).find();
      if (helper.isEmpty(findData)) {
        return _this7.add(data);
      }
      yield _this7.where(where).update(data);
      return findData[_this7.pk];
    })();
  }
  /**
   * add multi data
   * @param {Object} data    []
   * @param {} options []
   * @param {} replace []
   */
  addMany(data, options, replace) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      if (!helper.isArray(data) || !helper.isObject(data[0])) {
        throw new Error('DATA_MUST_BE_ARRAY');
      }
      if (options === true) {
        replace = true;
        options = {};
      }
      options = yield _this8.parseOptions(options, {}, true);
      let promises = data.map(function (item) {
        item = _this8.parseData(item);
        return _this8.beforeAdd(item, options);
      });
      data = yield Promise.all(promises);
      let db = _this8.db();
      yield db.addMany(data, options, replace);
      let insertId = db.getLastInsertId();
      let insertIds = [];
      promises = data.map(function (item, i) {
        let id = insertId + i;
        if (_this8.config.type === 'sqlite') {
          id = insertId - data.length + i + 1;
        }
        item[_this8.pk] = id;
        insertIds.push(id);
        return _this8.afterAdd(item, options);
      });
      data = yield Promise.all(promises);
      return insertIds;
    })();
  }
  /**
   * delete data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  delete(options) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      options = yield _this9.parseOptions(options, {}, true);
      options = yield _this9.beforeDelete(options);
      let rows = yield _this9.db().delete(options);
      yield _this9.afterDelete(options);
      return rows;
    })();
  }
  /**
   * update data
   * @param  {Object} data      []
   * @param  {Object} options   []
   * @param  {Boolean} ignoreWhere []
   * @return {Promise}          []
   */
  update(data, options) {
    var _this10 = this;

    return _asyncToGenerator(function* () {

      data = helper.extend({}, _this10._data, data);
      //clear data
      _this10._data = {};

      options = yield _this10.parseOptions(options, {}, true);

      let parsedData = _this10.parseData(data);

      //check where condition
      if (helper.isEmpty(options.where)) {
        //get where condition from data
        let pk = yield _this10.getPk();
        if (parsedData[pk]) {
          options.where = { [pk]: parsedData[pk] };
          delete parsedData[pk];
        } else {
          throw new Error('MISS_WHERE_CONDITION');
        }
      }

      parsedData = yield _this10.beforeUpdate(parsedData, options);
      //check data is empty
      if (helper.isEmpty(parsedData)) {
        throw new Error('DATA_EMPTY');
      }

      let rows = yield _this10.db().update(parsedData, options);
      let copyData = helper.extend({}, data, parsedData);
      yield _this10.afterUpdate(copyData, options);
      return rows;
    })();
  }
  /**
   * update all data
   * @param  {Array} dataList []
   * @return {Promise}          []
   */
  updateMany(dataList, options) {
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
  increment(field, step = 1) {
    let data = {
      [field]: ['exp', `\`${field}\`+${step}`]
    };
    return this.update(data);
  }
  /**
   * decrement field data
   * @return {} []
   */
  decrement(field, step = 1) {
    let data = {
      [field]: ['exp', `\`${field}\`-${step}`]
    };
    return this.update(data);
  }
  /**
   * find data
   * @return Promise
   */
  find(options) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      options = yield _this11.parseOptions(options, { limit: 1 }, true);
      options = yield _this11.beforeFind(options);
      let data = yield _this11.db().select(options);
      return _this11.afterFind(data[0] || {}, options);
    })();
  }
  /**
   * select
   * @return Promise
   */
  select(options) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      options = yield _this12.parseOptions(options, {}, true);
      options = yield _this12.beforeSelect(options);
      let data = yield _this12.db().select(options);
      return _this12.afterSelect(data, options);
    })();
  }
  /**
   * select add
   * @param  {} options []
   * @return {Promise}         []
   */
  selectAdd(options) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      let promise = Promise.resolve(options);
      let Class = module.exports.default || module.exports;
      if (options instanceof Class) {
        promise = options.parseOptions();
      }
      let data = yield Promise.all([_this13.parseOptions(), promise]);
      let fields = data[0].field || Object.keys(_this13.schema);
      return _this13.db().selectAdd(fields, data[0].table, data[1]);
    })();
  }
  /**
   * count select
   * @param  options
   * @param  pageFlag
   * @return promise
   */
  countSelect(options, pageFlag) {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      let count;
      if (helper.isBoolean(options)) {
        pageFlag = options;
        options = {};
      } else if (helper.isNumber(options)) {
        count = options;
        options = {};
      }

      options = yield _this14.parseOptions(options);
      let pk = _this14.pk;
      let table = options.alias || _this14.getTableName();

      //delete table options avoid error when has alias
      delete options.table;
      //reserve and delete the possible order option
      let order = options.order;
      delete options.order;

      if (!count) {
        count = yield _this14.options(options).count(`${table}.${pk}`);
      }

      options.limit = options.limit || [0, _this14.config.nums_per_page];
      //recover the deleted possible order
      options.order = order;
      let numsPerPage = options.limit[1];
      //get page options
      let data = { numsPerPage: numsPerPage };
      let totalPage = Math.ceil(count / data.numsPerPage);

      data.currentPage = parseInt(options.limit[0] / options.limit[1] + 1);

      if (helper.isBoolean(pageFlag) && data.currentPage > totalPage) {
        if (pageFlag) {
          data.currentPage = 1;
          options.limit = [0, numsPerPage];
        } else {
          data.currentPage = totalPage;
          options.limit = [(totalPage - 1) * numsPerPage, numsPerPage];
        }
      }
      let result = helper.extend({ count: count, totalPages: totalPage }, data);

      if (options.cache && options.cache.key) {
        options.cache.key += '_count';
      }
      result.data = count ? yield _this14.select(options) : [];
      return result;
    })();
  }
  /**
   * get field data
   * @return {[type]} [description]
   */
  getField(field, one) {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      let options = yield _this15.parseOptions({ 'field': field });
      if (helper.isNumber(one)) {
        options.limit = one;
      } else if (one === true) {
        options.limit = 1;
      }
      let data = yield _this15.db().select(options);
      let multi = field.indexOf(',') > -1 && field.indexOf('(') === -1;
      if (multi) {
        let fields = field.split(/\s*,\s*/);
        let result = {};
        fields.forEach(function (item) {
          return result[item] = [];
        });
        data.every(function (item) {
          fields.forEach(function (fItem) {
            if (one === true) {
              result[fItem] = item[fItem];
            } else {
              result[fItem].push(item[fItem]);
            }
          });
          return one !== true;
        });
        return result;
      } else {
        data = data.map(function (item) {
          for (let key in item) {
            return item[key];
          }
        });
        return one === true ? data[0] : data;
      }
    })();
  }
  /**
   * get quote field
   * @param  {String} field []
   * @return {String}       []
   */
  _getQuoteField(field) {
    var _this16 = this;

    return _asyncToGenerator(function* () {
      if (field) {
        return (/^\w+$/.test(field) ? '`' + field + '`' : field
        );
      }
      return (yield _this16.getPk()) || '*';
    })();
  }
  /**
   * get count
   * @param  {String} field []
   * @return {Promise}       []
   */
  count(field) {
    var _this17 = this;

    return _asyncToGenerator(function* () {
      field = yield _this17._getQuoteField(field);
      return _this17.getField('COUNT(' + field + ') AS think_count', true);
    })();
  }
  /**
   * get sum
   * @param  {String} field []
   * @return {Promise}       []
   */
  sum(field) {
    var _this18 = this;

    return _asyncToGenerator(function* () {
      field = yield _this18._getQuoteField(field);
      return _this18.getField('SUM(' + field + ') AS think_sum', true);
    })();
  }
  /**
   * get min value
   * @param  {String} field []
   * @return {Promise}       []
   */
  min(field) {
    var _this19 = this;

    return _asyncToGenerator(function* () {
      field = yield _this19._getQuoteField(field);
      return _this19.getField('MIN(' + field + ') AS think_min', true);
    })();
  }
  /**
   * get max valud
   * @param  {String} field []
   * @return {Promise}       []
   */
  max(field) {
    var _this20 = this;

    return _asyncToGenerator(function* () {
      field = yield _this20._getQuoteField(field);
      return _this20.getField('MAX(' + field + ') AS think_max', true);
    })();
  }
  /**
   * get value average
   * @param  {String} field []
   * @return {Promise}       []
   */
  avg(field) {
    var _this21 = this;

    return _asyncToGenerator(function* () {
      field = yield _this21._getQuoteField(field);
      return _this21.getField('AVG(' + field + ') AS think_avg', true);
    })();
  }
  /**
   * query
   * @return {Promise} []
   */
  query(...args) {
    let sql = this.parseSql(...args);
    return this.db().select(sql, this._options.cache);
  }
  /**
   * execute sql
   * @param  {[type]} sql   [description]
   * @param  {[type]} parse [description]
   * @return {[type]}       [description]
   */
  execute(...args) {
    let sql = this.parseSql(...args);
    return this.db().execute(sql);
  }
  /**
   * parse sql
   * @return promise [description]
   */
  parseSql(...args) {
    let sql = util.format(...args);
    //replace table name
    return sql.replace(/\s__([A-Z]+)__\s/g, (a, b) => {
      if (b === 'TABLE') {
        return ' `' + this.getTableName() + '` ';
      }
      return ' `' + this.getTablePrefix() + b.toLowerCase() + '` ';
    });
  }
  // /**
  //  * start transaction
  //  * @return {Promise} []
  //  */
  // startTrans(){
  //   return this.db(true).startTrans();
  // }
  // /**
  //  * commit transcation
  //  * @return {Promise} []
  //  */
  // async commit(){
  //   let data = await this.db().commit();
  //   this.close();
  //   this._db = null;
  //   return data;
  // }
  // /**
  //  * rollback transaction
  //  * @return {Promise} []
  //  */
  // async rollback(){
  //   let data = await this.db().rollback();
  //   this.close();
  //   this._db = null;
  //   return data;
  // }
  // /**
  //  * transaction exec functions
  //  * @param  {Function} fn [exec function]
  //  * @return {Promise}      []
  //  */
  // async transaction(fn){
  //   let result;
  //   await this.startTrans();
  //   try{
  //     result = await think.co(fn());
  //     await this.commit();
  //   }catch(e){
  //     await this.rollback();
  //   }
  //   return result;
  // }
};