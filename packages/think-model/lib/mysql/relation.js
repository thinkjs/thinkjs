function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const helper = require('think-helper');
const Base = require('./base');

//model relation type
const HAS_ONE = 1;
const BELONG_TO = 2;
const HAS_MANY = 3;
const MANY_TO_MANY = 4;

/**
 * relation model
 * @type {Class}
 */
class Relation extends Base {
  /**
   * constructor
   * @param  {String} name   []
   * @param  {Object} config []
   * @return {}        []
   */
  constructor(name = '', config = {}) {
    super(name, config);
    /**
     * @example
     'profile': {
        type: HAS_ONE, //relation type
        model: 'profile', //model name
        name: 'profile', //data name
        key: 'id', 
        fKey: 'user_id', //forign key
        field: 'id,name',
        where: 'name=xx',
        order: '',
        limit: ''
      }
     */
    if (this.relation === undefined) {
      this.relation = {};
    }
    this._relationName = true;
  }
  /**
   * set relation
   * @param {String} name []
   */
  setRelation(name, value) {
    //ignore undefined name
    if (name === undefined) {
      return this;
    }

    //config relation data
    if (helper.isObject(name) || !helper.isEmpty(value)) {
      let obj = helper.isObject(name) ? name : { [name]: value };
      helper.extend(this.relation, obj);
      return this;
    }

    if (think.isBoolean(name)) {
      this._relationName = name;
      return this;
    }

    //enable relation
    if (think.isString(name)) {
      name = name.split(/\s*,\s*/);
    }

    name = name || [];
    //filter relation name
    if (value === false) {
      let filterRelations = Object.keys(this.relation).filter(item => {
        return name.indexOf(item) === -1;
      });
      name = filterRelations;
    }

    this._relationName = name;
    return this;
  }
  /**
   * after find
   * @param  {Object} data []
   * @return {Promise}      []
   */
  afterFind(data, options) {
    return this.getRelation(data, options);
  }
  /**
   * after select
   * @param  {Object} data []
   * @return {}      []
   */
  afterSelect(data, options) {
    return this.getRelation(data, options);
  }
  /**
   * get relation data
   * @param  {}  data       []
   * @param  Boolean isDataList 
   * @return {}
   */
  getRelation(data, options = {}) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (helper.isEmpty(data) || helper.isEmpty(_this.relation) || helper.isEmpty(_this._relationName)) {
        return data;
      }
      let pk = yield _this.getPk();
      let promises = Object.keys(_this.relation).map(function (key) {
        //relation is disabled
        if (_this._relationName !== true && _this._relationName.indexOf(key) === -1) {
          return;
        }
        let item = _this.relation[key];
        if (!helper.isObject(item)) {
          item = { type: item };
        }
        //get relation model options
        let opts = helper.extend({
          name: key,
          type: think.model.HAS_ONE,
          key: pk,
          fKey: _this.name + '_id',
          relation: true
        }, item);

        //relation data is exist
        let itemData = helper.isArray(data) ? data[0] : data;
        let relData = itemData[opts.name];
        if (helper.isArray(relData) || helper.isObject(relData)) {
          return;
        }

        let modelOpts = helper.extend({}, {
          cache: options.cache
        });
        //remove cache key
        if (modelOpts.cache && modelOpts.cache.key) {
          delete modelOpts.cache.key;
        }

        ['where', 'field', 'order', 'limit', 'page'].forEach(function (optItem) {
          if (helper.isFunction(item[optItem])) {
            modelOpts[optItem] = item[optItem](_this);
          } else {
            modelOpts[optItem] = item[optItem];
          }
        });
        //get relation model instance
        let model = _this.model(item.model || key).options(modelOpts);

        //set relation to relate model
        if (model.setRelation) {
          model.setRelation(opts.relation, false);
        }

        opts.model = model;

        switch (item.type) {
          case BELONG_TO:
            // if(item.model) {
            //   delete item.model;
            // }
            opts = helper.extend(opts, {
              key: opts.model.modelName + '_id',
              fKey: 'id'
            }, item);
            opts.model = model; //get ref back
            return _this._getBelongsToRelation(data, opts, options);
          case HAS_MANY:
            return _this._getHasManyRelation(data, opts, options);
          case MANY_TO_MANY:
            return _this._getManyToManyRelation(data, opts, options);
          default:
            return _this._getHasOneRelation(data, opts, options);
        }
      });
      yield Promise.all(promises);
      return data;
    })();
  }
  /**
   * has one
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @return {Promise}         []
   */
  _getHasOneRelation(data, mapOpts /*, options*/) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let where = _this2.parseRelationWhere(data, mapOpts);
      // if (where === false) {
      //   return {};
      // }
      let mapData = yield mapOpts.model.where(where).select();
      return _this2.parseRelationData(data, mapData, mapOpts);
    })();
  }
  /**
   * belongs to
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @return {Promise}         []
   */
  _getBelongsToRelation(data, mapOpts /*, options*/) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let where = _this3.parseRelationWhere(data, mapOpts);
      let mapData = yield mapOpts.model.where(where).select();
      return _this3.parseRelationData(data, mapData, mapOpts);
    })();
  }
  /**
   * has many
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @return {Promise}         []
   */
  _getHasManyRelation(data, mapOpts /*, options*/) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      let where = _this4.parseRelationWhere(data, mapOpts);
      // if (where === false) {
      //   return [];
      // }
      let mapData = yield mapOpts.model.where(where).select();
      return _this4.parseRelationData(data, mapData, mapOpts, true);
    })();
  }
  /**
   * many to many
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  _getManyToManyRelation(data, mapOpts, options) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      let where = _this5.parseRelationWhere(data, mapOpts);
      let sql = 'SELECT %s, a.%s FROM %s as a, %s as b %s AND a.%s=b.%s %s';
      let field = _this5.db().parseField(mapOpts.field).split(',').map(function (item) {
        return `b.${item}`;
      }).join(',');
      let pk = yield mapOpts.model.getPk();

      let table = mapOpts.rModel;
      if (table) {
        if (_this5.tablePrefix && table.indexOf(_this5.tablePrefix) !== 0) {
          table = _this5.tablePrefix + table;
        }
      } else {
        table = _this5.getRelationTableName(mapOpts.model);
      }

      let table1 = mapOpts.model.tableName;
      let where1 = _this5.db().parseWhere(where);
      let rkey = mapOpts.rfKey || mapOpts.model.modelName + '_id';
      let where2 = mapOpts.where ? ' AND ' + _this5.db().parseWhere(mapOpts.where).trim().slice(6) : '';
      sql = _this5.parseSql(sql, field, mapOpts.fKey, table, table1, where1, rkey, pk, where2);
      let mapData = yield _this5.db().select(sql, options.cache);
      return _this5.parseRelationData(data, mapData, mapOpts, true);
    })();
  }
  /**
   * get relation table name
   * @param  {Object} model []
   * @return {}       []
   */
  getRelationTableName(model) {
    let table = [this.tablePrefix, this.tableName || this.name, '_', model.modelName].join('');
    return table.toLowerCase();
  }
  /**
   * get relation model
   * @param  {} model []
   * @return {}       []
   */
  getRelationModel(model) {
    let name = (this.tableName || this.name) + '_' + model.modelName;
    return this.model(name);
  }
  /**
   * parese relation where
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @return {}         []
   */
  parseRelationWhere(data, mapOpts) {
    if (helper.isArray(data)) {
      let keys = {};
      data.forEach(item => {
        keys[item[mapOpts.key]] = 1;
      });
      let value = Object.keys(keys);
      return {
        [mapOpts.fKey]: ['IN', value]
      };
    }
    return {
      [mapOpts.fKey]: data[mapOpts.key]
    };
  }
  /**
   * parse relation data
   * @param  {Object}  data     []
   * @param  {}  mapData  []
   * @param  {}  mapOpts  []
   * @param  {Boolean} isArrMap []
   * @return {}           []
   */
  parseRelationData(data, mapData, mapOpts, isArrMap) {
    if (helper.isArray(data)) {
      if (isArrMap) {
        data.forEach((item, i) => {
          data[i][mapOpts.name] = [];
        });
      }
      mapData.forEach(mapItem => {
        data.forEach((item, i) => {
          if (mapItem[mapOpts.fKey] !== item[mapOpts.key]) {
            return;
          }
          if (isArrMap) {
            data[i][mapOpts.name].push(mapItem);
          } else {
            data[i][mapOpts.name] = mapItem;
          }
        });
      });
    } else {
      data[mapOpts.name] = isArrMap ? mapData : mapData[0] || {};
    }
    return data;
  }
  /**
   * after add
   * @param  {} data          []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  afterAdd(data, options) {
    return this.postRelation('ADD', data, options);
  }
  /**
   * after delete
   * @param  {} data          []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  afterDelete(options = {}) {
    return this.postRelation('DELETE', options.where, options);
  }
  /**
   * after update
   * @param  {} data          []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  afterUpdate(data, options) {
    return this.postRelation('UPDATE', data, options);
  }
  /**
   * post relation
   * @param  {} postType      []
   * @param  {} data          []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  postRelation(postType, data /*, parsedOptions*/) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      if (helper.isEmpty(data) || helper.isEmpty(_this6.relation) || helper.isEmpty(_this6._relationName)) {
        return data;
      }
      let pk = yield _this6.getPk();
      let promises = Object.keys(_this6.relation).map(function (key) {
        let item = _this6.relation[key];
        if (!helper.isObject(item)) {
          item = { type: item };
        }
        let opts = helper.extend({
          type: HAS_ONE,
          postType: postType,
          name: key,
          key: pk,
          fKey: _this6.name + '_id'
        }, item);
        if (_this6._relationName !== true && _this6._relationName.indexOf(opts.name) === -1) {
          return;
        }
        if (postType === 'DELETE') {
          opts.data = data;
        } else {
          let mapData = data[opts.name];
          if (helper.isEmpty(mapData)) {
            return;
          }
          opts.data = mapData;
        }
        opts.model = _this6.model(item.model || key).where(item.where);
        switch (item.type) {
          case BELONG_TO:
            return _this6._postBelongsToRelation(data, opts);
          case HAS_MANY:
            return _this6._postHasManyRelation(data, opts);
          case MANY_TO_MANY:
            return _this6._postManyToManyRelation(data, opts);
          default:
            return _this6._postHasOneRelation(data, opts);
        }
      });
      yield Promise.all(promises);
      return data;
    })();
  }
  /**
   * has one post
   * @param  {} data          []
   * @param  {} value         []
   * @param  {} mapOptions    []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  _postHasOneRelation(data, mapOpts) {
    let where;
    switch (mapOpts.postType) {
      case 'ADD':
        mapOpts.data[mapOpts.fKey] = data[mapOpts.key];
        return mapOpts.model.add(mapOpts.data);
      case 'DELETE':
        where = { [mapOpts.fKey]: data[mapOpts.key] };
        return mapOpts.model.where(where).delete();
      case 'UPDATE':
        where = { [mapOpts.fKey]: data[mapOpts.key] };
        return mapOpts.model.where(where).update(mapOpts.data);
    }
  }
  /**
   * belongs to
   * @param  {} data []
   * @return {}      []
   */
  _postBelongsToRelation(data) {
    return data;
  }
  /**
   * has many
   * @param  {} data          []
   * @param  {} value         []
   * @param  {} mapOptions    []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  _postHasManyRelation(data, mapOpts) {
    let mapData = mapOpts.data;
    let model = mapOpts.model;
    if (!helper.isArray(mapData)) {
      mapData = [mapData];
    }
    switch (mapOpts.postType) {
      case 'ADD':
        mapData = mapData.map(item => {
          item[mapOpts.fKey] = data[mapOpts.key];
          return item;
        });
        return model.addMany(mapData);
      case 'UPDATE':
        return model.getSchema().then(() => {
          let pk = model.getPk();
          let promises = mapData.map(item => {
            if (item[pk]) {
              return model.update(item);
            } else {
              item[mapOpts.fKey] = data[mapOpts.key];
              //ignore error when add data
              return model.add(item).catch(() => {});
            }
          });
          return Promise.all(promises);
        });
      case 'DELETE':
        let where = { [mapOpts.fKey]: data[mapOpts.key] };
        return model.where(where).delete();
    }
  }
  /**
   * many to many post
   * @param  Object data          []
   * @param  object value         []
   * @param  {} mapOptions    []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  _postManyToManyRelation(data, mapOpts) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      let model = mapOpts.model;
      yield model.getSchema();
      let rfKey = mapOpts.rfKey || model.modelName.toLowerCase() + '_id';
      let relationModel = mapOpts.rModel ? _this7.model(mapOpts.rModel) : _this7.getRelationModel(model);

      let type = mapOpts.postType;
      if (type === 'DELETE' || type === 'UPDATE') {
        let where = { [mapOpts.fKey]: data[mapOpts.key] };
        yield relationModel.where(where).delete();
      }

      if (type === 'ADD' || type === 'UPDATE') {
        let mapData = mapOpts.data;
        if (!helper.isArray(mapData)) {
          mapData = helper.isString(mapData) ? mapData.split(',') : [mapData];
        }
        let firstItem = mapData[0];
        if (helper.isNumberString(firstItem) || helper.isObject(firstItem) && rfKey in firstItem) {
          let postData = mapData.map(function (item) {
            return { [mapOpts.fKey]: data[mapOpts.key], [rfKey]: item[rfKey] || item };
          });
          yield relationModel.addMany(postData);
        } else {
          let unqiueField = yield model.getUniqueField();
          if (!unqiueField) {
            return Promise.reject(new Error('table `' + model.tableName + '` has no unqiue field'));
          }
          let ids = yield _this7._getRalationAddIds(mapData, model, unqiueField);
          let postData = ids.map(function (id) {
            return { [mapOpts.fKey]: data[mapOpts.key], [rfKey]: id };
          });
          yield relationModel.addMany(postData);
        }
      }
    })();
  }
  /**
   * insert data, add ids
   * @param  {Array} dataList    []
   * @param  {Object} model       []
   * @param  {String} unqiueField []
   * @return {Promise}             []
   */
  _getRalationAddIds(dataList, model, unqiueField) {
    return _asyncToGenerator(function* () {
      let ids = [];
      let pk = yield model.getPk();
      let promises = dataList.map(function (item) {
        if (!helper.isObject(item)) {
          item = { [unqiueField]: item };
        }
        let value = item[unqiueField];
        let where = { [unqiueField]: value };
        return model.where(where).field(pk).find().then(function (data) {
          if (helper.isEmpty(data)) {
            return model.add(item).then(function (insertId) {
              ids.push(insertId);
            });
          } else {
            ids.push(data[pk]);
          }
        });
      });
      yield Promise.all(promises);
      return ids;
    })();
  }
}

Relation.HAS_ONE = HAS_ONE;
Relation.BELONG_TO = BELONG_TO;
Relation.HAS_MANY = HAS_MANY;
Relation.MANY_TO_MANY = MANY_TO_MANY;

module.exports = Relation;