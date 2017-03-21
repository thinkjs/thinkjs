export default class extends think.Controller {
  __before(){
    //console.log('__before')
  }
  async indexAction(){
    let allSession = await this.session();
    //await this.session('userInfo', 'test');
    await this.session('hahaha', 'wwww')
    //await this.session(null);
    this.ctx.body = 1;;
  }
  __after(){
    //console.log('__after')
  }
}