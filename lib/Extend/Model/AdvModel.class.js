/**
 * 高级模型
 * @return {[type]} [description]
 */
module.exports = Model(function(){
	//解析page参数
	var parsePage = function(options){
		if ("page" in options) {
			var page = options.page + "";
            var num = 0;
            if (page.indexOf(",") > -1) {
                page = page.split(",");
                num = parseInt(page[1], 10);
                page = page[0];
            }
            num = num || C('db_nums_per_page')
            page = parseInt(page, 10) || 1;
            return {
            	page: page,
            	num: num
            }
		};
		return {
			page: 1,
			num: C('db_nums_per_page')
		}
	}
	return {
		/**
		 * 关联定义
		 * @type {Object}
		 */
		relation: {},
		/**
		 * 返回数据里含有count信息的查询
		 * @param  options  查询选项
		 * @param  pageFlag 当页面不合法时，处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
		 * @return promise         
		 */
		countSelect: function(options, pageFlag){
			if (isBoolean(options)) {
				pageFlag = options;
				options = {};
			};
			var self = this;
			//解析后的options
			var parsedOptions = {};
			var result = {};
            return this.parseOptions().then(function(options){
            	parsedOptions = options;
            	return self.options({
            		where: options.where
            	}).count(self.getPk());
            }).then(function(count){
            	var pageOptions = parsePage(parsedOptions);
            	var totalPage = Math.ceil(count / pageOptions.num);
            	if (isBoolean(pageFlag)) {
            		if (pageOptions.page > totalPage) {
            			pageOptions.page = pageFlag === true ? 1 : totalPage;
            		};
            		parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
            	};
            	result = extend({count: count, totalPage: totalPage}, pageOptions);
            	return self.select(parsedOptions);
            }).then(function(data){
            	result.data = data;
            	return result;
            })
		}
	}
})