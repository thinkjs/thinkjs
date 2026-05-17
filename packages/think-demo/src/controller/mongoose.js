module.exports = class extends think.Controller {
  async indexAction() {
    console.log('index action')
    const user = this.mongoose('front/www', 'mongoose');
    const ret = await user.create({
      title: 'title',
      author: 'author',
      body: 'body'
    });
    const data = await user.getList();
    console.log('data', data)
    return this.success();
  }
}