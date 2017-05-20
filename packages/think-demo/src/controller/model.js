module.exports = class extends think.Controller {
  async indexAction() {
    let user = await this.model('user').getUser(1);
    if( think.isEmpty(user) ) {
      return this.fail();
    }

    return this.success(user);
  }

  async addTransAction() {
    let userModel = this.model('user');
    try {
      let userId = await userModel.trans();
      return this.success(userId);
    } catch(e) {
      return this.fail(e);
    }
  }

  async cacheAction() {
    let userId = this.query('id');
    let user = await this.model('user')
      .where({id: userId})
      .cache('user_' + userId)
      .find();
    
    if(think.isEmpty(user)) {
      return this.fail();
    }

    return this.success(user);
  }
}