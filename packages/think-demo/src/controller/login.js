module.exports = class extends think.Controller {
  async indexAction() {
    let user = await this.model('login').getUser(1);
    if( think.isEmpty(user) ) {
      return this.fail();
    }

    return this.success(user);
  }
}