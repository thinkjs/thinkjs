/*
* @Author: lushijie
* @Date:   2017-10-09 14:00:01
* @Last Modified by:   lushijie
* @Last Modified time: 2017-12-27 16:11:59
*/
const WebSocketServer = require('ws').Server;
const helper = require('think-helper');
const mockHttp = require('think-mock-http');
const WS_STATUS = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

const getDestructResult = (properties, sourceObject) => {
  const destObject = {};
  const aliasMap = {};

  properties = Array.isArray(properties) ? properties : [properties];
  properties = properties.map(function(ele) {
    if (ele.indexOf(':') > -1) {
      aliasMap[ele.split(':')[0]] = ele.split(':')[1];
    }
    return ele.split(':')[0];
  });
  Object.keys(sourceObject).forEach(function(ele) {
    if (properties.indexOf(ele) > -1) {
      if (sourceObject[ele] !== undefined) {
        destObject[aliasMap[ele] || ele] = sourceObject[ele];
      }
    }
  });
  return destObject;
};

module.exports = class WebSocket {
  /**
   * constructor
   */
  constructor(server, config, app) {
    this.server = server;
    this.config = config;
    this.app = app;
    const wssConfig = getDestructResult(['host', 'port', 'backlog', 'verifyClient', 'handleProtocols', 'path', 'noServer', 'clientTracking', 'perMessageDeflate', 'maxPayload'], config);
    wssConfig.server = server;
    this.wss = new WebSocketServer(wssConfig, config.callback || null);
  }

  /**
   * mock request
   * @param {String} url
   * @param {Object} data
   * @param {Object} socket
   */
  mockRequst(url, data, socket, request ,open) {
    if (url[0] !== '/') url = `/${url}`;
    const args = {url, websocketData: data, websocket: socket, method: 'WEBSOCKET'};
    if (open) {
      args.req = request;
    }
    return mockHttp(args, this.app);
  }

  /**
   * register socket
   */
  registerSocket(wss, messages = {}) {
    const eventListener = getDestructResult(['onConnection', 'onError', 'onHeaders', 'onListening'], this.config);

    wss.on('connection', (socket, request) => {
      if (messages.open) {
        this.mockRequst(messages.open, undefined, socket, request, true);
      }

      if (messages.close) {
        socket.on('close', () => {
          this.mockRequst(messages.close, undefined, socket);
        });
      }

      for (const key in messages) {
        if (key === 'open' || key === 'close') continue;
        socket.on('message', data => {
          data = JSON.parse(data);
          if (key === data.event) {
            this.mockRequst(messages[key], data, socket);
          }
        });
      }
    });

    wss.on('listening', eventListener.onListening || (() => {}));
    wss.on('headers', eventListener.onHeaders || (() => {}));
    wss.on('error', eventListener.onError || (() => {}));
  }

  /**
   * emit an event
   * @param {String} event
   * @param {Mixed} data
   * @param {Object} socket
   */
  emit(event, data, socket) {
    if (socket.readyState === WS_STATUS.OPEN) {
      socket.send(JSON.stringify({
        event,
        data
      }));
    };
  }

  /**
   * broadcast event
   * @param {String} event
   * @param {Mixed} data
   * @param {Object} socket
   */
  broadcast(event, data, socket) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WS_STATUS.OPEN) {
        client.send(JSON.stringify({
          event,
          data
        }));
      }
    });
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
      const wss = this.wss;
      this.registerSocket(wss, item);
    });
  }
};
