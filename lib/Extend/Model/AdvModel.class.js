/**
 * 高级模型
 * @return {[type]} [description]
 */
module.exports = Model(function(){
	return {
		/**
		 * 关联定义
		 * @type {Object}
		 */
		relation: {},
		/**
		 * 返回数据里含有count信息的查询
		 * @return {[type]} [description]
		 */
		countSelect: function(opts){
			var self = this;
			var options = {};
            return this.parseOptions(opts).then(function(opts){
            	options = opts;
                return self.count();
            }).then(function(count){
            	console.log(options)
            })
		}
	}
})