const socketio = require('socket.io');
const helper = require('think-helper');
const mockHttp = require('think-mock-http');

module.exports = class SocketIO {
  /**
   * constructor
   */
  constructor(server, config, app) {
    this.server = server;
    this.config = config;
    this.app = app;
    this.io = socketio(server);

    // https://socket.io/docs/server-api/#server-adapter-value
    if (config.adapter) {
      this.io.adapter(config.adapter(this.io));
    }
    // https://socket.io/docs/server-api/#server-origins-value
    if (config.allowOrigin) {
      this.io.origins(config.allowOrigin);
    }
    // https://socket.io/docs/server-api/#server-path-value
    if (config.path) {
      this.io.path(this.config.path);
    }
  }
  /**
   * mock request
   * @param {String} url 
   * @param {Object} data 
   * @param {Object} socket 
   */
  mockRequst(url, data, socket, open) {
    if (url[0] !== '/') url = `/${url}`;

    const args = {url, websocketData: data, websocket: socket, io: this.io, method: 'WEBSOCKET'};
    if (open) {
      args.req = socket.request;
      if (socket.request.res) {
        args.res = socket.request.res;
      }
    }
    return mockHttp(args, this.app);
  }
  /**
   * register socket
   */
  registerSocket(io, messages = {}) {
    io.on('connection', socket => {
      if (messages.open) {
        this.mockRequst(messages.open, undefined, socket, true);
      }
      if (messages.close) {
        socket.on('disconnect', () => {
          this.mockRequst(messages.close, undefined, socket);
        });
      }
      for (const key in messages) {
        if (key === 'open' || key === 'close') continue;
        socket.on(key, data => {
          this.mockRequst(messages[key], data, socket);
        });
      }
    });
  }
  /**
   * emit an event
   * @param {String} event 
   * @param {Mixed} data 
   * @param {Object} socket 
   */
  emit(event, data, socket) {
    socket.emit(event, data);
  }
  /**
   * broadcast event
   * @param {String} event 
   * @param {Mixed} data 
   * @param {Object} socket 
   */
  broadcast(event, data, socket) {
    socket.emit(event, data);
    socket.broadcast.emit(event, data);
  }
  /**
   * run
   */
  run() {
    let messages = this.config.messages || {};
    if (!helper.isArray(messages)) {
      messages = [messages];
    }
    messages.forEach(item => {
      const sc = item.namespace ? this.io.of(item.namespace) : this.io;
      this.registerSocket(sc, item);
    });
  }
};
