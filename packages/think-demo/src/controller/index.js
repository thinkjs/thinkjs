module.exports = class extends think.Controller {
  __before(){
    //console.log('__before')
  }
  async indexAction(){
    console.log(this.ctx.request.body)
    
    const result = await this.fetch('https://cnodejs.org/api/v1/topic/56e688a983cbb63b6d120300').then(res => res.json());
    this.assign('title', result.data.title);
    this.display('index_index');
  }
  __after(){
    //console.log('__after')
  }
}