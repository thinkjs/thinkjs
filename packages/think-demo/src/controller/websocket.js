module.exports = class extends think.Controller {
  indexAction(){
    return this.display('websocket_index');
  }
  openAction(){
    this.broadcast('user', {name: 'new uesr'})
  }
  testAction(){
    this.body = 'test';
    this.emit('hello', {name: 'test'})
  }
  closeAction(){

  }
}