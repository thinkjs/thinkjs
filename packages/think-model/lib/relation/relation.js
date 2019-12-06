function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    if (name === undefined) return this;

    // add relation config {cate: {}}
    if (helper.isObject(name)) {
      helper.extend(this.relation, name);
      return this;
    }
    // add relation config setRelation('cate', {})
    if (!helper.isEmpty(value)) {
      helper.extend(this.relation, { [name]: value });
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
    return this.getRelationData(data);
  }
  afterSelect(data) {
    return this.getRelationData(data);
  }
  afterUpdate(data) {
    return this.setRelationData('UPDATE', data);
  }
  afterAdd(data) {
    return this.setRelationData('ADD', data);
  }
  afterDelete(data) {
    return this.setRelationData('DELETE', data.where);
  }
  /**
   * set relation data
   * @param {Array|Object} data
   */
  setRelationData(type, data) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (helper.isEmpty(data) || helper.isEmpty(_this.relation) || helper.isEmpty(_this.relationName)) return;

      const promises = Object.keys(_this.relation).map(function (key) {
        if (helper.isArray(_this.relationName) && _this.relationName.indexOf(key) === -1) {
          return;
        }

        const instance = _this.getRelationInstance(key, data, type);
        if (helper.isEmpty(instance)) return;
        return instance.setRelationData(type);
      });
      return Promise.all(promises);
    })();
  }
  /**
   * get relation data
   * @param {Array|Object} data
   */
  getRelationData(data) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (helper.isEmpty(data) || helper.isEmpty(_this2.relation) || helper.isEmpty(_this2.relationName)) return data;
      const promises = Object.keys(_this2.relation).map(function (key) {
        if (helper.isArray(_this2.relationName) && _this2.relationName.indexOf(key) === -1) return;
        return _this2.parseItemRelation(key, data);
      });
      yield Promise.all(promises);
      return data;
    })();
  }
  /**
   *
   * @param {String} relationKey
   * @param {Object|Array} data
   */
  parseItemRelation(relationKey, data) {
    const instance = this.getRelationInstance(relationKey, data);
    if (helper.isEmpty(instance)) {
      return;
    }
    return instance.getRelationData();
  }
  /**
   *
   * @param {String} relationKey
   * @param {Object|Array} data
   * @param {String} type
   */
  getRelationInstance(relationKey, data, type) {
    let item = this.relation[relationKey];
    if (!helper.isObject(item)) {
      item = { type: item };
    }
    const opts = Object.assign({
      name: relationKey,
      key: this.model.pk,
      model: relationKey,
      fKey: `${this.model.modelName}_id`,
      relation: true,
      type: Relation.HAS_ONE
    }, item);

    // relation data is exist
    if (!type) {
      // get relation data
      const itemData = helper.isArray(data) ? data[0] : data;
      const relData = itemData[opts.name];
      if (helper.isArray(relData) || helper.isObject(relData)) {
        return;
      }
    } else {
      // set relation data
      if (type !== 'DELETE' && helper.isEmpty(data[opts.name])) {
        return;
      }
    }

    const model = this.model.model(opts.model);
    // make model use the same connection when invoked in transactions
    model.db(this.model.db());

    allowOptions.forEach(allowItem => {
      let itemFn = opts[allowItem];
      if (helper.isFunction(itemFn)) {
        itemFn = itemFn.call(model, model, this.model);
      }
      if (itemFn !== undefined) {
        model[allowItem](itemFn);
      }
    });
    // disable relation in sub class
    if (opts.relation !== undefined) {
      model.setRelation(opts.relation, false);
    }
    opts.model = model;
    let Cls = null;
    switch (opts.type) {
      case Relation.HAS_MANY:
        Cls = HasMany;
        break;
      case Relation.BELONG_TO:
        // change the default key & fKey
        opts.key = item.key || `${opts.model.modelName}_id`;
        opts.fKey = item.fKey || 'id';
        Cls = BelongTo;
        break;
      case Relation.MANY_TO_MANY:
        Cls = ManyToMany;
        break;
      default:
        Cls = HasOne;
        break;
    };
    return new Cls(data, opts, this.model);
  }
};
Relation.HAS_ONE = 1;
Relation.HAS_MANY = 2;
Relation.BELONG_TO = 3;
Relation.MANY_TO_MANY = 4;

module.exports = Relation;