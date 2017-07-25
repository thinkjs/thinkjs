const helper = require('think-helper');
const HasOne = require('./has_one.js');
const BelongTo = require('./belong_to.js');
const HasMany = require('./has_many.js');
const ManyToMany = require('./many_to_many.js');

const allowOptions = ['where', 'field', 'order', 'limit', 'page'];

class Relation {
  /**
   * constructor
   * @param {Object} model model instance
   */
  constructor(model) {
    this.model = model;
    this.relation = this.model.relation || {};
    this.relationName = true;
  }
  /**
   * set relation
   * @param {Mixed} name 
   * @param {Mixed} value 
   */
  setRelation(name, value) {
    // ignore undefined name
    if (name === undefined) {
      return this;
    }
    // add relation config {cate: {}}
    if (helper.isObject(name)) {
      helper.extend(this.relation, name);
      return this;
    }
    // add relation config setRelation('cate', {})
    if (!helper.isEmpty(value)) {
      helper.extend(this.relation, {[name]: value});
      return this;
    }

    // setRelation(true) or setRelation(false)
    if (helper.isBoolean(name)) {
      this.relationName = name;
      return this;
    }

    // enable relation
    if (helper.isString(name)) {
      name = name.split(/\s*,\s*/);
    }

    name = name || [];
    // filter relation name
    if (value === false) {
      name = Object.keys(this.relation).filter(item => {
        return name.indexOf(item) === -1;
      });
    }
    this.relationName = name;
    return this;
  }
  afterFind(data) {
    return this.getRelation(data);
  }
  afterSelect(data) {
    return this.getRelation(data);
  }

  async getRelation(data) {
    if (helper.isEmpty(data) || helper.isEmpty(this.relation) || helper.isEmpty(this.relationName)) return data;
    const promises = Object.keys(this.relation).map(key => {
      if (this.relationName === false) return;
      if (helper.isString(this.relationName) && this.relationName.indexOf(key) === -1) return;
      return this.parseItemRelation(key, data);
    });
    await Promise.all(promises);
    return data;
  }
  /**
   * 
   * @param {String} relationKey 
   * @param {Object|Array} data 
   */
  parseItemRelation(relationKey, data) {
    let item = this.relation[relationKey];
    if (!helper.isObject(item)) {
      item = {type: item};
    }
    const opts = Object.assign({
      name: relationKey,
      key: this.model.pk,
      fKey: `${this.model.modelName}_id`,
      relation: true,
      type: Relation.HAS_ONE
    }, item);
    // relation data is exist
    const itemData = helper.isArray(data) ? data[0] : data;
    const relData = itemData[opts.name];
    if (helper.isArray(relData) || helper.isObject(relData)) {
      return;
    }
    const model = this.model.model(item.model || relationKey);
    allowOptions.forEach(allowItem => {
      if (helper.isFunction(opts[allowItem])) {
        allowItem(this.model);
      } else {
        model[allowItem](opts[allowItem]);
      }
    });
    if (model.setRelation) {
      model.setRelation(opts.relation, false);
    }
    opts.model = model;
    let Cls = null;
    switch (opts.type) {
      case Relation.HAS_MANY:
        Cls = HasMany;
        break;
      case Relation.BELONG_TO:
        Cls = BelongTo;
        break;
      case Relation.MANY_TO_MANY:
        Cls = ManyToMany;
        break;
      default:
        Cls = HasOne;
        break;
    };
    const instance = new Cls(data, opts, this.model);
    return instance.getRelation();
  }
};
Relation.HAS_ONE = 1;
Relation.HAS_MANY = 2;
Relation.BELONG_TO = 3;
Relation.MANY_TO_MANY = 4;

module.exports = Relation;
