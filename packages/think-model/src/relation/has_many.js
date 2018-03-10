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
    const relationModelName = this.options.rModel || this.getRelationModelName();
    const relationModel = this.model.model(relationModelName);
    relationModel.db(this.model.db());

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
        return relationModel.addMany(data);
      case 'UPDATE':
        await relationModel.getSchema();
        const {pk} = relationModel;

        const promises = data.map(item => {
          if (item[pk]) {
            return relationModel.update(item);
          }

          item[this.options.fKey] = this.data[this.options.key];
          // ignore error when add data
          return relationModel.add(item).catch(() => {});
        });
        return Promise.all(promises);
      case 'DELETE':
        return relationModel.where({
          [this.options.fKey]: this.data[this.options.key]
        }).delete();
    }
  }
};
