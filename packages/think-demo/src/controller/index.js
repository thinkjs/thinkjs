module.exports = class IndexController extends think.Controller {
  __before(){
  }
  async indexAction(){
    this.assign(this.i18n());
    // const result = await this.fetch('https://api.github.com/orgs/thinkjs').then(res => res.json());
    // this.assign('title', 'Welecome to' + result.name);
    await this.display('index_index');
  }
  __after(){
    //console.log('__after')
  }
}