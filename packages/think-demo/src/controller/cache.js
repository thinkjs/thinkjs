module.exports = class extends think.Controller {

  /**
   * default set and get cache
   */
  async setAction() {
    await this.cache('name', 'lushijie');
    let name = await this.cache('name');
    return this.success(name);
  }

  /**
   * del cache
   */
  async delAction() {
    await this.cache('name', 'lushijie');
    let name = await this.cache('name', null);
    return this.success(name);
  }

  /**
   * value is function
   */
  async funAction() {
    // return fn() if cache not exist
    let name = await this.cache('name', function(a) {
      return a + '-thinkjs';
    });

    // return cache'value if cache exist
    await this.cache('email', 'power@126.com');
    let email = await this.cache('email', function(a) {
      return a + '+thinkjs';
    });
    return this.success('name:' + name + ';' + 'email:' + email);
  }
}
