const helper = require('think-helper');
const BaseRelation = require('./base.js');

module.exports = class HasManyRelation extends BaseRelation {
  /**
   * relation on select or find
   */
  async getRelationData() {
    const where = this.parseRelationWhere();
    if (where === false) return this.data;
    const mapData = await this.options.model.where(where).select();
    return this.parseRelationData(mapData, true);
  }

  /**
   * relation on add, update, delete
   */
  async setRelationData(type) {
    const {model} = this.options;

    let data = this.data[this.options.name];
    if (!helper.isArray(data)) {
      data = [data];
    }
    switch (type) {
      case 'ADD':
        data = data.map(item => {
          item[this.options.fKey] = this.data[this.options.key];
          return item;
        });
        return model.addMany(data);
      case 'UPDATE':
        await model.getSchema();
        const {pk} = model;

        const promises = data.map(item => {
          if (item[pk]) {
            return model.update(item);
          }

          item[this.options.fKey] = this.data[this.options.key];
          return model.add(item);
        });
        return Promise.all(promises);
      case 'DELETE':
        return model.where({
          [this.options.fKey]: this.data[this.options.key]
        }).delete();
    }
  }
};
