'use strict';

import crypto from 'crypto';
/**
 * cookie
 * @type {Object}
 */
let Cookie = {
  /**
   * parse cookie
   * @param  {String} str [cookie string]
   * @return {Object}     []
   */
  parse: str => {
    let data = {};
    if (!str) {
      return data;
    }
    str.split(/; */).forEach(item => {
      let pos = item.indexOf('=');
      if (pos === -1) {
        return;
      }
      let key = item.substr(0, pos).trim();
      let val = item.substr(pos + 1).trim();
      if ('"' === val[0]) {
        val = val.slice(1, -1);
      }
      // only assign once
      if (undefined === data[key]) {
        try {
          data[key] = decodeURIComponent(val);
        } catch (e) {
          data[key] = val;
        }
      }
    });
    return data;
  },
  /**
   * stringify cookie
   * @param  {String} name    [cookie name]
   * @param  {String} val     [cookie value]
   * @param  {Object} options [cookie options]
   * @return {String}         []
   */
  stringify: (name, value, options) => {
    options = options || {};
    let item = [name + '=' + encodeURIComponent(value)];
    if (options.maxage) {
      item.push('Max-Age=' + options.maxage);
    }
    if (options.domain) {
      item.push('Domain=' + options.domain);
    }
    if (options.path) {
      item.push('Path=' + options.path);
    }
    let expires = options.expires;
    if (expires){
      if (!think.isDate(expires)) {
        expires = new Date(expires);
      }
      item.push('Expires=' + expires.toUTCString());
    } 
    if (options.httponly) {
      item.push('HttpOnly');
    }
    if (options.secure) {
      item.push('Secure');
    }
    return item.join('; ');
  },
  /**
   * sign cookie
   * @param  {String} val    [cookie value]
   * @param  {String} secret [cookie sign]
   * @return {String}        []
   */
  sign: (val, secret = '') => {
    secret = crypto.createHmac('sha256', secret).update(val).digest('base64');
    secret = secret.replace(/\=+$/, '');
    return val + '.' + secret;
  },
  /**
   * unsign cookie
   * @param  {String} val    [signed cookie value]
   * @param  {String} secret [cookie sign]
   * @return {String}        []
   */
  unsign: (val, secret) => {
    let str = val.slice(0, val.lastIndexOf('.'));
    return Cookie.sign(str, secret) === val ? str : '';
  }
};

export default Cookie;