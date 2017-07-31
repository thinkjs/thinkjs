const helper = require('think-helper');
const {Parser} = require('think-model-abstract');

module.exports = class SQLiteParser extends Parser {
  /**
   * escape string
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str) {
    return str.replace(/'/g, '\'\'');
  }
  /**
   * parse limit
   * @param  {Array} limit []
   * @return {String}       []
   */
  parseLimit(limit) {
    if (helper.isEmpty(limit)) return '';
    if (helper.isNumber(limit)) {
      return ` LIMIT ${limit}`;
    }
    if (helper.isString(limit)) {
      limit = limit.split(/\s*,\s*/);
    }
    if (limit[1]) {
      return ' LIMIT ' + (limit[1] | 0) + ' OFFSET ' + (limit[0] | 0);
    }
    return ' LIMIT ' + (limit[0] | 0);
  }
};
