module.exports = class extends think.Controller {
  __before(){
    //console.log('__before')
  }
  async indexAction(){
    //this.ctx.body = 'test2';
    await this.display('index_index');
    //throw new Error('haha')
  }
  __after(){
    //console.log('__after')
  }
}