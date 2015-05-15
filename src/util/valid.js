'use strict';

var net = require('net');

var Valid = module.exports = {
  /**
   * check value length
   * @param  {String} value []
   * @param  {Number} min   []
   * @param  {Number} max   []
   * @return {Boolean}       []
   */
  length: function(value, min, max){
    value = value + '';
    min = min | 0;
    var length = value.length;
    if (length < min) {
      return false;
    }
    if (max && length > max) {
      return false;
    }
    return true;
  },
  /**
   * required
   * @param  {String} value []
   * @return {Boolean}       []
   */
  required: function(value){
    value = value + '';
    return value.length > 0;
  },
  /**
   * regexp test
   * @param  {String} value []
   * @param  {RegExp} reg   []
   * @return {Boolean}       []
   */
  regexp: function(value, reg){
    return reg.test(value);
  },
  /**
   * value is email
   * @param  {String} value []
   * @return {Boolean}       []
   */
  email: function(value){
    var reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
    return Valid.regexp(value, reg);
  },
  /**
   * unix time
   * @param  {String} value []
   * @return {Boolean}       []
   */
  time: function(value){
    var reg = /^[1-5]\d{12}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * chinese name
   * @param  {String} value []
   * @return {Boolean}       []
   */
  cnname: function(value){
    var reg = /^[\u4e00-\u9fa5\u3002\u2022]{2,32}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * chinese id number
   * @param  {String} value []
   * @return {Boolean}       []
   */
  idnumber: function(value){
    if (/^\d{15}$/.test(value)) {
      return true;
    }
    if ((/^\d{17}[0-9xX]$/).test(value)) {
      var vs = '1,0,x,9,8,7,6,5,4,3,2'.split(','),
        ps = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(','),
        ss = value.toLowerCase().split(''),
        r = 0;
      for (var i = 0; i < 17; i++) {
        r += ps[i] * ss[i];
      }
      var isOk = (vs[r % 11] === ss[17]);
      return isOk;
    }
    return false;
  },
  /**
   * mobile
   * @param  {String} value []
   * @return {Boolean}       []
   */
  mobile: function(value){
    var reg = /^(13|15|18|14|17)\d{9}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * zip code
   * @param  {String} value []
   * @return {Boolean}       []
   */
  zipcode: function(value){
    var reg = /^\d{6}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * value is equal
   * @param  {String} value  []
   * @param  {String} cvalue []
   * @return {Boolean}        []
   */
  confirm: function(value, cvalue){
    return value === cvalue;
  },
  /**
   * url
   * @return {Boolean} []
   */
  url: function(value){
    var reg = /^http(s?):\/\/(?:[A-za-z0-9-]+\.)+[A-za-z]{2,4}(?:[\/\?#][\/=\?%\-&~`@[\]\':+!\.#\w]*)?$/;
    return Valid.regexp(value, reg);
  },
  /**
   * int
   * @param  {String} value []
   * @return {Boolean}       []
   */
  int: function(value){
    return Valid.regexp(value, /^\d+$/);
  },
  /**
   * float
   * @param  {String} value []
   * @return {Boolean}       []
   */
  float: function(value){
    return think.isNumberString(value);
  },
  /**
   * 整数范围
   * @param  {Number} min []
   * @param  {Number} max []
   * @return {Boolean}     []
   */
  range: function(value, min, max){
    if (!Valid.int(value)) {
      return false;
    }
    min = min | 0;
    if (value < min) {
      return false;
    }
    if (max && value > max) {
      return false;
    }
    return true;
  },
  /**
   * ip4
   * @param  {String} value []
   * @return {}       []
   */
  ip4: function(value){
    return net.isIPv4(value);
  },
  /**
   * ip6
   * @param  {String} value []
   * @return {Boolean}       []
   */
  ip6: function(value){
    return net.isIPv6(value);
  },
  /**
   * ip
   * @param  {String} value []
   * @return {}       []
   */
  ip: function(value){
    return net.isIP(value);
  },
  /**
   * date
   * @param  {String} value []
   * @return {Boolean}       []
   */
  date: function(value){
    var reg = /^\d{4}-\d{1,2}-\d{1,2}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * in
   * @param  {String} value []
   * @param  {Array} arr   []
   * @return {Boolean}     []
   */
  in: function(value, arr){
    return arr.indexOf(value) > -1;
  },
  /**
   * sql order
   * @param  {String} value []
   * @return {Boolean}       []
   */
  order: function(value){
    return value.split(',').map(function(item){
      return Valid.regexp(item, /^\w+\s+(?:ASC|DESC)$/i);
    })
  },
  /**
   * sql field
   * @param  {String} value []
   * @return {}       []
   */
  field: function(value){
    return value.split(',').map(function(item){
      return item === '*' || Valid.regexp(item, /^\w+$/);
    })
  }
};