'use strict';

import net from 'net';

let Valid = {
  /**
   * check value length
   * @param  {String} value []
   * @param  {Number} min   []
   * @param  {Number} max   []
   * @return {Boolean}       []
   */
  length: (value = '', min = 0, max) => {
    let length = value.length;
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
  required: (value = '') => {
    return value.length > 0;
  },
  /**
   * regexp test
   * @param  {String} value []
   * @param  {RegExp} reg   []
   * @return {Boolean}       []
   */
  regexp: (value, reg) => {
    return reg.test(value);
  },
  /**
   * value is email
   * @param  {String} value []
   * @return {Boolean}       []
   */
  email: value => {
    let reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
    return Valid.regexp(value, reg);
  },
  /**
   * unix time
   * @param  {String} value []
   * @return {Boolean}       []
   */
  time: value => {
    let reg = /^[1-5]\d{12}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * chinese name
   * @param  {String} value []
   * @return {Boolean}       []
   */
  cname: value => {
    let reg = /^[\u4e00-\u9fa5\u3002\u2022]{2,32}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * chinese id number
   * @param  {String} value []
   * @return {Boolean}       []
   */
  idnumber: value => {
    if (/^\d{15}$/.test(value)) {
      return true;
    }
    if ((/^\d{17}[0-9xX]$/).test(value)) {
      let vs = '1,0,x,9,8,7,6,5,4,3,2'.split(','),
        ps = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(','),
        ss = value.toLowerCase().split(''),
        r = 0;
      for (let i = 0; i < 17; i++) {
        r += ps[i] * ss[i];
      }
      let isOk = (vs[r % 11] === ss[17]);
      return isOk;
    }
    return false;
  },
  /**
   * mobile
   * @param  {String} value []
   * @return {Boolean}       []
   */
  mobile: value => {
    let reg = /^(13|15|18|14|17)\d{9}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * zip code
   * @param  {String} value []
   * @return {Boolean}       []
   */
  zipcode: value => {
    let reg = /^\d{6}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * value is equal
   * @param  {String} value  []
   * @param  {String} cvalue []
   * @return {Boolean}        []
   */
  confirm: (value, cvalue) => {
    return value === cvalue;
  },
  /**
   * url
   * @return {Boolean} []
   */
  url: value => {
    let reg = /^http(s?):\/\/(?:[A-za-z0-9-]+\.)+[A-za-z]{2,4}(?:[\/\?#][\/=\?%\-&~`@[\]\':+!\.#\w]*)?$/;
    return Valid.regexp(value, reg);
  },
  /**
   * int
   * @param  {String} value []
   * @return {Boolean}       []
   */
  int: value => {
    return Valid.regexp(value, /^\d+$/);
  },
  /**
   * float
   * @param  {String} value []
   * @return {Boolean}       []
   */
  float: value => {
    return think.isNumberString(value);
  },
  /**
   * 整数范围
   * @param  {Number} min []
   * @param  {Number} max []
   * @return {Boolean}     []
   */
  range: (value, min, max) => {
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
  ip4: value => {
    return net.isIPv4(value);
  },
  /**
   * ip6
   * @param  {String} value []
   * @return {Boolean}       []
   */
  ip6: value => {
    return net.isIPv6(value);
  },
  /**
   * ip
   * @param  {String} value []
   * @return {}       []
   */
  ip: value => {
    return !!net.isIP(value);
  },
  /**
   * date
   * @param  {String} value []
   * @return {Boolean}       []
   */
  date: value => {
    let reg = /^\d{4}-\d{1,2}-\d{1,2}$/;
    return Valid.regexp(value, reg);
  },
  /**
   * in
   * @param  {String} value []
   * @param  {Array} arr   []
   * @return {Boolean}     []
   */
  in: (value, arr) => {
    return arr.indexOf(value) > -1;
  },
  /**
   * sql order
   * @param  {String} value []
   * @return {Boolean}       []
   */
  order: value => {
    return value.split(',').every(item => {
      item = item.trim();
      return Valid.regexp(item, /^\w+\s+(?:ASC|DESC)$/i);
    });
  },
  /**
   * sql field
   * @param  {String} value []
   * @return {}       []
   */
  field: value => {
    return value.split(',').every(item => {
      item = item.trim();
      return item === '*' || Valid.regexp(item, /^\w+$/);
    });
  }
};

export default Valid;