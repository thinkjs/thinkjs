const test = require('ava');
const http = require('http');
const helper = require('think-helper');
const exec = require('child_process').exec;
const mockery = require('mockery');
const server = http.createServer();

let app = {
  callback: function() {
    return function(req, res) {};
  }
}

let socket = {
  emit: function(event, data, socket) {

  },
  broadcast:{
    emit: function(event, data, socket) {

    }
  },
  on: function(event, cb) {
    cb();
  },
  request: function() {
    return {};
  }
}

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});

mockery.registerMock('socket.io', function() {
  const SOCKETIO = {
    adapter: function() {},
    origins: function() {},
    path: function() {},
    on: function(event, cb) {
      cb(socket);
    },
    of: function() {
      return SOCKETIO;
    }
  }
  return SOCKETIO;
});

const SocketIO = require('../index.js');


let event = {};
let data = {};

test('socketio', t => {
  let socketioInst = new SocketIO(server, {
    path: '/',
    allowOrigin: true,
    adapter: function() {},
    messages: [{
      namespace: '/chat',
      open: true,
      close: true,
      test: function() {},
    }]
  }, app);
  socketioInst.run();
  socketioInst.emit(event, data, socket);
  socketioInst.broadcast(event, data, socket);
  t.true(true);
});


test('socketio', t => {
  let socketioInst = new SocketIO(server, {
    path: '/',
    allowOrigin: true,
    adapter: function() {},
    messages: {
      namespace: '/chat',
      open: true,
      close: true,
      test: function() {},
    }
  }, app);
  socketioInst.run();
  socketioInst.emit(event, data, socket);
  socketioInst.broadcast(event, data, socket);
  t.true(true);
});


// test('socketio', t => {
//   let socketioInst = new SocketIO(server, {
//     path: '/',
//     allowOrigin: true,
//     adapter: function() {},
//     messages: null
//   }, app);
//   socketioInst.run();
//   socketioInst.emit(event, data, socket);
//   socketioInst.broadcast(event, data, socket);
//   t.true(true);
// });

test('socketio', t => {
  let socketioInst = new SocketIO(server, {
    path: '',
    allowOrigin: null,
    adapter: null,
    messages: null
  }, app);
  socketioInst.run();
  socketioInst.emit(event, data, socket);
  socketioInst.broadcast(event, data, socket);
  t.true(true);
});
