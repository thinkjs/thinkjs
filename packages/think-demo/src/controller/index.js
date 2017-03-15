export default class extends think.Controller {
  __before(){
    //console.log('__before')
  }
  async indexAction(){
    let data = await Promise.resolve(333);
    let {a, b, ...c} = data;
    let x = {};
    let z = { x, ...data };
    //console.log('indexAction')
    await this.display();
  }
  __after(){
    //console.log('__after')
  }
}