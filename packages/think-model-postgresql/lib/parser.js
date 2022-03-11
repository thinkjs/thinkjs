const { Parser } = require('think-model-abstract');
const helper = require('think-helper');

// https://www.postgresql.org/docs/8.1/static/sql-keywords-appendix.html
// const keywords = ['ABORT', 'ABS', 'ABSOLUTE', 'ACCESS', 'ACTION', 'ADA', 'ADD', 'ADMIN', 'AFTER', 'AGGREGATE', 'ALIAS', 'ALL', 'ALLOCATE', 'ALTER', 'ANALYSE', 'ANALYZE', 'AND', 'ANY', 'ARE', 'ARRAY', 'AS', 'ASC', 'ASENSITIVE', 'ASSERTION', 'ASSIGNMENT', 'ASYMMETRIC', 'AT', 'ATOMIC', 'AUTHORIZATION', 'AVG', 'BACKWARD', 'BEFORE', 'BEGIN', 'BETWEEN', 'BINARY', 'BIT', 'BITVAR', 'BIT_LENGTH', 'BLOB', 'BOOLEAN', 'BOTH', 'BREADTH', 'BY', 'C', 'CACHE', 'CALL', 'CALLED', 'CARDINALITY', 'CASCADE', 'CASCADED', 'CASE', 'CAST', 'CATALOG', 'CATALOG_NAME', 'CHAIN', 'CHAR', 'CHARACTER', 'CHARACTERISTICS', 'CHARACTER_LENGTH', 'CHARACTER_SET_CATALOG', 'CHARACTER_SET_NAME', 'CHARACTER_SET_SCHEMA', 'CHAR_LENGTH', 'CHECK', 'CHECKED', 'CHECKPOINT', 'CLASS', 'CLASS_ORIGIN', 'CLOB', 'CLOSE', 'CLUSTER', 'COALESCE', 'COBOL', 'COLLATE', 'COLLATION', 'COLLATION_CATALOG', 'COLLATION_NAME', 'COLLATION_SCHEMA', 'COLUMN', 'COLUMN_NAME', 'COMMAND_FUNCTION', 'COMMAND_FUNCTION_CODE', 'COMMENT', 'COMMIT', 'COMMITTED', 'COMPLETION', 'CONDITION_NUMBER', 'CONNECT', 'CONNECTION', 'CONNECTION_NAME', 'CONSTRAINT', 'CONSTRAINTS', 'CONSTRAINT_CATALOG', 'CONSTRAINT_NAME', 'CONSTRAINT_SCHEMA', 'CONSTRUCTOR', 'CONTAINS', 'CONTINUE', 'CONVERT', 'COPY', 'CORRESPONDING', 'COUNT', 'CREATE', 'CREATEDB', 'CREATEUSER', 'CROSS', 'CUBE', 'CURRENT', 'CURRENT_DATE', 'CURRENT_PATH', 'CURRENT_ROLE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'CURRENT_USER', 'CURSOR', 'CURSOR_NAME', 'CYCLE', 'DATA', 'DATABASE', 'DATE', 'DATETIME_INTERVAL_CODE', 'DATETIME_INTERVAL_PRECISION', 'DAY', 'DEALLOCATE', 'DEC', 'DECIMAL', 'DECLARE', 'DEFAULT', 'DEFERRABLE', 'DEFERRED', 'DEFINED', 'DEFINER', 'DELETE', 'DELIMITERS', 'DEPTH', 'DEREF', 'DESC', 'DESCRIBE', 'DESCRIPTOR', 'DESTROY', 'DESTRUCTOR', 'DETERMINISTIC', 'DIAGNOSTICS', 'DICTIONARY', 'DISCONNECT', 'DISPATCH', 'DISTINCT', 'DO', 'DOMAIN', 'DOUBLE', 'DROP', 'DYNAMIC', 'DYNAMIC_FUNCTION', 'DYNAMIC_FUNCTION_CODE', 'EACH', 'ELSE', 'ENCODING', 'ENCRYPTED', 'END', 'END-EXEC', 'EQUALS', 'ESCAPE', 'EVERY', 'EXCEPT', 'EXCEPTION', 'EXCLUSIVE', 'EXEC', 'EXECUTE', 'EXISTING', 'EXISTS', 'EXPLAIN', 'EXTERNAL', 'EXTRACT', 'FALSE', 'FETCH', 'FINAL', 'FIRST', 'FLOAT', 'FOR', 'FORCE', 'FOREIGN', 'FORTRAN', 'FORWARD', 'FOUND', 'FREE', 'FREEZE', 'FROM', 'FULL', 'FUNCTION', 'G', 'GENERAL', 'GENERATED', 'GET', 'GLOBAL', 'GO', 'GOTO', 'GRANT', 'GRANTED', 'GROUP', 'GROUPING', 'HANDLER', 'HAVING', 'HIERARCHY', 'HOLD', 'HOST', 'HOUR', 'IDENTITY', 'IGNORE', 'ILIKE', 'IMMEDIATE', 'IMPLEMENTATION', 'IN', 'INCREMENT', 'INDEX', 'INDICATOR', 'INFIX', 'INHERITS', 'INITIALIZE', 'INITIALLY', 'INNER', 'INOUT', 'INPUT', 'INSENSITIVE', 'INSERT', 'INSTANCE', 'INSTANTIABLE', 'INSTEAD', 'INT', 'INTEGER', 'INTERSECT', 'INTERVAL', 'INTO', 'INVOKER', 'IS', 'ISNULL', 'ISOLATION', 'ITERATE', 'JOIN', 'K', 'KEY', 'KEY_MEMBER', 'KEY_TYPE', 'LANCOMPILER', 'LANGUAGE', 'LARGE', 'LAST', 'LATERAL', 'LEADING', 'LEFT', 'LENGTH', 'LESS', 'LEVEL', 'LIKE', 'LIMIT', 'LISTEN', 'LOAD', 'LOCAL', 'LOCALTIME', 'LOCALTIMESTAMP', 'LOCATION', 'LOCATOR', 'LOCK', 'LOWER', 'M', 'MAP', 'MATCH', 'MAX', 'MAXVALUE', 'MESSAGE_LENGTH', 'MESSAGE_OCTET_LENGTH', 'MESSAGE_TEXT', 'METHOD', 'MIN', 'MINUTE', 'MINVALUE', 'MOD', 'MODE', 'MODIFIES', 'MODIFY', 'MODULE', 'MONTH', 'MORE', 'MOVE', 'MUMPS', 'NAME', 'NAMES', 'NATIONAL', 'NATURAL', 'NCHAR', 'NCLOB', 'NEW', 'NEXT', 'NO', 'NOCREATEDB', 'NOCREATEUSER', 'NONE', 'NOT', 'NOTHING', 'NOTIFY', 'NOTNULL', 'NULL', 'NULLABLE', 'NULLIF', 'NUMBER', 'NUMERIC', 'OBJECT', 'OCTET_LENGTH', 'OF', 'OFF', 'OFFSET', 'OIDS', 'OLD', 'ON', 'ONLY', 'OPEN', 'OPERATION', 'OPERATOR', 'OPTION', 'OPTIONS', 'OR', 'ORDER', 'ORDINALITY', 'OUT', 'OUTER', 'OUTPUT', 'OVERLAPS', 'OVERLAY', 'OVERRIDING', 'OWNER', 'PAD', 'PARAMETER', 'PARAMETERS', 'PARAMETER_MODE', 'PARAMETER_NAME', 'PARAMETER_ORDINAL_POSITION', 'PARAMETER_SPECIFIC_CATALOG', 'PARAMETER_SPECIFIC_NAME', 'PARAMETER_SPECIFIC_SCHEMA', 'PARTIAL', 'PASCAL', 'PASSWORD', 'PATH', 'PENDANT', 'PLI', 'POSITION', 'POSTFIX', 'PRECISION', 'PREFIX', 'PREORDER', 'PREPARE', 'PRESERVE', 'PRIMARY', 'PRIOR', 'PRIVILEGES', 'PROCEDURAL', 'PROCEDURE', 'PUBLIC', 'READ', 'READS', 'REAL', 'RECURSIVE', 'REF', 'REFERENCES', 'REFERENCING', 'REINDEX', 'RELATIVE', 'RENAME', 'REPEATABLE', 'REPLACE', 'RESET', 'RESTRICT', 'RESULT', 'RETURN', 'RETURNED_LENGTH', 'RETURNED_OCTET_LENGTH', 'RETURNED_SQLSTATE', 'RETURNS', 'REVOKE', 'RIGHT', 'ROLE', 'ROLLBACK', 'ROLLUP', 'ROUTINE', 'ROUTINE_CATALOG', 'ROUTINE_NAME', 'ROUTINE_SCHEMA', 'ROW', 'ROWS', 'ROW_COUNT', 'RULE', 'SAVEPOINT', 'SCALE', 'SCHEMA', 'SCHEMA_NAME', 'SCOPE', 'SCROLL', 'SEARCH', 'SECOND', 'SECTION', 'SECURITY', 'SELECT', 'SELF', 'SENSITIVE', 'SEQUENCE', 'SERIALIZABLE', 'SERVER_NAME', 'SESSION', 'SESSION_USER', 'SET', 'SETOF', 'SETS', 'SHARE', 'SHOW', 'SIMILAR', 'SIMPLE', 'SIZE', 'SMALLINT', 'SOME', 'SOURCE', 'SPACE', 'SPECIFIC', 'SPECIFICTYPE', 'SPECIFIC_NAME', 'SQL', 'SQLCODE', 'SQLERROR', 'SQLEXCEPTION', 'SQLSTATE', 'SQLWARNING', 'START', 'STATE', 'STATEMENT', 'STATIC', 'STATISTICS', 'STDIN', 'STDOUT', 'STRUCTURE', 'STYLE', 'SUBCLASS_ORIGIN', 'SUBLIST', 'SUBSTRING', 'SUM', 'SYMMETRIC', 'SYSID', 'SYSTEM', 'SYSTEM_USER', 'TABLE', 'TABLE_NAME', 'TEMP', 'TEMPLATE', 'TEMPORARY', 'TERMINATE', 'THAN', 'THEN', 'TIME', 'TIMESTAMP', 'TIMEZONE_HOUR', 'TIMEZONE_MINUTE', 'TO', 'TOAST', 'TRAILING', 'TRANSACTION', 'TRANSACTIONS_COMMITTED', 'TRANSACTIONS_ROLLED_BACK', 'TRANSACTION_ACTIVE', 'TRANSFORM', 'TRANSFORMS', 'TRANSLATE', 'TRANSLATION', 'TREAT', 'TRIGGER', 'TRIGGER_CATALOG', 'TRIGGER_NAME', 'TRIGGER_SCHEMA', 'TRIM', 'TRUE', 'TRUNCATE', 'TRUSTED', 'TYPE', 'UNCOMMITTED', 'UNDER', 'UNENCRYPTED', 'UNION', 'UNIQUE', 'UNKNOWN', 'UNLISTEN', 'UNNAMED', 'UNNEST', 'UNTIL', 'UPDATE', 'UPPER', 'USAGE', 'USER', 'USER_DEFINED_TYPE_CATALOG', 'USER_DEFINED_TYPE_NAME', 'USER_DEFINED_TYPE_SCHEMA', 'USING', 'VACUUM', 'VALID', 'VALUE', 'VALUES', 'VARCHAR', 'VARIABLE', 'VARYING', 'VERBOSE', 'VERSION', 'VIEW', 'WHEN', 'WHENEVER', 'WHERE', 'WITH', 'WITHOUT', 'WORK', 'WRITE', 'YEAR', 'ZONE'];

module.exports = class PostgreSQLParser extends Parser {
  /**
   * parse key
   * @param {String} key
   */
  parseKey(key) {
    return `"${key}"`;
  }
  /**
   * parse group
   * @param  {String} group []
   * @return {String}       []
   */
  parseGroup(group) {
    if (helper.isEmpty(group)) return '';
    if (helper.isString(group)) {
      // group may be `date_format(create_time,'%Y-%m-%d')`
      if (group.indexOf('(') !== -1) return ` GROUP BY ${group}`;
      group = group.split(/\s*,\s*/);
    }
    let result;
    if (helper.isArray(group)) {
      const regexp = /(.*) (ASC|DESC)/i;
      result = group.map(item => {
        item = item.replace(/"/g, '');
        let type = '';
        const matches = item.match(regexp);
        if (matches) {
          type = ` ${matches[2]}`;
          item = item.replace(regexp, '$1');
        }
        if (item.indexOf('.') === -1) {
          return `"${item}"${type}`;
        } else {
          item = item.split('.');
          return `"${item[0]}"."${item[1]}"${type}`;
        }
      });
      return ` GROUP BY ${result.join(', ')}`;
    }
    /**
     * Example: { 'name': 'DESC' } || { 'name': -1 }
     */
    if (helper.isObject(group)) {
      result = [];
      for (let key in group) {
        let type = group[key];
        key = key.replace(/"/g, '');

        if (helper.isString(type)) {
          const matches = type.match(/.*(ASC|DESC)/i);
          if (matches) {
            type = ' ' + matches[1];
          }
        } else if (helper.isNumber(type) || helper.isNumberString(type)) {
          type = parseInt(type) === -1 ? ' DESC' : ' ASC';
        }

        if (key.indexOf('.') === -1) {
          result.push(`"${key}"${type}`);
        } else {
          key = key.split('.');
          result.push(`"${key[0]}"."${key[1]}"${type}`);
        }
      }
      return ` GROUP BY ${result.join(', ')}`;
    }
  }
  /**
   * parse limit
   * @param  {String} limit []
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
  /**
   * parse value
   * @param  {Mixed} value []
   * @return {Mixed}       []
   */
  parseValue(value) {
    if (helper.isString(value)) return 'E\'' + this.escapeString(value) + '\'';
    if (helper.isArray(value)) {
      if (/^exp$/i.test(value[0])) {
        return value[1];
      } else {
        return value.map(item => this.parseValue(item));
      }
    }
    if (helper.isBoolean(value)) return value ? 'true' : 'false';
    if (helper.isBuffer(value)) return `'\\x${value.toString('hex')}'`;
    if (value === null) return 'null';
    return value;
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
  /**
   * escape string
   * @param {String} str
   */
  escapeString(str) {
    return str.replace(/'/g, "\\'");
  }
};
