# think-websocket-socket.io
[![Build Status](https://travis-ci.org/thinkjs/think-websocket-socket.io.svg?branch=master)](https://travis-ci.org/thinkjs/think-websocket-socket.io)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-websocket-socket.io/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-websocket-socket.io?branch=master)
[![npm](https://img.shields.io/npm/v/think-websocket-socket.io.svg?style=flat-square)](https://www.npmjs.com/package/think-websocket-socket.io)

Socket.io adapter for websocket

## Install

```
npm install think-websocket-socket.io
```

## How to config

Edit config file `src/config/adapter.js`, add options:

```js
const socketio = require('think-websocket-socket.io');
exports.websocket = {
  type: 'socketio',
  common: {
    // common config
  },
  socketio: {
    handle: socketio,
    allowOrigin: null, // any origin is allowed by default
    path: '/socket.io', // `/socket.io` by default.
    adapter: null,
    messages: [{
      open: '/websocket/open', // websocket action when connected
      close: '/websocket/close', // websocket action when close
      addUser: '/websocket/addUser', //websocket addUser action when event is addUser
    }]
  }
}
```

### config options

`path`: The socket.io process path is `/socket.io` by default. You can edit the folloing configuration if you need.

`adapter`: When using multiple nodes to deploy WebSocket, multiple nodes can communicate with Redis. You can get things done by set up adapter. For example:

```js
const socketio = require('think-websocket-socket.io');
const redis = require('socket.io-redis');
const adapter1 = redis({ host: 'localhost', port: 6379 });
exports.websocket = {
  type: 'socketio',
  socketio: {
    // ...
    adapter: adapter1,
    // ...
  }
}
```

`allowOrigin`: Sets the allowed origins value. Defaults to any origins being allowed. `allowOrigin` can be `string`, `array` or `function`. More detail see at https://socket.io/docs/server-api/#server-origins-value[https://socket.io/docs/server-api/#server-origins-value].

## Work With Action

```js
// server
module.exports = class extends think.Controller {
  constructor(...arg) {
    super(...arg);
  }
  openAction() {
    console.log('ws open');
    return this.success();
  }
  closeAction() {
    console.log('ws close');
    return this.success();
  }
  addUserAction() {
    console.log('addUserAction ...');
    console.log(this.data); // this.req.websocketData, 'thinkjs'
    console.log(this.websocket); // this.req.websocket, websocket instance
    console.log(this.isWebsocket); // this.isMethod('WEBSOCKET'), true
    return this.success();
  }
}

// in `view/websocket_index.html`
// <script src="http://lib.baomitu.com/socket.io/2.0.1/socket.io.js"></script>
var socket = io();
socket.on('opend', function(data) {
  console.log(data);
});
socket.emit('addUser', 'thinkjs');
```

## emit

You can emit event to the current socket in Action through `this.emit`:

```js
  // server
  openAction() {
    this.emit('opend', 'This client opened successfully!');
    return this.success();
  }

  // client
  //<script src="http://lib.baomitu.com/socket.io/2.0.1/socket.io.js"></script>
  var socket = io();
  socket.on('opend', function(data) {
    console.log(data);
  });
```

## broadcast

You can broadcast event to all sockets in Action through method `this.broadcast`:

```js
  // server
  openAction() {
    this.broadcast('joined', 'There is a new client joined successfully!');
    return this.success();
  }

  // client
  //<script src="http://lib.baomitu.com/socket.io/2.0.1/socket.io.js"></script>
  var socket = io();
  socket.on('joined', function(data) {
    console.log(data);
  });
```
