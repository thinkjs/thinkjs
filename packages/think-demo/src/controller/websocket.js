module.exports = class extends think.Controller {
  indexAction(){
    return this.display('websocket_index');
  }
  openAction(){
    this.cookie('websocket', 'socket.io');
    this.broadcast('user', {name: 'new uesr'})
  }
  testAction(){
    // console.log('data', this.data);
    // console.log('cookie:test', this.cookie('think_locale'))
    this.emit('hello', {name: 'test'})
  }
  closeAction(){
    // this.ctx.res.statusCode = 200;
    this.body = 'test';
  }
}