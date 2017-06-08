module.exports = class extends think.Controller {
  async indexAction() {
    let user = await this.model('user').getUser(1);
    if( think.isEmpty(user) ) {
      return this.fail(3000, 'www');
    }

    return this.success(user);
  }
  async transactionAction(){
    let user = this.model('user');
    await user.transaction(async () => {
      let post = this.model('post');
      post.db(user.db());
      await user.add({name: 'test1'});
      await post.add({title: 'title1', user_id: 1});
    });
    this.success();
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