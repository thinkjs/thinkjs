module.exports = class IndexController extends think.Controller {
  __before(){
    //console.log('__before')
  }
  async indexAction(){
    //console.log(this.ctx.request.body)

    var {jed, numeral, moment} = this.i18n();
    this.assign('jed', jed);
    this.assign('numeral', numeral);
    this.assign('moment', moment);
    const result = await this.fetch('https://cnodejs.org/api/v1/topic/56e688a983cbb63b6d120300').then(res => res.json());
    this.assign('title', result.data.title);
    console.log(this);
    await this.display('index_index');
  }
  __after(){
    //console.log('__after')
  }

  async i18nAction(){
    this.assign(this.i18n());
    await this.display('index_i18n');
  }
}