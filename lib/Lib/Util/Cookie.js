/**
 * cookie操作
 * @type {Object}
 */
module.exports = {
	/**
	 * 解析
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	parse: function(str){
		"use strict";
		var data = {};
		str.split(/[;,] */).forEach(function(item) {
			var pos = item.indexOf('=');
			if (pos === -1) {
				return;
			}
			var key = item.substr(0, pos).trim();
			var val = item.substr(++pos, item.length).trim();
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
	 * 格式化
	 * @param  {[type]} name    [description]
	 * @param  {[type]} val     [description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	stringify: function(name, value, options){
		"use strict";
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