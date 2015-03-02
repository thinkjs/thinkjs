'use strict';

/**
 * cookie操作
 * @type {Object}
 */
module.exports = {
  /**
   * parse cookie
   * @param  {String} str [cookie string]
   * @return {Object}     []
   */
  parse: function(str){
    var data = {};
    str.split(/; */).forEach(function(item) {
      var pos = item.indexOf('=');
      if (pos === -1) {
        return;
      }
      var key = item.substr(0, pos).trim();
      var val = item.substr(pos + 1).trim();
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
  stringify: function(name, value, options){
    options = options || {};
    var item = [name + '=' + encodeURIComponent(value)];
    if (options.maxage) {
      item.push('Max-Age=' + options.maxage);
    }
    if (options.domain) {
      item.push('Domain=' + options.domain);
    }
    if (options.path) {
      item.push('Path=' + options.path);
    }
    var expires = options.expires;
    if (expires){
      if (!isDate(expires)) {
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
  }
}