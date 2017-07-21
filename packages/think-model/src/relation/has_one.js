const AbstractRelation = require('./abstract.js');

/**
 * has one relation
 */
module.exports = class HasOneRelation extends AbstractRelation {
  async getRelation() {
    const where = this.parseRelationWhere();
    const mapData = await this.options.model.where(where).select();
    return this.parseRelationData(mapData);
  }
};
