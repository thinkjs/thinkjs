export default class extends think.Controller {
  __before(){
    //console.log('__before')
  }
  indexAction(){
    console.log(this.render)
    //console.log('indexAction')
    this.ctx.body = 'testwwww';
  }
  __after(){
    //console.log('__after')
  }
}