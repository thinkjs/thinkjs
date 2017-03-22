module.exports = class extends think.Controller {
  __before(){
    //console.log('__before')
  }
  indexAction(){
    throw new Error('haha')
  }
  __after(){
    //console.log('__after')
  }
}