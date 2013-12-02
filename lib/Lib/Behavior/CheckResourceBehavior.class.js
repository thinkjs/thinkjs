var path = require("path");
var fs = require("fs");
var mime = require("mime");
/**
 * 静态资源请求
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
	return {
		options: {
			'url_resource_on': false,
			'url_resource_suffix': []
		},
		run: function(){
			if (!RESOURCE_PATH || !this.options.url_resource_on || !this.http.pathname) {
				return false;
			};
			var extname = path.extname(this.http.pathname);
			if (!extname) {
				return false;
			};
			extname = extname.toLowerCase();
			if (extname.substr(0, 1) === '.') {
				extname = extname.substr(1);
			};
			//如果不在配置列表里，则不为静态资源请求
			if (this.options.url_resource_suffix.indexOf(extname) === -1) {
				return false;
			};
			var file = RESOURCE_PATH + "/" + this.http.pathname;
			//标记静态资源的请求
			this.http.is_resource_request = true;
			var res = this.http.res;
			if (fs.existsSync(file)) {
				var contentType = mime.lookup(file);
				var fileStream = fs.createReadStream(file);
	            res.setHeader("Content-Type", contentType);
	            fileStream.pipe(res);
	            fileStream.on("end", function(){
	                res.end();
	            })
			}else{
				res.statusCode = 404;
				res.end();
			}
			return true;
		}
	}
})