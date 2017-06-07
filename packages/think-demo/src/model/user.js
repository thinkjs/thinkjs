module.exports = class extends think.Model.Relation {
  constructor(...args) {
    super(...args);
    this.relation = {
      post: think.Model.Relation.HAS_MANY
    }
  }

  async getUser(id) {
    return this.where({id}).find();
  }

  async trans() {
    await this.startTrans();
    try{
      await this.startTrans();
      let userId = await this.add({name: 'xxx', email: 'test@gmail.com'});
      await this.where({id: userId}).update({
        name: 'lizheming'
      });
      
      await this.commit();
      return userId;
    }catch(e){
      await this.rollback();
      throw e;
    }
  }
}