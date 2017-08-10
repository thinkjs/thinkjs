const Parser = require('./lib/parser.js');
const Query = require('./lib/query.js');
const Schema = require('./lib/schema.js');

module.exports = class Abstract {
  /**
   * constructor
   * @param {Object} model 
   */
  constructor(model) {
    this.model = model;
  }
  /**
   * parse key
   * @param {String} field 
   */
  parseKey(field) {
    return this.parser.parseKey(field);
  }
  /**
   * get last sql
   */
  get lastSql() {
    return this.query.lastSql;
  }
  /**
   * execute sql
   * @param {String} sql 
   */
  execute(sql) {
    return this.query.execute(sql);
  }
  /**
   * select add data
   * @param {Array} fields 
   * @param {String} table 
   * @param {Object} options 
   */
  selectAdd(fields, table, options) {
    return this.query.selectAdd(fields, table, options);
  }
  /**
   * add data
   * @param {Object} data 
   * @param {Object} options 
   */
  add(data, options) {
    return this.query.add(data, options);
  }
  /**
   * add data list
   * @param {Array} dataList 
   * @param {options} options 
   */
  addMany(dataList, options) {
    return this.query.addMany(dataList, options);
  }
  /**
   * update
   * @param {Object} data 
   * @param {Object} options 
   */
  update(data, options) {
    return this.query.update(data, options);
  }
  /**
   * delete
   * @param {Object} options 
   */
  delete(options) {
    return this.query.delete(options);
  }
  /**
   * select 
   * @param {Object} options 
   * @return {Promise}
   */
  select(options) {
    return this.query.select(options);
  }
  /**
   * get reverse fields
   * @param {String} fields 
   * @return {Promise}
   */
  getReverseFields(fields) {
    return this.schema.getReverseFields(fields);
  }
  /**
   * parse data
   * @param {Object} data 
   * @param {Boolean} isUpdate 
   * @param {String} table 
   * @return {Promise}
   */
  parseData(data, isUpdate, table) {
    return this.schema.parseData(data, isUpdate, table);
  }

  /**
   * startTrans
   * @param {Object} connection 
   */
  startTrans(connection) {
    return this.query.startTrans(connection);
  }

  /**
   * commit transactions
   * @param {Object} connection 
   */
  commit(connection) {
    return this.query.commit(connection);
  }

  /**
   * rollback transactions
   * @param {Object} connection 
   */
  rollback(connection) {
    return this.query.rollback(connection);
  }

  /**
   * transaction
   * @param {Function} fn 
   * @param {Object} connection 
   */
  transaction(fn, connection) {
    return this.query.transaction(fn, connection);
  }

  /**
   * close socket
   */
  close() {
    return this.query.close();
  }
};

module.exports.Parser = Parser;
module.exports.Query = Query;
module.exports.Schema = Schema;
