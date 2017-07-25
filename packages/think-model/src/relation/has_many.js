const BaseRelation = require('./base.js');

module.exports = class HasManyRelation extends BaseRelation {
  /**
   * relation on select or find
   */
  async getRelation() {
    const where = this.parseRelationWhere();
    const mapData = await this.options.model.where(where).select();
    return this.parseRelationData(mapData, true);
  }
};
