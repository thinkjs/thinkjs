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
		 * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
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
		_afterFind: function(data, parsedOptions){
			return this.getRelation(data, parsedOptions);
		},
		/**
		 * select后置操作
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		_afterSelect: function(data, parsedOptions){
			return this.getRelation(data, parsedOptions);
		},
		/**
		 * 获取关联的数据
		 * @param  {[type]}  data       [description]
		 * @param  Boolean isDataList 是否是数据列表
		 * @return {[type]}
		 */
		getRelation: function(data, parsedOptions){
			if (isEmpty(data) || isEmpty(this.relation) || isEmpty(this._relationName)) {
				return data;
			};
			var self = this;
			var promises = [];
			Object.keys(this.relation).forEach(function(key){
				var promise, mapName, mapType, model, mapWhere, mapKey, mapfKey;
				var value = self.relation[key];
				if (!isObject(value)) {
					value = {type: value};
				};
				mapName = value.name || key;
				if (self._relationName !== true && self._relationName.indexOf(mapName) === -1) {
					return;
				};
				mapType = value.type || HAS_ONE;
				mapKey = value.key || self.getPk();
				mapfKey = value.fKey || (self.name.toLowerCase() + "_id");
				model = D(value.model || key);
				model.where(value.where).cache(parsedOptions.cache).field(value.field).order(value.order).limit(value.limit);
				switch(mapType){
					case HAS_ONE: 
						model.where(self.parseRelationWhere(data, mapKey, mapfKey));
						promise = model.select().then(function(mapData){
							self.parseRelationData(data, mapData, mapName);
						})
						break;
					case BELONGS_TO:
						promise = model.promise.then(function(){
							mapKey = model.getModelName().toLowerCase() + "_id";
							mapfKey = model.getPk();
							model.where(self.parseRelationWhere(data, mapKey, mapfKey));
							return model.select();
						}).then(function(mapData){
							self.parseRelationData(data, mapData, mapName);
						})
						break;
					case HAS_MANY:
						model.where(self.parseRelationWhere(data, mapKey, mapfKey));
						promise = model.select().then(function(mapData){
							self.parseRelationData(data, mapData, mapName, mapKey, mapfKey, true);
						})
						break;
					case MANY_TO_MANY:
						promise = model.promise.then(function(){
							var whereStr = self.db.parseWhere(self.parseRelationWhere(data, mapKey, mapfKey));
							var sql = "SELECT b.%s,a.%s FROM %s as a, %s as b %s AND a.%s=b.%s %s %s %s";
							var queryData = [
								value.field || "*",
								mapfKey,
								self.getRelationTableName(model),
								model.getTableName(),
								whereStr || "WHERE ",
								(model.getModelName() + "_id").toLowerCase(),
								model.getPk(),
								value.where ? (" AND " + value.where) : "",
								self.db.parseOrder(value.order),
								self.db.parseLimit(value.limit)
							];
							return self.parseSql(sql, queryData).then(function(sql){
								return self.db.select(sql, parsedOptions.cache);
							}).then(function(mapData){
								self.parseRelationData(data, mapData, mapName, mapKey, mapfKey, true);
							});
						})
						break;
					default:
						break;
				}
				promises.push(promise);
			})
			return Promise.all(promises).then(function(){
				return data;
			});
		},
		/**
		 * 多对多关系下，获取对应的关联表
		 * @return {[type]} [description]
		 */
		getRelationTableName: function(relationModel){
			var table = [
				this.tablePrefix,
				this.tableName || this.name,
				"_",
				relationModel.getModelName()
			].join("");
			return table.toLowerCase();
		},
		/**
		 * 解析relation的where条件
		 * @param  {[type]} data    [description]
		 * @param  {[type]} mapKey  [description]
		 * @param  {[type]} mapfKey [description]
		 * @return {[type]}         [description]
		 */
		parseRelationWhere: function(data, mapKey, mapfKey){
			if (isArray(data)) {
				var value = data.map(function(item){
					return item[mapKey];
				});
				return getObject(mapfKey, ["IN", value]);
			};
			return getObject(mapfKey, data[mapKey]);
		},
		/**
		 * 解析查询后的数据
		 * @param  {[type]}  data     [description]
		 * @param  {[type]}  mapData  [description]
		 * @param  {[type]}  mapName  [description]
		 * @param  {[type]}  mapKey   [description]
		 * @param  {[type]}  mapfKey  [description]
		 * @param  {Boolean} isArrMap [description]
		 * @return {[type]}           [description]
		 */
		parseRelationData: function(data, mapData, mapName, mapKey, mapfKey, isArrMap){
			if (isArray(data)) {
				//提前初始化，防止mapData为空导致data里的数据没有初始化的情况
				data.forEach(function(item, i){
					data[i][mapName] = isArrMap ? [] : {};
				})
				mapData.forEach(function(mapItem){
					data.forEach(function(item, i){
						if (mapItem[mapfKey] !== item[mapKey]) {
							return;
						};
						if (isArrMap) {
							data[i][mapName].push(mapItem);
						}else{
							data[i][mapName] = mapItem;
						}
					});
				})
			}else{
				data[mapName] = isArrMap ? (mapData || []) : (mapData[0] || {});
			}
			return data;
		},
		_beforeAdd: function(data, parsedOptions){
			return this.postRelation("ADD", data, parsedOptions);
		},
		postRelation: function(postType, data, parsedOptions){
			
		}
	}
})