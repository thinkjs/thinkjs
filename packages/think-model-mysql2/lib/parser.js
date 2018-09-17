const helper = require('think-helper');
const { Parser } = require('think-model-abstract');

module.exports = class MysqlParser extends Parser {
  /**
   * parse key
   * @param  {String} key []
   * @return {String}     []
   */
  parseKey(key = '') {
    key = key.trim();
    if (helper.isEmpty(key)) return '';
    if (helper.isNumberString(key)) return key;
    if (!(/[,'"*()`.\s]/.test(key))) {
      key = '`' + key + '`';
    }
    return key;
  }
  /**
   * escape string
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str) {
    if (!str) return '';

    // eslint-disable-next-line no-control-regex
    return str.replace(/[\0\n\r\b\t\\'"\x1a]/g, s => {
      switch (s) {
        case '\0':
          return '\\0';
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '\b':
          return '\\b';
        case '\t':
          return '\\t';
        case '\x1a':
          return '\\Z';
        default:
          return '\\' + s;
      }
    });
  }

  /**
   * get insert sql
   * @param {Object} options
   */
  buildInsertSql(options, replace) {
    const isUpdate = helper.isObject(options.update) || helper.isArray(options.update);
    if (replace || !isUpdate) {
      return super.buildInsertSql(options, replace);
    }

    const table = this.parseTable(options.table);
    const values = options.values[0] !== '(' ? `(${options.values})` : options.values;

    let sets = [];
    if (helper.isArray(options.update)) {
      sets = options.update.map(field => {
        field = this.parseKey(field);
        return field + '=' + `VALUES(${field})`;
      });
    } else {
      for (const key in options.update) {
        const value = this.parseValue(options.update[key]);
        if (helper.isString(value) || helper.isNumber(value) || helper.isBoolean(value)) {
          sets.push(this.parseKey(key) + '=' + value);
        }
      }
    }

    const duplicateUpdate = sets.length ? ' ON DUPLICATE KEY UPDATE ' + sets.join(',') : '';
    const lock = this.parseLock(options.lock);
    const comment = this.parseComment(options.comment);

    return `INSERT INTO ${table} (${options.fields}) VALUES ${values}${duplicateUpdate}${lock}${comment}`;
  }
};
