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
		countSelect: function(options){
			var self = this;
            return this.parseOptions(options).then(function(options){
                var result = self.db.select(options);
                return getPromise(self._afterSelect(result, options)).then(function(result){
                    if (result === false) {
                        return getPromise("_afterSelect return false", true);
                    };
                    return result;
                })
            });
		}
	}
})