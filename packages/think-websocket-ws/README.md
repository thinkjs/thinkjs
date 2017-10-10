# think-websocket-ws
[![npm](https://img.shields.io/npm/v/think-websocket-ws.svg?style=flat-square)](https://www.npmjs.com/package/think-websocket-ws)

ThinkJS 3.X's ws adapter for websocket.

## Install

```
npm install think-websocket-ws
```

## How to Config

Edit config file `src/config/adapter.js`, add options:

```js
const ws = require('think-websocket-ws');
exports.ws = {
  type: 'ws',
  common: {
    // common config
  },
  ws: {
    handle: ws,
    path: '/ws',
    messages: [{
      close: '/ws/close',
      open: '/ws/open',
      addUser: '/ws/addUser'
    }]
  }
}
```

More options see at [ws doc](https://github.com/websockets/ws/blob/master/doc/ws.md).

## Work with Action

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
    console.log(this.wsData); // this.req.websocketData, 'thinkjs'
    console.log(this.websocket); // this.req.websocket, websocket instance
    console.log(this.isWebsocket); // this.isMethod('WEBSOCKET'), true
    return this.success();
  }
}

// client
var ws = new WebSocket('ws://127.0.0.1:8360/ws');

ws.onopen = function() {
  console.log('open...');
}

ws.onerror = function(evt) {
  console.log(evt);
}

ws.onmessage = function(data) {
  console.log(data);
}

$('.send').on('click', function(evt) {
  var username = $.trim($('.usernameInput').val());
  var room = $.trim($('.roomInput').val());
  ws.send(JSON.stringify({
    event: 'addUser',
    data: {
      username: username,
      room: room
    }
  }));
});
```

## emit

You can emit event to the current socket in Action through `this.emit`:

```js
  // server
  module.exports = class extends think.Controller {
    constructor(...arg) {
      super(...arg);
    }
    openAction() {
      this.emit('opend', 'This client opened successfully!');
      return this.success();
    }
  }

  // client
  ws.onmessage = function(data) {
    data = JSON.parse(data.data);
    console.log(data.event); // opend
    console.log(data.data);  // This client opened successfully!
  }
```

## broadcast

You can broadcast event to all sockets in Action through method `this.broadcast`:

```js
  // server
  module.exports = class extends think.Controller {
    constructor(...arg) {
      super(...arg);
    }
    openAction() {
      this.broadcast('joined', 'There is a new client joined successfully!');
      return this.success();
    }
  }

  // client
  ws.onmessage = function(data) {
    data = JSON.parse(data.data);
    console.log(data.event); // joined
    console.log(data.data);  // There is a new client joined successfully!
  }
```
