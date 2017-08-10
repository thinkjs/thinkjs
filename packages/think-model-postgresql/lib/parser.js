const {Parser} = require('think-model-abstract');
const helper = require('think-helper');

module.exports = class PostgreSQLParser extends Parser {
  /**
   * quote key
   * @param {String} key 
   */
  quoteKey(key) {
    if (key === undefined || helper.isEmpty(key)) return '';
    if (helper.isNumber(key) || helper.isNumberString(key)) return key;
    if (/.*\(.*\)/.test(key)) return key;
    if (/(.*[a-z0-9]+)(")([a-z0-9]+.*)/i.test(key)) {
      return key.replace(/(.*[a-z0-9]+)(")([a-z0-9]+.*)/i, '"$1""$3"');
    }
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
        let matches;
        key = key.replace(/"/g, '');
        if (helper.isString(type)) {
          matches = type.match(/.*(ASC|DESC)/i);
        }
        if (matches) {
          type = ' ' + matches[1];
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
};
