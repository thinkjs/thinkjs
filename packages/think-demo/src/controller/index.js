export default class extends think.Controller {
  __before(){
    //console.log('__before')
  }
  async indexAction(){
    this.assign('title', 'test')
    //console.log('indexAction')
    await this.display();
  }
  __after(){
    //console.log('__after')
  }
}