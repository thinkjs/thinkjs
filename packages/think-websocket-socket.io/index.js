const socketio = require('socket.io');
const helper = require('think-helper');
const mockHttp = require('think-mock-http');

module.exports = class SocketIO {
  /**
   * constructor
   */
  constructor(server, config, app){
    this.server = server;
    this.config = config;
    this.app = app;
    this.io = socketio(server);

    //https://socket.io/docs/server-api/#server-adapter-value
    if(config.adapter){
      this.io.adapter(config.adapter(this.io));
    }
    //https://socket.io/docs/server-api/#server-origins-value
    if(config.allowOrigin){
      this.io.origins(config.allowOrigin);
    }
    //https://socket.io/docs/server-api/#server-path-value
    if(config.path){
      this.io.path(this.config.path);
    }
  }
  /**
   * mock request
   * @param {String} url 
   * @param {Object} data 
   * @param {Object} socket 
   */
  mockRequst(url, data, socket){
    if(url[0] !== '/') url = `/${url}`;
    let request = socket.request;
    if(!request.res){
      let args = {url, data, socket};
      return mockHttp(args, this.app);
    }else{
      request.url = url;
      request.method = 'WEBSOCKET';
      request.data = data;
      let fn = this.app.callback();
      return fn(request, request.res);
    }
  }
  /**
   * register socket
   */
  registerSocket(io, messages = {}){
    io.on('connection', socket => {
      if(messages.open){
        this.mockRequst(messages.open, undefined, socket);
      }
      if(messages.close){
        socket.on('disconnect', () => {
          this.mockRequst(messages.close, undefined, socket);
        });
      }
      for(let key in messages){
        if(key === 'open' || key === 'close') continue;
        socket.on(key, data => {
          this.mockRequst(messages[key], data, socket);
        })
      }
    });
  }
  /**
   * run
   */
  run(){
    let messages = this.config.messages || {};
    if(!helper.isArray(messages)){
      messages = [messages];
    }
    messages.forEach(item => {
      let sc = item.namespace ? this.io.of(item.namespace) : this.io;
      this.registerSocket(sc, item);
    });
  }
}