'use strict';

/**
 * 过滤器
 * @return {[type]} [description]
 */
var Filter = module.exports = {
  /**
   * 分页
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  page: function(value){
    return this.id(value) || 1;
  },
  /**
   * xxx asc,yyy desc
   * @return {[type]} [description]
   */
  order: function(value){
    if (isString(value)) {
      value = value.split(',');
    }
    if (!isArray(value)) {
      return '';
    }
    return value.filter(function(item){
      item = item.trim().split(' ');
      var field = item[0];
      var type = item[1];
      if (/^(ASC|DESC)$/i.test(type) && /^[\w]+$/.test(field)) {
        return field + ' ' + type;
      }
    }).join(',');
  },
  /**
   * 大于0
   * @return {[type]} [description]
   */
  id: function(value){
    value = parseInt(value + '', 10);
    if (value > 0) {
      return value;
    }
    return 0;
  },
  /**
   * id列表
   * @return {[type]} [description]
   */
  ids: function(value, split){
    if (isNumber(value)) {
      value = this.id(value);
      if (value) {
        return [value];
      }
      return [];
    }
    if (isString(value)) {
      value = value.split(split || ',');
    }
    if (!isArray(value)) {
      return [];
    }
    var ret = [];
    for(var i = 0, length = value.length; i < length; i++){
      var item = (value[i] + '').trim();
      item = parseInt(item, 10);
      if (item > 0) {
        ret.push(item);
      }
    }
    return ret;
  },
  /**
   * 是否在一个中
   * @param  {[type]} value [description]
   * @param  {[type]} arr   [description]
   * @return {[type]}       [description]
   */
  in: function(value, arr){
    if (!isArray(arr)) {
      arr = [arr];
    }
    if(arr.indexOf(value) > -1){
      return value;
    }
    return '';
  },
  /**
   * 将字符串切割为数组
   * @param  {[type]} value [description]
   * @param  {[type]} split [description]
   * @return {[type]}       [description]
   */
  strs: function(value, split){
    if (isString(value)) {
      value = value.split(split || ',');
    }
    if (!isArray(value)) {
      return [];
    }
    return value.filter(function(item){
      return (item + '').trim();
    });
  },
  /**
   * 忽略某些值
   * @param  {[type]} data        [description]
   * @param  {[type]} ignoreValue [description]
   * @return {[type]}             [description]
   */
  ignore: function(data, ignoreValue){
    if (!isObject(data)) {
      return data;
    }
    if (ignoreValue === true) {
      ignoreValue = [0, undefined, null, ''];
    }else if (!isArray(ignoreValue)) {
      ignoreValue = [ignoreValue];
    }
    var result = {};
    for(var key in data){
      if (ignoreValue.indexOf(data[key]) === -1) {
        result[key] = data[key];
      }
    }
    return result;
  }
};
/**
 * 调用一个过滤器
 * @param  {[type]} data [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
Filter.filter = function(value, type){
  var fn = Filter[type];
  if (typeof fn === 'function') {
    var args = [].slice.call(arguments, 2);
    args.unshift(value);
    return Filter[type].apply(Filter, args);
  }
  return false;
};