/**
 * 高级模型
 * @return {[type]} [description]
 */
module.exports = Model(function(){

  'use strict';

  return {
    /**
     * 关联定义
     * 数据格式：
     * 'Profile': {
        type: 1, //类型
        model: 'Profile', //对应的模型名
        name: 'Profile', //获取数据后，追加到原有数据里的key
        key: 'id', 
        fKey: 'user_id', //关联的key
        field: 'id,name',
        where: 'name=xx',
        order: '',
        limit: ''
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
     * 设置本次使用的relation
     * @param {[type]} name [description]
     */
    setRelation: function(name, value){
      if (isObject(name) || !isEmpty(value)) {
        var obj = isObject(name) ? name : getObject(name, value);
        extend(this.relation, obj);
        return this;
      }
      if (isString(name)) {
        name = name.split(',');
      }
      this._relationName = name || {};
      return this;
    },
    /**
     * find后置操作
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _afterFind: function(data, options){
      return this.getRelation(data, options);
    },
    /**
     * select后置操作
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _afterSelect: function(data, options){
      return this.getRelation(data, options);
    },
    /**
     * 获取关联的数据
     * @param  {[type]}  data       [description]
     * @param  Boolean isDataList 是否是数据列表
     * @return {[type]}
     */
    getRelation: function(data, options){
      if (isEmpty(data) || isEmpty(this.relation) || isEmpty(this._relationName)) {
        return data;
      }
      var self = this;
      options = options || {};
      var promises = Object.keys(this.relation).map(function(key){
         //如果不在开启的relation内，则直接返回
        if (self._relationName !== true && self._relationName.indexOf(key) === -1) {
          return;
        }
        var item = self.relation[key];
        if (!isObject(item)) {
          item = {type: item};
        }
        var model = D(item.model || key);
        model.cache(options.cache).where(item.where).field(item.field).order(item.order).limit(item.limit);
        var opts = extend({
          name: key,
          model: model,
          type: 1,
          key: self.getPk(),
          fKey: self.name.toLowerCase() + '_id'
        }, item);
        switch(item.type){
          case 2:
            return self._getBelongsToRelation(data, opts, options);
          case 3:
            return self._getHasManyRelation(data, opts, options);
          case 4:
            return self._getManyToManyRelation(data, opts, options);
          default:
            return self._getHasOneRelation(data, opts, options);
        }
      });
      return Promise.all(promises).then(function(){
        return data;
      });
    },
    /**
     * 一对一
     * @param  {[type]} data       [description]
     * @param  {[type]} value      [description]
     * @param  {[type]} mapOptions [description]
     * @return {[type]}            [description]
     */
    _getHasOneRelation: function(data, mapOpts/*, options*/){
      var self = this;
      var where = self.parseRelationWhere(data, mapOpts);
      // if (where === false) {
      //   return {};
      // }
      return mapOpts.model.where(where).select().then(function(mapData){
        return self.parseRelationData(data, mapData, mapOpts);
      });
    },
    /**
     * 一对一，属于
     * @param  {[type]} data    [description]
     * @param  {[type]} mapOpts [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _getBelongsToRelation: function(data, mapOpts/*, options*/){
      var self = this;
      return mapOpts.model.getTableFields().then(function(){
        mapOpts.key = mapOpts.model.getModelName().toLowerCase() + '_id';
        mapOpts.fKey = mapOpts.model.getPk();
        var where = self.parseRelationWhere(data, mapOpts);
        // if (where === false) {
        //   return {};
        // }
        return mapOpts.model.where(where).select().then(function(mapData){
          return self.parseRelationData(data, mapData, mapOpts);
        })
      })
    },
    /**
     * 一对多
     * @param  {[type]} data       [description]
     * @param  {[type]} value      [description]
     * @param  {[type]} mapOptions [description]
     * @return {[type]}            [description]
     */
    _getHasManyRelation: function(data, mapOpts/*, options*/){
      var self = this;
      var where = self.parseRelationWhere(data, mapOpts);
      // if (where === false) {
      //   return [];
      // }
      return mapOpts.model.where(where).select().then(function(mapData){
        return self.parseRelationData(data, mapData, mapOpts, true);
      });
    },
    /**
     * 多对多
     * @param  {[type]} data          [description]
     * @param  {[type]} value         [description]
     * @param  {[type]} mapOptions    [description]
     * @param  {[type]} parsedOptions [description]
     * @return {[type]}               [description]
     */
    _getManyToManyRelation: function(data, mapOpts, options){
      var self = this;
      return mapOpts.model.getTableFields().then(function(){
        var where = self.parseRelationWhere(data, mapOpts);
        // if (where === false) {
        //   return [];
        // }
        //关联的实体表和关系表联合查询
        var sql = 'SELECT %s, a.%s FROM %s as a, %s as b %s AND a.%s=b.%s %s';
        //获取要查询的字段
        var field = self.db.parseField(mapOpts.field).split(',').map(function(item){
          return 'b.' + item;
        }).join(',');
        var queryData = [
          field,
          mapOpts.fKey,
          mapOpts.rTable || self.getRelationTableName(mapOpts.model),
          mapOpts.model.getTableName(),
          self.db.parseWhere(where),
          mapOpts.rfKey || (mapOpts.model.getModelName().toLowerCase() + '_id'),
          mapOpts.model.getPk(),
          mapOpts.where ? (' AND ' + self.db.parseWhere(mapOpts.where).trim().slice(6)) : ''
        ];
        sql = self.parseSql(sql, queryData);
        return self.db.select(sql, options.cache).then(function(mapData){
          return self.parseRelationData(data, mapData, mapOpts, true);
        });
      });
    },
    /**
     * 多对多关系下，获取对应的关联表
     * @return {[type]} [description]
     */
    getRelationTableName: function(model){
      var table = [
        this.tablePrefix,
        this.tableName || this.name,
        '_',
        model.getModelName()
      ].join('');
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
    parseRelationWhere: function(data, mapOpts){
      if (isArray(data)) {
        var keys = {};
        data.forEach(function(item){
          keys[item[mapOpts.key]] = 1;
        })
        var value = Object.keys(keys);
        // if (value.length === 0) {
        //   return false;
        // }
        return getObject(mapOpts.fKey, ['IN', value]);
      }
      return getObject(mapOpts.fKey, data[mapOpts.key]);
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
    parseRelationData: function(data, mapData, mapOpts, isArrMap){
      if (isArray(data)) {
        //提前初始化，防止mapData为空导致data里的数据没有初始化的情况
        data.forEach(function(item, i){
          data[i][mapOpts.name] = isArrMap ? [] : {};
        });
        mapData.forEach(function(mapItem){
          data.forEach(function(item, i){
            if (mapItem[mapOpts.fKey] !== item[mapOpts.key]) {
              return;
            }
            if (isArrMap) {
              data[i][mapOpts.name].push(mapItem);
            }else{
              data[i][mapOpts.name] = mapItem;
            }
          });
        });
      }else{
        data[mapOpts.name] = isArrMap ? mapData : (mapData[0] || {});
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
      return this.postRelation('ADD', data, parsedOptions);
    },
    /**
     * 删除后置操作
     * @param  {[type]} data          [description]
     * @param  {[type]} parsedOptions [description]
     * @return {[type]}               [description]
     */
    _afterDelete: function(data, parsedOptions){
      return this.postRelation('DELETE', data, parsedOptions);
    },
    /**
     * 更新后置操作
     * @param  {[type]} data          [description]
     * @param  {[type]} parsedOptions [description]
     * @return {[type]}               [description]
     */
    _afterUpdate: function(data, parsedOptions){
      return this.postRelation('UPDATE', data, parsedOptions);
    },
    /**
     * 提交类关联操作
     * @param  {[type]} postType      [description]
     * @param  {[type]} data          [description]
     * @param  {[type]} parsedOptions [description]
     * @return {[type]}               [description]
     */
    postRelation: function(postType, data/*, parsedOptions*/){
      if (isEmpty(data) || isEmpty(this.relation) || isEmpty(this._relationName)) {
        return data;
      }
      var self = this;
      var promises = Object.keys(this.relation).map(function(key){
        var item = self.relation[key];
        if (!isObject(item)) {
          item = {type: item};
        }
        var opts = extend({
          type: 1,
          postType: postType,
          name: key,
          key: self.getPk(),
          fKey: self.name.toLowerCase() + '_id'
        }, item);
        //如果没有开启对应的relation，则直接返回
        if (self._relationName !== true && self._relationName.indexOf(opts.name) === -1) {
          return;
        }
        var mapData = data[opts.name];
        //如果没有对应的数据，则直接返回
        if (isEmpty(mapData) && postType !== 'DELETE' || isEmpty(data[opts.key])) {
          return;
        }
        opts.data = mapData;
        opts.model = D(item.model || key).where(item.where);
        switch(item.type){
          case 2:
            return self._postBelongsToRelation(data, opts);
          case 3:
            return self._postHasManyRelation(data, opts);
          case 4:
            return self._postManyToManyRelation(data, opts);
          default:
            return self._postHasOneRelation(data, opts);
        }
      });
      return Promise.all(promises).then(function(){
        return data;
      });
    },
    /**
     * 一对一提交
     * @param  {[type]} data          [description]
     * @param  {[type]} value         [description]
     * @param  {[type]} mapOptions    [description]
     * @param  {[type]} parsedOptions [description]
     * @return {[type]}               [description]
     */
    _postHasOneRelation: function(data, mapOpts){
      var where;
      switch(mapOpts.postType){
        case 'ADD':
          mapOpts.data[mapOpts.fKey] = data[mapOpts.key];
          return mapOpts.model.add(mapOpts.data);
        case 'DELETE':
          where = getObject(mapOpts.fKey, data[mapOpts.key]);
          return mapOpts.model.where(where).delete();
        case 'UPDATE':
          where = getObject(mapOpts.fKey, data[mapOpts.key]);
          return mapOpts.model.where(where).update(mapOpts.data);
      }
    },
    /**
     * 一对一属于
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _postBelongsToRelation: function(data){
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
    _postHasManyRelation: function(data, mapOpts){
      var mapData = mapOpts.data;
      var model = mapOpts.model;
      if (!isArray(mapData)) {
        mapData = [mapData];
      }
      switch(mapOpts.postType){
        case 'ADD':
          mapData = mapData.map(function(item){
            item[mapOpts.fKey] = data[mapOpts.key];
            return item;
          });
          return model.addAll(mapData);
        case 'UPDATE':
          return model.getTableFields().then(function(){
            var pk = model.getPk();
            var promises = mapData.map(function(item){
              if (item[pk]) {
                return model.update(item);
              }else{
                item[mapOpts.fKey] = data[mapOpts.key];
                //添加不成功则自动忽略，不报错
                return model.add(item).catch(function(){});
              }
            });
            return Promise.all(promises);
          });
        case 'DELETE':
          var where = getObject(mapOpts.fKey, data[mapOpts.key]);
          return model.where(where).delete();
      }
    },
    /**
     * 多对多提交
     * @param  Object data          [description]
     * @param  object value         [description]
     * @param  {[type]} mapOptions    [description]
     * @param  {[type]} parsedOptions [description]
     * @return {[type]}               [description]
     */
    _postManyToManyRelation: function(data, mapOpts){
      var self = this;
      var model = mapOpts.model;
      var promise = model.getTableFields();
      var rfKey = mapOpts.rfKey || (model.getModelName().toLowerCase() + '_id');
      var type = mapOpts.postType;
      var mapData = mapOpts.data;
      var relationModel = self.getRelationModel(model);
      if (type === 'DELETE' || type === 'UPDATE') {
        promise = promise.then(function(){
          var where = getObject(mapOpts.fKey, data[mapOpts.key]);
          return relationModel.where(where).delete(); 
        });
      }
      if (type === 'ADD' || type === 'UPDATE') {
        promise = promise.then(function(){
          if (!isArray(mapData)) {
            mapData = isString(mapData) ? mapData.split(',') : [mapData];
          }
          var firstItem = mapData[0];
          //关系数据
          if (isNumberString(firstItem) || (isObject(firstItem) && (rfKey in firstItem))) {
            //生成要更新的数据
            var postData = mapData.map(function(item){
              var key = [mapOpts.fKey, rfKey];
              var val = [data[mapOpts.key], item[rfKey] || item];
              return getObject(key, val);
            });
            return relationModel.addAll(postData);
          }else{ //实体数据
            var unqiueField = model.getUniqueField();
            if (!unqiueField) {
              return getPromise(new Error('table `' + model.getTableName() + '` has no unqiue field'), true);
            }
            return self._getRalationAddIds(mapData, model, unqiueField).then(function(ids){
              var postData = ids.map(function(id){
                var key = [mapOpts.fKey, rfKey];
                var val = [data[mapOpts.key], id];
                return getObject(key, val);
              });
              return relationModel.addAll(postData);
            });
          }
        });
      }
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
      var ids = [];
      var promises = dataList.map(function(item){
        if (!isObject(item)) {
          item = getObject(unqiueField, item);
        }
        var value = item[unqiueField];
        var where = getObject(unqiueField, value);
        return model.where(where).field(model.getPk()).find().then(function(data){
          if (isEmpty(data)) {
            return model.add(item).then(function(insertId){
              ids.push(insertId);
            });
          }else{
            ids.push(data[model.getPk()]);
          }
        });
      });
      return Promise.all(promises).then(function(){
        return ids;
      });
    }
  };
});