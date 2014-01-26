/**
 * 模版文件列表
 * @type {Object}
 */
var tplFiles = {};
var path = require("path");
var fs = require("fs");
/**
 * 写入html缓存
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
	return {
		options: {
			"html_cache_on": false //是否开启缓存
		},
		run: function(content){
			if (!this.options.html_cache_on || !this.http.html_filename) {
				return content;
			};
			this.recordViewFile();
			var file = HTML_PATH + "/" + this.http.html_filename;
			mkdir(path.dirname(file));
			//异步方式写入缓存
			fs.writeFile(file, content);
			return content;
		},
		/**
		 * 记录模版文件名
		 * @return {[type]} [description]
		 */
		recordViewFile: function(){
			var tplFile = this.http.tpl_file;
			var key = this.http.group + ":" + this.http.controller + ":" + this.http.action;
			tplFiles[key] = tplFile;
		}
	}
})
/**
 * 获取模版文件
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
module.exports.getViewFile = function(http){
	var key = http.group + ":" + http.controller + ":" + http.action;
	return tplFiles[key];
}