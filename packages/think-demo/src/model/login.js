module.exports = class extends think.Model {
  constructor(...args) {
    super(...args);

    this.tableName = 'user';
  }

  getUser(id) {
    return this.where({id}).find();
  }
}