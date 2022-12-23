const helper = require('think-helper');
const { Parser } = require('think-model-abstract');

// http://www.sqlite.org/lang_keywords.html
const keywords = [
  'ABORT',
  'ACTION',
  'ADD',
  'AFTER',
  'ALL',
  'ALTER',
  'ANALYZE',
  'AND',
  'AS',
  'ASC',
  'ATTACH',
  'AUTOINCREMENT',
  'BEFORE',
  'BEGIN',
  'BETWEEN',
  'BY',
  'CASCADE',
  'CASE',
  'CAST',
  'CHECK',
  'COLLATE',
  'COLUMN',
  'COMMIT',
  'CONFLICT',
  'CONSTRAINT',
  'CREATE',
  'CROSS',
  'CURRENT',
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'DATABASE',
  'DEFAULT',
  'DEFERRABLE',
  'DEFERRED',
  'DELETE',
  'DESC',
  'DETACH',
  'DISTINCT',
  'DO',
  'DROP',
  'EACH',
  'ELSE',
  'END',
  'ESCAPE',
  'EXCEPT',
  'EXCLUDE',
  'EXCLUSIVE',
  'EXISTS',
  'EXPLAIN',
  'FAIL',
  'FILTER',
  'FOLLOWING',
  'FOR',
  'FOREIGN',
  'FROM',
  'FULL',
  'GLOB',
  'GROUP',
  'GROUPS',
  'HAVING',
  'IF',
  'IGNORE',
  'IMMEDIATE',
  'IN',
  'INDEX',
  'INDEXED',
  'INITIALLY',
  'INNER',
  'INSERT',
  'INSTEAD',
  'INTERSECT',
  'INTO',
  'IS',
  'ISNULL',
  'JOIN',
  'KEY',
  'LEFT',
  'LIKE',
  'LIMIT',
  'MATCH',
  'NATURAL',
  'NO',
  'NOT',
  'NOTHING',
  'NOTNULL',
  'NULL',
  'OF',
  'OFFSET',
  'ON',
  'OR',
  'ORDER',
  'OTHERS',
  'OUTER',
  'OVER',
  'PARTITION',
  'PLAN',
  'PRAGMA',
  'PRECEDING',
  'PRIMARY',
  'QUERY',
  'RAISE',
  'RANGE',
  'RECURSIVE',
  'REFERENCES',
  'REGEXP',
  'REINDEX',
  'RELEASE',
  'RENAME',
  'REPLACE',
  'RESTRICT',
  'RIGHT',
  'ROLLBACK',
  'ROW',
  'ROWS',
  'SAVEPOINT',
  'SELECT',
  'SET',
  'TABLE',
  'TEMP',
  'TEMPORARY',
  'THEN',
  'TIES',
  'TO',
  'TRANSACTION',
  'TRIGGER',
  'UNBOUNDED',
  'UNION',
  'UNIQUE',
  'UPDATE',
  'USING',
  'VACUUM',
  'VALUES',
  'VIEW',
  'VIRTUAL',
  'WHEN',
  'WHERE',
  'WINDOW',
  'WITH',
  'WITHOUT'
];

module.exports = class SQLiteParser extends Parser {
  /**
   * parseKey
   * @param {String} key
   */
  parseKey(key) {
    if (!/^\w+$/.test(key)) return key;
    const keyUpperCase = key.toUpperCase();
    if (keywords.indexOf(keyUpperCase) > -1 || /^\d/.test(key)) return `"${key}"`;
    return key;
  }

  /**
   * build insert sql
   * @param {Object} options
   */
  buildInsertSql(options) {
    const sql = super.buildInsertSql(options);

    // FIX `INSERT IGNORE` generated in think-model-abstract
    // For sqlite, the equivalent syntax for `insert ignore` is `insert or ignore`
    // SEE https://www.sqlite.org/lang_insert.html
    return sql.replace(/^INSERT IGNORE/, 'INSERT OR IGNORE');
  }

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
    if (helper.isNumber(limit)) return ` LIMIT ${limit}`;
    if (helper.isString(limit)) {
      limit = limit.split(/\s*,\s*/);
    }
    if (limit[1]) {
      return ' LIMIT ' + (limit[1] | 0) + ' OFFSET ' + (limit[0] | 0);
    }
    return ' LIMIT ' + (limit[0] | 0);
  }
};
