const helper = require('think-helper');

module.exports = class AbstractQuery {
  constructor(config) {
    this.config = config;
    this.lastSql = '';
    this.lastInsertId = 0;
  }
  /**
   * parser instance
   */
  get parser() {}
  /**
   * query sql
   */
  query() {}
  /**
   * execute
   */
  execute() {}
  /**
   * insert data
   * @param {Object} data 
   * @param {Object} options 
   */
  add(data, options) {
    const values = [];
    const fields = [];
    const parser = this.parser;
    for (const key in data) {
      let val = data[key];
      val = parser.parseValue(val);
      if (helper.isString(val) || helper.isBoolean(val) || helper.isNumber(val)) {
        values.push(val);
        fields.push(parser.parseKey(key));
      }
    }
    options.fields = fields.join(',');
    options.values = values.join(',');
    const sql = this.parser.buildInsertSql(options);
    return this.execute(sql).then(() => this.lastInsertId);
  }
  /**
   * insert multi data
   * @param  {Array} data    [data list]
   * @param  {Object} options []
   * @return {Promise}         []
   */
  addMany(data, options) {
    const parser = this.parser;
    const fields = Object.keys(data[0]).map(item => parser.parseKey(item)).join(',');
    const values = data.map(item => {
      const value = [];
      for (const key in item) {
        let val = item[key];
        val = parser.parseValue(val);
        if (helper.isString(val) || helper.isBoolean(val) || helper.isNumber(val)) {
          value.push(val);
        }
      }
      return `(${value.join(',')})`;
    }).join(',');

    options.fields = fields;
    options.values = values;
    const sql = this.parser.buildInsertSql(options);
    return this.execute(sql).then(() => {
      return data.map((item, index) => {
        return this.lastInsertId ? this.lastInsertId + index : 0;
      });
    });
  }
  /**
   * select data
   * @param  {String} fields  []
   * @param  {String} table   []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  selectAdd(fields, table, options = {}) {
    if (helper.isString(fields)) {
      fields = fields.split(/\s*,\s*/);
    }
    const parser = this.parser;
    fields = fields.map(item => parser.parseKey(item));
    const sql = this.parser.buildInsertSql({
      table,
      fields: fields.join(','),
      values: options
    });
    return this.execute(sql);
  }
  /**
   * delete data
   * @param  {Object} options []
   * @return {Promise}         []
   */
  delete(options) {
    const sql = this.parser.buildDeleteSql(options);
    return this.execute(sql);
  }
  /**
   * update data
   * @param  {Object} data    []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  update(data, options) {
    const sql = this.parser.buildUpdateSql(data, options);
    return this.execute(sql);
  }
  /**
   * select
   * @param  {Object} options []
   * @return {Promise}         []
   */
  select(options, cache) {
    const parser = this.parser;
    let sql;
    if (helper.isObject(options)) {
      sql = options.sql ? options.sql : parser.buildSelectSql(options);
      cache = options.cache || cache;
    } else {
      sql = options;
    }
    return this.query(sql);
  }
};
