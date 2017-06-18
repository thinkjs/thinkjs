const helper = require('think-helper');

module.exports = app => {
  app.on('appReady', () => {
    const config = helper.parseAdapterConfig(app.think.config('websocket'));
    const handle = config.handle;
    delete config.handle;
    const instance = new handle(app.server, config, app);
    instance.run();
  });
  return {
    context: {
      get data(){
        return this.req.data;
      },
      get socket(){
        return this.req.socket;
      },
      /**
       * is websocket request
       */
      get isWebsocket(){
        return this.isMethod('WEBSOCKET');
      },
      /**
       * emit an event
       */
      emit: function(event, data) {
        this.res.statusCode = 200;
        this.socket.emit(event, data);
      },
      /**
       * broadcast event
       */
      broadcast: function(event, data, containSelf) {
        this.res.statusCode = 200;
        if(containSelf){
          this.socket.emit(event, data);
        }
        this.socket.broadcast.emit(event, data);
      }
    },
    controller: {
      get data(){
        return this.ctx.data;
      },
      get socket(){
        return this.ctx.socket;
      },
      get isWebsocket(){
        return this.ctx.isWebsocket;
      },
      emit: function(event, data) {
        return this.ctx.emit(event, data);
      },
      broadcast: function(event, data) {
        return this.ctx.broadcast(event, data);
      }
    }
  }
}