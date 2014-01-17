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

	//post的操作类型
	const ADD = 'ADD';
	const UPDATE = 'UPDATE';
	const DELETE = 'DELETE';

	//get时不同的type对应的回调
	var mapTypeGetFn = {
		1: "_getHasOneRelation",
		2: "_getBelongsToRelation",
		3: "_getHasManyRelation",
		4: "_getManyToManyRelation"
	}

	//post时不同的type对应的回调
	var mapTypePostFn = {
		1: "_postHasOneRelation",
		2: "_postBelongsToRelation",
		3: "_postHasManyRelation",
		4: "_postManyToManyRelation"
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
		 * 只读字段
		 * @type {String}
		 */
		readonlyField: "",
		/**
		 * 保存时对数据进行校验
		 * @type {Boolean}
		 */
		validateField: true,
		/**
		 * 字段类型
		 * @type {Object}
		 */
		fieldType: {},
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
					value.rTable || self.getRelationTableName(mapOptions.model),
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
		getRelationTableName: function(model){
			var table = [
				this.tablePrefix,
				this.tableName || this.name,
				"_",
				model.getModelName()
			].join("");
			return table.toLowerCase();
		},
		/**
		 * 多堆垛关系下，回去对应关联表的模型
		 * @param  {[type]} model [description]
		 * @return {[type]}       [description]
		 */
		getRelationModel: function(model){
			var name = ucfirst(this.tableName || this.name) + ucfirst(model.getModelName());
			return D(name);
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
		/**
		 * 添加后置操作
		 * @param  {[type]} data          [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		_afterAdd: function(data, parsedOptions){
			return this.postRelation(ADD, data, parsedOptions);
		},
		/**
		 * 删除后置操作
		 * @param  {[type]} data          [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		_afterDelete: function(data, parsedOptions){
			return this.postRelation(DELETE, data, parsedOptions);
		},
		/**
		 * 更新前置操作
		 * @param  {[type]} data          [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		_beforeUpdate: function(data, parsedOptions){
			//只读字段处理
			if (!isEmpty(this.readonlyField)) {
				if (isString(this.readonlyField)) {
					this.readonlyField = this.readonlyField.split(",");
				};
				this.readonlyField.forEach(function(field){
					delete data[field];
				})
			};
			return data;
		},
		/**
		 * 更新后置操作
		 * @param  {[type]} data          [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		_afterUpdate: function(data, parsedOptions){
			return this.postRelation(UPDATE, data, parsedOptions);
		},
		/**
		 * 提交类关联操作
		 * @param  {[type]} postType      [description]
		 * @param  {[type]} data          [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		postRelation: function(postType, data, parsedOptions){
			if (isEmpty(data) || isEmpty(this.relation) || isEmpty(this._relationName)) {
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
				if (isEmpty(mapData) && postType !== DELETE) {
					return;
				};
				mapKey = value.key || self.getPk();
				if (isEmpty(data[mapKey])) {
					return;
				};
				mapType = value.type || HAS_ONE;
				mapfKey = value.fKey || (self.name.toLowerCase() + "_id");
				model = D(value.model || key);
				model.where(value.where);
				//调用不同的类型解析
				promise = self[mapTypePostFn[mapType]](data, value, {
					model: model,
					mapName: mapName,
					mapKey: mapKey,
					mapfKey: mapfKey,
					mapData: mapData,
					type: postType
				}, parsedOptions);

				promises.push(promise);
			})
			return Promise.all(promises).then(function(){
				return data;
			})
		},
		/**
		 * 一对一提交
		 * @param  {[type]} data          [description]
		 * @param  {[type]} value         [description]
		 * @param  {[type]} mapOptions    [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		_postHasOneRelation: function(data, value, mapOptions, parsedOptions){
			var promise = null;
			var self = this;
			var where;
			switch(mapOptions.type){
				case ADD:
					mapOptions.mapData[mapOptions.mapfKey] = data[mapOptions.mapKey];
					promise = mapOptions.model.add(mapOptions.mapData);
					break;
				case DELETE:
					where = getObject(mapOptions.mapfKey, data[mapOptions.mapKey]);
					promise = mapOptions.model.where(where).delete();
					break;
				case UPDATE:
					where = getObject(mapOptions.mapfKey, data[mapOptions.mapKey]);
					promise = mapOptions.model.where(where).update(mapOptions.mapData);
					break;
				default:
					break;
			}
			return promise;
		},
		_postBelongsToRelation: function(data, value, mapOptions, parsedOptions){
			return data;
		},
		/**
		 * 一对多提交
		 * @param  {[type]} data          [description]
		 * @param  {[type]} value         [description]
		 * @param  {[type]} mapOptions    [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		_postHasManyRelation: function(data, value, mapOptions, parsedOptions){
			var type = mapOptions.type;
			var mapData = mapOptions.mapData;
			var model = mapOptions.model;
			if (!isArray(mapData)) {
				mapData = [mapData];
			};
			switch(type){
				case ADD:
					mapData = mapData.map(function(item){
						item[mapOptions.mapfKey] = data[mapOptions.mapKey];
					})
					promise = model.addAll(mapData);
					break;
				case UPDATE:
					promise = model.promise.then(function(){
						var promises = [];
						var pk = model.getPk();
						mapData.forEach(function(item){
							var pro;
							if (item[pk]) {
								pro = model.update(item);
							}else{
								item[mapOptions.mapfKey] = data[mapOptions.mapKey];
								pro = model.add(item);
							}
							promises.push(pro);
						});
						return Promise.all(promises);
					})
					break;
				case DELETE:
					var where = getObject(mapOptions.mapfKey, data[mapOptions.mapKey]);
					promise = model.where(where).delete();
					break;
			}
			return promise;
		},
		/**
		 * 多对多提交
		 * @param  Object data          [description]
		 * @param  object value         [description]
		 * @param  {[type]} mapOptions    [description]
		 * @param  {[type]} parsedOptions [description]
		 * @return {[type]}               [description]
		 */
		_postManyToManyRelation: function(data, value, mapOptions, parsedOptions){
			var self = this;
			var model = mapOptions.model;
			var promise = model.promise;
			var rfKey = value.rfKey || (model.getModelName().toLowerCase() + "_id");
			var relationTable = value.rTable || self.getRelationTableName(model);
			var where;
			var type = mapOptions.type;
			var mapData = mapOptions.mapData;
			var relationModel = self.getRelationModel(model);
			if (type === DELETE || type === UPDATE) {
				where = getObject(mapOptions.mapfKey, data[mapOptions.mapKey]);
				promise = promise.then(function(){
					return relationModel.where(where).delete();	
				})
			};
			if (type === ADD || type === UPDATE) {
				promise = promise.then(function(){
					if (!isArray(mapData)) {
						mapData = isString(mapData) ? mapData.split(',') : [mapData];
					};
					var firstItem = mapData[0];
					//关系数据
					if (!isObject(firstItem) || (rfKey in firstItem)) {
						//生成要更新的数据
						var postData = mapData.map(function(item){
							var key = [mapOptions.mapfKey, rfKey];
							var val = [data[mapOptions.mapKey], item[rfKey] || item];
							return getObject(key, val);
						});
						return relationModel.addAll(postData);
					}else{ //实体数据
						var unqiueField = model.getUniqueField(firstItem);
						if (!unqiueField) {
							return getPromise(model.getTableName() + " table has no unqiue field", true);
						};
						return self._getRalationAddIds(mapData, model, unqiueField).then(function(ids){
							var postData = ids.map(function(id){
								var key = [mapOptions.mapfKey, rfKey];
								var val = [data[mapOptions.mapKey], id];
								return getObject(key, val);
							});
							return relationModel.addAll(postData);
						})
					}
				})
			};
			return promise;
		},
		/**
		 * 插入数据，并获取插入的id集合
		 * @param  {[type]} dataList    [description]
		 * @param  {[type]} model       [description]
		 * @param  {[type]} unqiueField [description]
		 * @return {[type]}             [description]
		 */
		_getRalationAddIds: function(dataList, model, unqiueField){
			var promises = [];
			var ids = [];
			dataList.forEach(function(item){
				var value = item[unqiueField];
				if (!value) {
					return true;
				};
				var where = getObject(unqiueField, value);
				var promise = model.where(where).field(model.getPk()).find().then(function(data){
					if (isEmpty(data)) {
						return model.add(item).then(function(insertId){
							ids.push(insertId);
						})
					}else{
						ids.push(data[model.getPk()]);
					}
				})
				promises.push(promise);
			})
			return Promise.all(promises).then(function(){
				return ids;
			})
		},
		/**
		 * 设置是否对数据进行校验
		 * @param  {[type]} validate [description]
		 * @return {[type]}          [description]
		 */
		validate: function(validate){
			this.validateField = validate;
		}
	}
})