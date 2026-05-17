module.exports = class SessionController extends think.Controller {
  indexAction(){
    this.success(231);
  }
  /**
   * set session: default is file
   */
  async setAction(){
    await this.session('name', 'value');
    let value = await this.session('num') | 0;
    await this.session('num', value + 1);
    await this.session('test', {name: 'test'})
    return this.success();
  }
  /**
   * get session: file
   */
  async getAction(){
    let data = await this.session();
    return this.success(data);
  }
  /**
   * set session: cookie
   */
  async set2Action(){
    await this.session('num2', '3', {type: 'cookie'});
    //let value = await this.session('num2') | 0;
    await this.session('num2',  1);
    //await this.session('test', {name: 'test'});
    return this.success();
  }
  /**
   * get session: cookie
   */
  async get2Action(){
    let data = await this.session('num2', undefined, {type: 'cookie'});
    return this.success(data);
  }
  /**
   * set session: redis
   */
  async set3Action(){
    await this.session('name', 'redis', {
      type: 'redis'
    });
    let value = await this.session('num') | 0;
    await this.session('num', value + 1);
    await this.session('test', {name: 'test'})
    return this.success();
  }
  /**
   * get session: redis
   */
  async get3Action(){
    let data = await this.session('test', undefined, {
      type: 'cookie'
    });
    this.success(data);
  }
  /**
   * remove session
   */
  async rmAction(){
    await this.session(null);
    return this.success();
  }
}