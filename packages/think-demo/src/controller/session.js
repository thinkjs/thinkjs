module.exports = class SessionController extends think.Controller {
  indexAction(){
    this.success(231);
  }
  /**
   * set session
   */
  async setAction(){
    await this.session('name', 'value');
    let value = await this.session('num') | 0;
    await this.session('num', value + 1);
    await this.session('test', {name: 'test'})
    return this.success();
  }
  /**
   * get session
   */
  async getAction(){
    let data = await this.session();
    return this.success(data);
  }
  /**
   * get session
   */
  async get2Action(){
    let data = await this.session('name', undefined, {type: 'cookie'});
    return this.success(data);
  }
  /**
   * remove session
   */
  async rmAction(){
    await this.session(null);
    return this.success();
  }
}