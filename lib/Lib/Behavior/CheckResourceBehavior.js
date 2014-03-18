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
			var reg = C('url_resource_reg');
			//通过正则判断是否是静态资源请求
			if (!reg.test(this.http.pathname)) {
				return false;
			};
			var file = RESOURCE_PATH + "/" + this.http.pathname;
			var res = this.http.res;
			if (fs.existsSync(file)) {
				var contentType = mime.lookup(file);
				var fileStream = fs.createReadStream(file);
	            res.setHeader("Content-Type", contentType + ";charset=" + C('encoding'));
	            fileStream.pipe(res);
	            fileStream.on("end", function(){
	                res.end();
	            })
			}else{
				res.statusCode = 404;
				res.end();
			}
			return getDefer().promise;
		}
	}
})