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
	//get时不同的type对应的回调
	var mapTypeGetFn = {
		1: "_getHasOneRelation",
		2: "_getBelongsToRelation",
		3: "_getHasManyRelation",
		4: "_getManyToManyRelation"
	}

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
				result = extend({count: count, total: totalPage}, pageOptions);
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
				//如果不在开启的relation内，则直接返回
				if (self._relationName !== true && self._relationName.indexOf(mapName) === -1) {
					return;
				};
				mapType = value.type || HAS_ONE;
				mapKey = value.key || self.getPk();
				mapfKey = value.fKey || (self.name.toLowerCase() + "_id");
				model = D(value.model || key);
				model.where(value.where).cache(parsedOptions.cache).field(value.field).order(value.order).limit(value.limit);
				//调用不同的类型解析
				promise = self[mapTypeGetFn[mapType]](data, value, {
					model: model,
					mapName: mapName,
					mapKey: mapKey,
					mapfKey: mapfKey
				}, parsedOptions);
				promises.push(promise);
			})
			return Promise.all(promises).then(function(){
				return data;
			});
		},
		_getHasOneRelation: function(data, value, mapOptions, parsedOptions){
			var self = this;
			var where = self.parseRelationWhere(data, mapOptions.mapKey, mapOptions.mapfKey);
			mapOptions.model.where(where);
			return mapOptions.model.select().then(function(mapData){
				self.parseRelationData(data, mapData, mapOptions.mapName);
			});
		},
		_getBelongsToRelation: function(data, value, mapOptions, parsedOptions){
			var self = this;
			return mapOptions.model.promise.then(function(){
				mapKey = mapOptions.model.getModelName().toLowerCase() + "_id";
				mapfKey = mapOptions.model.getPk();
				var where = self.parseRelationWhere(data, mapOptions.mapKey, mapOptions.mapfKey);
				mapOptions.model.where(where);
				return model.select();
			}).then(function(mapData){
				self.parseRelationData(data, mapData, mapOptions.mapName);
			});
		},
		_getHasManyRelation: function(data, value, mapOptions, parsedOptions){
			var self = this;
			var where = self.parseRelationWhere(data, mapKey, mapfKey);
			mapOptions.model.where(where);
			return mapOptions.model.select().then(function(mapData){
				self.parseRelationData(data, mapData, mapOptions.mapName, mapOptions.mapKey, mapOptions.mapfKey, true);
			});
		},
		_getManyToManyRelation: function(data, value, mapOptions, parsedOptions){
			var self = this;
			return mapOptions.model.promise.then(function(){
				var where = self.parseRelationWhere(data, mapOptions.mapKey, mapOptions.mapfKey);
				var whereStr = self.db.parseWhere(where);
				//关联的实体表和关系表联合查询
				var sql = "SELECT b.%s, a.%s FROM %s as a, %s as b %s AND a.%s=b.%s %s";
				var queryData = [
					value.field || "*",
					mapOptions.mapfKey,
					value.relationTable || self.getRelationTableName(mapOptions.model),
					mapOptions.model.getTableName(),
					whereStr || "WHERE ",
					value.rfKey || (mapOptions.model.getModelName().toLowerCase() + "_id"),
					mapOptions.model.getPk(),
					value.where ? (" AND " + value.where) : ""
				];
				return self.parseSql(sql, queryData).then(function(sql){
					return self.db.select(sql, parsedOptions.cache);
				}).then(function(mapData){
					self.parseRelationData(data, mapData, mapOptions.mapName, mapOptions.mapKey, mapOptions.mapfKey, true);
				});
			})
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
		_afterAdd: function(data, parsedOptions){
			return this.postRelation("ADD", data, parsedOptions);
		},
		/**
		 * 提交类关联操作
		 * @param  {[type]} postType      [description]
		 * @param  {[type]} data          [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		postRelation: function(postType, data, parsedOptions){
			if (isEmpty(this.relation) || isEmpty(this._relationName)) {
				return data;
			};
			if (isEmpty(data) && postType !== "DELETE") {
				return data;
			};
			var self = this;
			var promises = [];
			Object.keys(this.relation).forEach(function(key){
				var promise, mapName, mapType, model, mapWhere, mapKey, mapfKey, mapData, pkValue;
				var value = self.relation[key];
				if (!isObject(value)) {
					value = {type: value};
				};
				mapName = value.name || key;
				//如果没有开启对应的relation，则直接返回
				if (self._relationName !== true && self._relationName.indexOf(mapName) === -1) {
					return;
				};
				mapData = data[mapName];
				//如果没有对应的数据，则直接返回
				if (isEmpty(mapData)) {
					return;
				};
				mapType = value.type || HAS_ONE;
				mapKey = value.key || self.getPk();
				mapfKey = value.fKey || (self.name.toLowerCase() + "_id");
				model = D(value.model || key);
				model.where(value.where);
				switch(mapType){
					case HAS_ONE:
						switch(postType){
							case "ADD":
								model.where(self.parseRelationWhere(data, mapKey, mapfKey));
								mapData[mapfKey] = data[mapKey];
								promise = model.add(mapData);
								break;
							case "SAVE":
								break;
							case "DELETE":
								break;
							default:
								break;
						}
						break;
					case BELONGS_TO:
						break;
					case HAS_MANY:
						break;
					case MANY_TO_MANY:

						break;
				}
				promises.push(promise);
			})
			return Promise.all(promises).then(function(){
				return data;
			})
		}
	}
})