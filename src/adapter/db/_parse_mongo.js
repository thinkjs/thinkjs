'use strict';

export default class extends think.base {
  /**
   * init
   * @return {} []
   */
  init(){
    this.comparison = {
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
  }
  /**
   * parse field
   * @param  {String} field   []
   * @param  {Boolean} reverse []
   * @return {Object}         []
   */
  parseField(field, reverse){
    if(!field){
      return {};
    }
    if(think.isString(field)){
      field = field.split(/\s*,\s*/);
    }
    if(think.isArray(field)){
      let result = {};
      field.forEach(item => {
        result[item] = reverse ? 0 : 1;
      });
      return result;
    }
    if(reverse){
      for(let key in field){
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
  parseLimit(limit){
    if(!limit){
      return [];
    }
    if(think.isNumber(limit)){
      return [0, limit];
    }
    if(think.isString(limit)){
      limit = limit.split(/\s*,\s*/);
    }
    let skip = limit[0] | 0;
    let limitNum = limit[1] | 0;
    if(limitNum){
      return [skip, limitNum];
    }
    return [0, skip];
  }
  /**
   * parse order
   * @param  {String} order []
   * @return {Object}       []
   */
  parseOrder(order){
    if(!order){
      return {};
    }
    if(order === true || order === 'natural'){
      return {
        $natural: 1
      };
    }
    if(think.isString(order)){
      order = order.split(/\s*,\s*/);
      let result = {};
      order.forEach(item => {
        item = item.split(' ');
        let type = (item[1] || '').toLowerCase();
        result[item[0].trim()] = type === 'desc' ? -1 : 1;
      });
      return result;
    }
    for(let key in order){
      if(order[key] === false || order[key] === 0){
        order[key] = -1;
      }else if(order[key] !== -1){
        order[key] = 1;
      }
    }
    return order;
  }
  /**
   * parse group
   * @param  {String} group []
   * @return {Object}       []
   */
  parseGroup(group){
    if (think.isEmpty(group)) {
      return '';
    }
    if (think.isString(group)) {
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
  parseWhere(where){

    if(think.isArray(where)){
      return where.map(item => {
        return this.parseWhere(item);
      });
    }
    
    if(think.isObject(where)){
      let result = {};
      for(let key in where){
        let value = where[key];
        if(key === '_id' && think.isString(value)){
          let validator = think.require('validator');
          if(validator.mongoId(value)){
            let {ObjectID} = think.require('mongodb');
            result[key] = ObjectID(value);
            continue;
          }
        }
        key = this.comparison[key] || key;
        if(think.isObject(value) || think.isArray(value)){
          value = this.parseWhere(value);
        }
        result[key] = value;
      }
      return result;
    }
    return where || {};
  }
  /**
   * parse distinct
   * @param  {String} distinct []
   * @return {String}          []
   */
  parseDistinct(distinct){
    return distinct;
  }
}