const helper = require('think-helper');

const Base = require('./index');

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
  constructor(name = '', config = {}){
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
    if(this.relation === undefined){
      this.relation = {};
    }
    this._relationName = true;
  }
  /**
   * set relation
   * @param {String} name []
   */
  setRelation(name, value){
    //ignore undefined name
    if(name === undefined){
      return this;
    }

    //config relation data
    if (helper.isObject(name) || !helper.isEmpty(value)) {
      let obj = helper.isObject(name) ? name : {[name]: value};
      helper.extend(this.relation, obj);
      return this;
    }

    if(think.isBoolean(name)){
      this._relationName = name;
      return this;
    }

    //enable relation
    if (think.isString(name)) {
      name = name.split(/\s*,\s*/);
    }

    name = name || [];
    //filter relation name
    if(value === false){
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
  afterFind(data, options){
    return this.getRelation(data, options);
  }
  /**
   * after select
   * @param  {Object} data []
   * @return {}      []
   */
  afterSelect(data, options){
    return this.getRelation(data, options);
  }
  /**
   * get relation data
   * @param  {}  data       []
   * @param  Boolean isDataList 
   * @return {}
   */
  async getRelation(data, options = {}){
    if (helper.isEmpty(data) || helper.isEmpty(this.relation) || helper.isEmpty(this._relationName)) {
      return data;
    }
    let pk = await this.getPk();
    let promises = Object.keys(this.relation).map(key => {
      //relation is disabled
      if (this._relationName !== true && this._relationName.indexOf(key) === -1) {
        return;
      }
      let item = this.relation[key];
      if (!helper.isObject(item)) {
        item = {type: item};
      }
      //get relation model options
      let opts = helper.extend({
        name: key,
        type: think.model.HAS_ONE,
        key: pk,
        fKey: this.name + '_id',
        relation: true
      }, item);

      //relation data is exist
      let itemData = helper.isArray(data) ? data[0] : data;
      let relData = itemData[opts.name];
      if(helper.isArray(relData) || helper.isObject(relData)){
        return;
      }

      let modelOpts = helper.extend({}, {
        cache: options.cache
      });
      //remove cache key
      if(modelOpts.cache && modelOpts.cache.key){
        delete modelOpts.cache.key;
      }

      ['where', 'field', 'order', 'limit', 'page'].forEach(optItem => {
        if(helper.isFunction(item[optItem])){
          modelOpts[optItem] = item[optItem](this);
        }else{
          modelOpts[optItem] = item[optItem];
        }
      });
      //get relation model instance
      let model = this.model(item.model || key).options(modelOpts);

      //set relation to relate model
      if(model.setRelation){
        model.setRelation(opts.relation, false);
      }

      opts.model = model;
      
      switch(item.type){
        case BELONG_TO:
          // if(item.model) {
          //   delete item.model;
          // }
          opts = helper.extend(opts, {
            key: opts.model.modelName + '_id',
            fKey: 'id' 
          }, item);
          opts.model = model; //get ref back
          return this._getBelongsToRelation(data, opts, options);
        case HAS_MANY:
          return this._getHasManyRelation(data, opts, options);
        case MANY_TO_MANY:
          return this._getManyToManyRelation(data, opts, options);
        default:
          return this._getHasOneRelation(data, opts, options);
      }
    });
    await Promise.all(promises);
    return data;
  }
  /**
   * has one
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @return {Promise}         []
   */
  async _getHasOneRelation(data, mapOpts/*, options*/){
    let where = this.parseRelationWhere(data, mapOpts);
    // if (where === false) {
    //   return {};
    // }
    let mapData = await mapOpts.model.where(where).select();
    return this.parseRelationData(data, mapData, mapOpts);
  }
  /**
   * belongs to
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @return {Promise}         []
   */
  async _getBelongsToRelation(data, mapOpts/*, options*/){
    let where = this.parseRelationWhere(data, mapOpts);
    let mapData = await mapOpts.model.where(where).select();
    return this.parseRelationData(data, mapData, mapOpts);
  }
  /**
   * has many
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @return {Promise}         []
   */
  async _getHasManyRelation(data, mapOpts/*, options*/){
    let where = this.parseRelationWhere(data, mapOpts);
    // if (where === false) {
    //   return [];
    // }
    let mapData = await mapOpts.model.where(where).select();
    return this.parseRelationData(data, mapData, mapOpts, true);
  }
  /**
   * many to many
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  async _getManyToManyRelation(data, mapOpts, options){
    let where = this.parseRelationWhere(data, mapOpts);
    let sql = 'SELECT %s, a.%s FROM %s as a, %s as b %s AND a.%s=b.%s %s';
    let field = this.db().parseField(mapOpts.field).split(',').map(item => `b.${item}`).join(',');
    let pk = await mapOpts.model.getPk();

    let table = mapOpts.rModel;
    if(table){
      if(this.tablePrefix && table.indexOf(this.tablePrefix) !== 0){
        table = this.tablePrefix + table;
      }
    }else{
     table = this.getRelationTableName(mapOpts.model);
    }

    let table1 = mapOpts.model.tableName;
    let where1 = this.db().parseWhere(where);
    let rkey = mapOpts.rfKey || (mapOpts.model.modelName + '_id');
    let where2 = mapOpts.where ? (' AND ' + this.db().parseWhere(mapOpts.where).trim().slice(6)) : '';
    sql = this.parseSql(sql, field, mapOpts.fKey, table, table1, where1, rkey, pk, where2);
    let mapData = await this.db().select(sql, options.cache);
    return this.parseRelationData(data, mapData, mapOpts, true);
  }
  /**
   * get relation table name
   * @param  {Object} model []
   * @return {}       []
   */
  getRelationTableName(model){
    let table = [
      this.tablePrefix,
      this.tableName || this.name,
      '_',
      model.modelName
    ].join('');
    return table.toLowerCase();
  }
  /**
   * get relation model
   * @param  {} model []
   * @return {}       []
   */
  getRelationModel(model){
    let name = (this.tableName || this.name) + '_' + model.modelName;
    return this.model(name);
  }
  /**
   * parese relation where
   * @param  {Object} data    []
   * @param  {Object} mapOpts []
   * @return {}         []
   */
  parseRelationWhere(data, mapOpts){
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
  parseRelationData(data, mapData, mapOpts, isArrMap){
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
          }else{
            data[i][mapOpts.name] = mapItem;
          }
        });
      });
    }else{
      data[mapOpts.name] = isArrMap ? mapData : (mapData[0] || {});
    }
    return data;
  }
  /**
   * after add
   * @param  {} data          []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  afterAdd(data, options){
    return this.postRelation('ADD', data, options);
  }
  /**
   * after delete
   * @param  {} data          []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  afterDelete(options = {}){
    return this.postRelation('DELETE', options.where, options);
  }
  /**
   * after update
   * @param  {} data          []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  afterUpdate(data, options){
    return this.postRelation('UPDATE', data, options);
  }
  /**
   * post relation
   * @param  {} postType      []
   * @param  {} data          []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  async postRelation(postType, data/*, parsedOptions*/){
    if (helper.isEmpty(data) || helper.isEmpty(this.relation) || helper.isEmpty(this._relationName)) {
      return data;
    }
    let pk = await this.getPk();
    let promises = Object.keys(this.relation).map(key => {
      let item = this.relation[key];
      if (!helper.isObject(item)) {
        item = {type: item};
      }
      let opts = helper.extend({
        type: HAS_ONE,
        postType: postType,
        name: key,
        key: pk,
        fKey: this.name + '_id'
      }, item);
      if (this._relationName !== true && this._relationName.indexOf(opts.name) === -1) {
        return;
      }
      if(postType === 'DELETE'){
        opts.data = data;
      }else{
        let mapData = data[opts.name];
        if (helper.isEmpty(mapData)) {
          return;
        }
        opts.data = mapData;
      }
      opts.model = this.model(item.model || key).where(item.where);
      switch(item.type){
        case BELONG_TO:
          return this._postBelongsToRelation(data, opts);
        case HAS_MANY:
          return this._postHasManyRelation(data, opts);
        case MANY_TO_MANY:
          return this._postManyToManyRelation(data, opts);
        default:
          return this._postHasOneRelation(data, opts);
      }
    });
    await Promise.all(promises);
    return data;
  }
  /**
   * has one post
   * @param  {} data          []
   * @param  {} value         []
   * @param  {} mapOptions    []
   * @param  {} parsedOptions []
   * @return {}               []
   */
  _postHasOneRelation(data, mapOpts){
    let where;
    switch(mapOpts.postType){
      case 'ADD':
        mapOpts.data[mapOpts.fKey] = data[mapOpts.key];
        return mapOpts.model.add(mapOpts.data);
      case 'DELETE':
        where = {[mapOpts.fKey]: data[mapOpts.key]};
        return mapOpts.model.where(where).delete();
      case 'UPDATE':
        where = {[mapOpts.fKey]: data[mapOpts.key]};
        return mapOpts.model.where(where).update(mapOpts.data);
    }
  }
  /**
   * belongs to
   * @param  {} data []
   * @return {}      []
   */
  _postBelongsToRelation(data){
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
  _postHasManyRelation(data, mapOpts){
    let mapData = mapOpts.data;
    let model = mapOpts.model;
    if (!helper.isArray(mapData)) {
      mapData = [mapData];
    }
    switch(mapOpts.postType){
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
            }else{
              item[mapOpts.fKey] = data[mapOpts.key];
              //ignore error when add data
              return model.add(item).catch(() => {});
            }
          });
          return Promise.all(promises);
        });
      case 'DELETE':
        let where = {[mapOpts.fKey]: data[mapOpts.key]};
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
  async _postManyToManyRelation(data, mapOpts){
    let model = mapOpts.model;
    await model.getSchema();
    let rfKey = mapOpts.rfKey || (model.modelName.toLowerCase() + '_id');
    let relationModel = mapOpts.rModel ? this.model(mapOpts.rModel) : this.getRelationModel(model);

    let type = mapOpts.postType;
    if (type === 'DELETE' || type === 'UPDATE') {
      let where = {[mapOpts.fKey]: data[mapOpts.key]};
      await relationModel.where(where).delete(); 
    }

    if (type === 'ADD' || type === 'UPDATE') {
      let mapData = mapOpts.data;
      if (!helper.isArray(mapData)) {
        mapData = helper.isString(mapData) ? mapData.split(',') : [mapData];
      }
      let firstItem = mapData[0];
      if (helper.isNumberString(firstItem) || (helper.isObject(firstItem) && (rfKey in firstItem))) {
        let postData = mapData.map(item => {
          return {[mapOpts.fKey]: data[mapOpts.key], [rfKey]: item[rfKey] || item};
        });
        await relationModel.addMany(postData);
      }else{ 
        let unqiueField = await model.getUniqueField();
        if (!unqiueField) {
          return Promise.reject(new Error('table `' + model.tableName + '` has no unqiue field'));
        }
        let ids = await this._getRalationAddIds(mapData, model, unqiueField);
        let postData = ids.map(id => {
          return {[mapOpts.fKey]: data[mapOpts.key], [rfKey]: id};
        });
        await relationModel.addMany(postData);
      }
    }
  }
  /**
   * insert data, add ids
   * @param  {Array} dataList    []
   * @param  {Object} model       []
   * @param  {String} unqiueField []
   * @return {Promise}             []
   */
  async _getRalationAddIds(dataList, model, unqiueField){
    let ids = [];
    let pk = await model.getPk();
    let promises = dataList.map(item => {
      if (!helper.isObject(item)) {
        item = {[unqiueField]: item};
      }
      let value = item[unqiueField];
      let where = {[unqiueField]: value};
      return model.where(where).field(pk).find().then(data => {
        if (helper.isEmpty(data)) {
          return model.add(item).then(insertId => {
            ids.push(insertId);
          });
        }else{
          ids.push(data[pk]);
        }
      });
    });
    await Promise.all(promises);
    return ids;
  }
}

Relation.HAS_ONE = HAS_ONE;
Relation.BELONG_TO = BELONG_TO;
Relation.HAS_MANY = HAS_MANY;
Relation.MANY_TO_MANY = MANY_TO_MANY;

module.exports = Relation;