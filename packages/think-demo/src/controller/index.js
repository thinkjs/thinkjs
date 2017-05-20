module.exports = class IndexController extends think.Controller {
  __before(){
  }
  async indexAction(){
    var {jed, numeral, moment} = this.i18n();
    this.assign('jed', jed);
    this.assign('numeral', numeral);
    this.assign('moment', moment);
    const result = await this.fetch('https://api.github.com/orgs/thinkjs').then(res => res.json());
    this.assign('title', 'Welecome to' + result.name);
    await this.display('index_index');
  }
  __after(){
    //console.log('__after')
  }
}