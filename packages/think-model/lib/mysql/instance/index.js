function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const helper = require('think-helper');
const MysqlSocket = require('think-mysql');
const Base = require('./base');

/**
 * mysql db
 * @type {Class}
 */
module.exports = class extends Base {
  /**
   * get mysql socket instance
   * @param  {Object} config []
   * @return {}        []
   */
  socket(sql) {
    if (this._socket) {
      return this._socket;
    }
    let config = helper.extend({
      sql: sql
    }, this.config);
    this._socket = new MysqlSocket(config);
    return this._socket;
  }
  /**
   * get table schema
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  getSchema(table) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let data = yield _this.query(`SHOW COLUMNS FROM ${_this.parseKey(table)}`);
      let ret = {};
      data.forEach(function (item) {
        ret[item.Field] = {
          'name': item.Field,
          'type': item.Type,
          'required': item.Null === '',
          //'default': item.Default,
          'primary': item.Key === 'PRI',
          'unique': item.Key === 'UNI',
          'auto_increment': item.Extra.toLowerCase() === 'auto_increment'
        };
      });
      return ret;
    })();
  }
  /**
   * parse key
   * @param  {String} key []
   * @return {String}     []
   */
  parseKey(key = '') {
    key = key.trim();
    if (helper.isEmpty(key)) {
      return '';
    }
    if (helper.isNumberString(key)) {
      return key;
    }
    if (!/[,\'\"\*\(\)`.\s]/.test(key)) {
      key = '`' + key + '`';
    }
    return key;
  }
};