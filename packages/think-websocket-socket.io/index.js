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
      this.io.adapter(config.adapter);
    }
    // https://socket.io/docs/server-api/#server-origins-value
    if (config.allowOrigin) {
      this.io.origins(config.allowOrigin);
    }
    // https://socket.io/docs/server-api/#server-path-value
    if (config.path) {
      this.io.path(config.path);
      if (config.path !== '/socket.io') {
        this.io.listen(server);
      }
    }
  }
  /**
   * mock request
   * @param {String} url
   * @param {Object} data
   * @param {Object} socket
   */
  mockRequst(url, data, fn, socket, open) {
    if (url[0] !== '/') url = `/${url}`;

    const args = {url, websocketData: data, websocket: socket, wsCallback: fn, io: this.io, method: 'WEBSOCKET'};
    if (open) {
      args.req = socket.request;
    }
    return mockHttp(args, this.app);
  }
  /**
   * register socket
   */
  registerSocket(io, messages = {}) {
    io.on('connection', socket => {
      if (messages.open) {
        this.mockRequst(messages.open, undefined, undefined, socket, true);
      }
      if (messages.close) {
        socket.on('disconnect', () => {
          this.mockRequst(messages.close, undefined, undefined, socket);
        });
      }
      for (const key in messages) {
        if (key === 'open' || key === 'close') continue;
        socket.on(key, (data, fn) => {
          this.mockRequst(messages[key], data, fn, socket);
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
