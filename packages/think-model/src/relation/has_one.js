const BaseRelation = require('./base.js');

/**
 * has one relation
 */
module.exports = class HasOneRelation extends BaseRelation {
  /**
   * relation on select or find
   */
  async getRelation() {
    const where = this.parseRelationWhere();
    const mapData = await this.options.model.where(where).select();
    return this.parseRelationData(mapData);
  }
};
