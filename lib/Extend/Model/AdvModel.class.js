/**
 * 高级模型
 * @return {[type]} [description]
 */
module.exports = Model(function(){
	//关联类型
	const HAS_ONE = 1;
	const BELONGS_TO = 2;
	const HAS_MANY = 3;
	const MANY_TO_MANY = 4;
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
		 * 数据格式：
		 * "Profile": {
		 * 		type: 1,
		 * 		model: "Profile",
		 * 		name: "Profile",
		 * 		key: "id",
		 * 		fKey: "user_id",
		 * 		field: "id,name",
		 * 		where: "name=xx",
		 * 		order: "",
		 * 		limit: ""
		 * }
		 * @type {Object}
		 */
		relation: {},
		/**
		 * 本次使用的关联名称，默认是全部使用
		 * @type {Boolean}
		 */
		_relationName: true,
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
			return this.parseOptions(options).then(function(options){
				delete options.table;
				parsedOptions = options;
				return self.options({
					where: options.where,
					cache: options.cache
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
		},
		/**
		 * 设置本次使用的relation
		 * @param {[type]} name [description]
		 */
		setRelation: function(name){
			if (isString(name)) {
				name = name.split(",");
			};
			this._relationName = name;
			return this;
		},
		/**
		 * find后置操作
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_afterFind: function(data){
			if (isEmpty(data) || isEmpty(this.relation) || isEmpty(this._relationName)) {
				return data;
			};
			return this.getRelation(data, false);
		},
		/**
		 * 获取关联的数据
		 * @param  {[type]}  data       [description]
		 * @param  Boolean isDataList 是否是数据列表
		 * @return {[type]}
		 */
		getRelation: function(data, isDataList){
			var key, value, promise, promises;
			for(key in this.relation){
				value = this.relation[key];
			}
			
		}
	}
})