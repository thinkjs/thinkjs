/**
 * 阻止ip来源访问
 * @return {[type]} [description]
 */
module.exports = Behavior(function(){
	return {
		options: {
			deny_ip: [] //阻止的ip列表
		},
		run: function(){
			if (this.options.deny_ip.length === 0) {
				return true;
			};
			var clientIps = this.http.ip().split(".");
			var flag = this.options.deny_ip.some(function(item){
				return item.split(".").every(function(num, i){
					if (num === "*" || num === clientIps[i]) {
						return true;
					};
				})
			});
			//如果在阻止的ip在列表里，则返回一个不会resolve的promise
			//从而让后面的代码不执行
			if (flag) {
				this.http.res.statusCode = 403;
				this.http.res.end(); 
				return getDefer().promise;
			};
			return true;
		}
	}
});