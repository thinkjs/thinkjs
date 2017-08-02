const {Parser} = require('think-model-abstract');

module.exports = class PostgreSQLParser extends Parser {
  /**
   * escape string
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str) {
    return str.replace(/'/g, '\'\'');
  }
  /**
   * build insert sql
   * @param {Object} options 
   */
  buildInsertSql(options) {
    const sql = super.buildInsertSql(options);
    if (!options.pk) return sql;
    return `${sql} RETURNING ${options.pk}`;
  }
};
