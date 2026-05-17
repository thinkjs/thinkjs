const helper = require('think-helper');
const {ObjectID} = require('mongodb');

const comparison = {
  'EQ': '$eq',
  '=': '$eq',
  'NEQ': '$ne',
  '!=': '$ne',
  '<>': '$ne',
  'GT': '$gt',
  '>': '$gt',
  'EGT': '$gte',
  '>=': '$gte',
  'LT': '$lt',
  '<': '$lt',
  'ELT': '$lte',
  '<=': '$lte',
  'OR': '$or',
  'IN': '$in',
  'NOTIN': '$nin'
};

const isMongoId = str => {
  return /^[0-9A-F]{24}$/i.test(str);
};

module.exports = class Parser {
  constructor() {
    this.comparison = comparison;
  }
  /**
   * parse field
   * @param  {String} field   []
   * @param  {Boolean} reverse []
   * @return {Object}         []
   */
  parseField(field, reverse) {
    if (!field) return {};
    if (helper.isString(field)) {
      field = field.split(/\s*,\s*/);
    }
    if (helper.isArray(field)) {
      const result = {};
      field.forEach(item => {
        result[item] = reverse ? 0 : 1;
      });
      return result;
    }
    if (reverse) {
      for (const key in field) {
        field[key] = 0;
      }
    }
    return field;
  }
  /**
   * parse limit
   * @param  {Object} collection []
   * @param  {Array} limit      []
   * @return {Object}            []
   */
  parseLimit(limit) {
    if (!limit) return [];
    if (helper.isNumber(limit)) {
      return [0, limit];
    }
    if (helper.isString(limit)) {
      limit = limit.split(/\s*,\s*/);
    }
    const skip = limit[0] | 0;
    const limitNum = limit[1] | 0;
    if (limitNum) {
      return [skip, limitNum];
    }
    return [0, skip];
  }
  /**
   * parse order
   * @param  {String} order []
   * @return {Object}       []
   */
  parseOrder(order) {
    if (!order) return {};
    if (order === true || order === 'natural') {
      return {
        $natural: 1
      };
    }
    if (helper.isString(order)) {
      order = order.split(/\s*,\s*/);
      const result = {};
      order.forEach(item => {
        item = item.split(' ');
        const type = (item[1] || '').toLowerCase();
        result[item[0].trim()] = type === 'desc' ? -1 : 1;
      });
      return result;
    }

    for (const key in order) {
      if ([false, 0, -1].indexOf(order[key]) > -1) {
        order[key] = -1;
      } else {
        order[key] = (helper.isString(order[key]) && order[key].toLowerCase() === 'desc') ? -1 : 1;
      }
    }
    return order;
  }
  /**
   * parse group
   * @param  {String} group []
   * @return {Object}       []
   */
  parseGroup(group) {
    if (helper.isEmpty(group)) return '';
    if (helper.isString(group)) {
      group = group.split(/\s*,\s*/);
    }
    return group;
  }
  /**
   * parse where
   * http://docs.mongodb.org/manual/reference/operator/query/
   * @param  {Object} where []
   * @return {Object}       []
   */
  parseWhere(where) {
    if (helper.isArray(where)) {
      return where.map(item => {
        return this.parseWhere(item);
      });
    }

    if (helper.isObject(where)) {
      const result = {};
      for (let key in where) {
        let value = where[key];
        if (value instanceof ObjectID) {
          result[key] = value;
          continue;
        }
        if (key === '_id' && helper.isString(value) && isMongoId(value)) {
          result[key] = ObjectID(value);
          continue;
        }
        key = this.comparison[key] || key;
        if (helper.isObject(value) || helper.isArray(value)) {
          value = this.parseWhere(value);
        }
        result[key] = value;
      }
      return result;
    }
    return (where === undefined ? {} : where);
  }
  /**
   * parse distinct
   * @param  {String} distinct []
   * @return {String}          []
   */
  parseDistinct(distinct) {
    return distinct;
  }
};
