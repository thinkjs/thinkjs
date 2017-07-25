const helper = require('think-helper');
const {Parser} = require('think-model-abstract');

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
};
