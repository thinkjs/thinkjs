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
			var pathname = this.http.pathname;
			if (pathname.indexOf('/') === 0) {
				pathname = pathname.substr(1);
			};
			var reg = C('url_resource_reg');
			//通过正则判断是否是静态资源请求
			if (!reg.test(pathname)) {
				return false;
			};
			var file = RESOURCE_PATH + "/" + pathname;
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
			//返回一个pendding promise, 不让后续执行
			return getDefer().promise;
		}
	}
})