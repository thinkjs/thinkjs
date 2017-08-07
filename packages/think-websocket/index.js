const helper = require('think-helper');
const assert = require('assert');

module.exports = app => {
  // In cluster environment socket.io requires you to use sticky sessions, 
  // to ensure that a given client hits the same process every time, 
  // otherwise its handshake mechanism won't work properly. 
  // https://github.com/uqee/sticky-cluster
  process.env.THINK_STICKY_CLUSTER = true;

  const config = helper.parseAdapterConfig(app.think.config('websocket'));
  const Handle = config.handle;
  assert(helper.isFunction(Handle), 'websocket.handle must be a function');

  let instance;
  app.on('appReady', () => {
    instance = new Handle(app.server, config, app);
    instance.run();
  });

  return {
    context: {
      get data() {
        return this.req.websocketData;
      },
      /**
       * get socket
       */
      get websocket() {
        return this.req.websocket;
      },
      /**
       * is websocket request
       */
      get isWebsocket() {
        return this.isMethod('WEBSOCKET');
      },
      /**
       * emit an event
       * @param {String} event 
       * @param {Mixed} data 
       */
      emit(event, data) {
        this.res.statusCode = 200;
        instance.emit(event, data, this.req.websocket);
      },
      /**
       * broadcast event
       * @param {String} event 
       * @param {Mixed} data 
       */
      broadcast(event, data) {
        this.res.statusCode = 200;
        instance.broadcast(event, data, this.req.websocket);
      }
    },
    controller: {
      get data() {
        return this.ctx.data;
      },
      get websocket() {
        return this.ctx.websocket;
      },
      get isWebsocket() {
        return this.ctx.isWebsocket;
      },
      emit(event, data) {
        return this.ctx.emit(event, data);
      },
      broadcast(event, data) {
        return this.ctx.broadcast(event, data);
      }
    }
  };
};
