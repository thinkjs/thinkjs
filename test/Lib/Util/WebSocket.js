var should = require('should');
var assert = require('assert');
var muk = require('muk');

var path = require('path');
var http = require('http');
var net = require('net');

global.APP_PATH = path.normalize(__dirname + '/../../App');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../index.js'));

describe('WebSocket', function(){
	var thinkHttp = thinkRequire('Http');
	var WebSocket = thinkRequire('WebSocket');
	var App = thinkRequire('App');

	var socket;
	var server = http.createServer(function (req, res) {
	  thinkHttp(req, res).run().then(App.listener);
	});

	var instance = WebSocket(server, App); 
	var websocket = require('websocket-driver');

	describe('init', function(){
		it('init server & app', function(){
			assert.deepEqual(instance.httpServer, server);
			assert.deepEqual(instance.app, App);
		})
	})

	describe('originIsAllowed', function(){
		it('allow origin empty', function(){
			var url = 'http://www.so.com:80/'
			C('websocket_allow_origin', '');
			assert.equal(instance.originIsAllowed(url), true);
		})
		it('allow origin is string', function(){
			var url = 'http://www.so.com:80/';
			C('websocket_allow_origin', 'www.so.com');
			assert.equal(instance.originIsAllowed(url), true);
			C('websocket_allow_origin', 'www.baidu.com');
			assert.equal(instance.originIsAllowed(url), false);
		})
		it('allow origin is array', function(){
			var url = 'http://www.so.com:80/'
			C('websocket_allow_origin', ['www.baidu.com', 'www.so.com']);
			assert.equal(instance.originIsAllowed(url), true);
			C('websocket_allow_origin', ['www.baidu.com', 'hao.360.cn']);
			assert.equal(instance.originIsAllowed(url), false);
		})
		it('allow origin is function', function(){
			var url = 'http://www.so.com:80/';
			var url1 = 'http://hao.360.cn/'
			C('websocket_allow_origin', function(hostname, info){
				return hostname.indexOf('so.com') > -1;
			});
			assert.equal(instance.originIsAllowed(url), true);
			assert.equal(instance.originIsAllowed(url1), false);
			C('websocket_allow_origin', '');
		})
	})

	describe('getSubProtocal', function(){
		it('websocket_sub_protocal is not funciton', function(){
			C('websocket_sub_protocal', 'chat');
			var req = {headers: {'sec-websocket-protocol': 'chat, superchat'}};
			assert.equal(instance.getSubProtocal(req), 'chat');
		})
		it('websocket_sub_protocal is funciton', function(){
			C('websocket_sub_protocal', function(protocals){
				if( protocals.indexOf('chat') > -1) {
					return 'chat';
				} else {
					return 'superchat';
				}
			});
			var req = {headers: {'sec-websocket-protocol': 'chat, superchat'}};
			assert.equal(instance.getSubProtocal(req), 'chat');
		})
		it('sec-websocket-protocol undefined', function(){
			C('websocket_sub_protocal', function(protocals){
				if( protocals.indexOf('chat') > -1) {
					return 'chat';
				} else {
					return '';
				}
			});
			var req = {headers: {}};
			assert.equal(instance.getSubProtocal(req), '');
		})
	})
	describe('openHandle', function(){
		it('url is /', function(done){
			var protocal = 'chat';
			var req = {'url':'/'};
			instance.openHandle(req, protocal).then(function(data){
				assert.deepEqual(data, {});
				done();
			})
		})
		it('url is /foo/index', function(done){
			var protocal = 'chat';
			var socket = new net.Socket();
			var req = {
				'method':'GET',
				'url':'/foo/index',
				'headers': {
					'host':'127.0.0.1',
					'upgrade': 'websocket',
					'connection': 'Upgrade',
					'sec-webSocket-key': 'dGhlIHNhbXBsZSBub25jZQ=',
					'sec-webSocket-protocol': 'chat, superchat',
					'wec-webSocket-version': '13'
				},
				'connection':{
					'remoteAddress':'127.0.0.1'
				},
				socket: socket
			};
			var fn = function(){};
      var cookies = '';
      var res = {setHeader: function(name, value){
        if (name === 'Set-Cookie' && value) {
          cookies = value;
        }
      }, end: fn, write: fn};

      C('url_route_rules', []);
      
      var content = 'module.exports = Controller(function() {"use strict";return {indexAction: function() {'
      	+ 'var self = this;this.cookie("name", "value");return self.end("");}};})';

			setFileContent(APP_PATH+'/Lib/Controller/Home/FooController.js', content);
			
      instance.openHandle(req, protocal).then(function(data){
      	assert.deepEqual(data.cookie, [ 'name=value; Path=/' ]);
      	assert.equal(data.http.websocket, socket);
      	rmdir(APP_PATH).then(done);
      }).catch(function(err){
        console.log(err.stack)
      })
		})
		it('url is /foo/index error', function(done){
			var protocal = 'chat';
			var socket = new net.Socket();
			var req = {
				'method':'GET',
				'url':'/foo/index',
				'headers': {
					'host':'127.0.0.1',
					'upgrade': 'websocket',
					'connection': 'Upgrade',
					'sec-webSocket-key': 'dGhlIHNhbXBsZSBub25jZQ=',
					'sec-webSocket-protocol': 'chat, superchat',
					'wec-webSocket-version': '13'
				},
				'connection':{
					'remoteAddress':'127.0.0.1'
				},
				socket: socket
			};
			var fn = function(){};
      var cookies = '';
      var res = {setHeader: function(name, value){
        if (name === 'Set-Cookie' && value) {
          cookies = value;
        }
      }, end: fn, write: fn};

      C('url_route_rules', []);
      
      var content = 'module.exports = Controller(function() {"use strict";return {indexAction: function() {'
      	+ 'var self = this;this.cookie("name", "value");return self.end("");}};})';

			setFileContent(APP_PATH+'/Lib/Controller/Home/FooController.js', content);
			var fn = instance.app.listener;
			instance.app.listener = function(){
				return getPromise(new Error('listener'), true);
			}
      instance.openHandle(req, protocal).catch(function(err){
        assert.equal(err.message, 'listener');
        instance.app.listener = fn;
        done();
      })
		})
	})
	describe('messageHandle', function(){
		it('json parse error', function(){
			instance.messageHandle('messageHandle', {
				socket: {
					send: function(code, message){
						assert.equal(code, -100002);
						assert.equal(message, 'messageHandle is not valid json');
					}
				}
			})
		})
		it('not json 2.0', function(){
			instance.messageHandle(JSON.stringify({jsonrpc: '1'}), {
				socket: {
					send: function(code, message){
						assert.equal(code, -100003);
						assert.equal(message, 'data.jsonrpc must be 2.0');
					}
				}
			})
		})
		it('method is empty', function(){
			instance.messageHandle(JSON.stringify({jsonrpc: '2.0', method: ''}), {
				socket: {
					send: function(code, message){
						assert.equal(code, -100004);
						assert.equal(message, 'data.method is not valid');
					}
				}
			})
		})
		it('messageHandle', function(done){
			instance.messageHandle(JSON.stringify({jsonrpc: '2.0', method: '/fasdfasdf'}), {
				socket: {
					send: function(code, message){
						//assert.equal(code, -100004);
						//assert.equal(message, 'data.method is not valid');
					}
				}
			}, {
				listener: function(http){
					assert.equal(http.pathname, '/fasdfasdf')
					assert.deepEqual(http.headers, { host: '127.0.0.1' })
					assert.deepEqual(http.get, {});
					done();
				}
			})
		})
		it('messageHandle with headers', function(done){
			instance.messageHandle(JSON.stringify({jsonrpc: '2.0', method: '/xxxx', params: {
				headers: {'Host': 'www.welefen.com'},
				data: {name: 'welefen', date: '20140919'}
			}}), {
				socket: {
					send: function(code, message){
						//assert.equal(code, -100004);
						//assert.equal(message, 'data.method is not valid');
					}
				}
			}, {
				listener: function(http){
					//console.log(http)
					assert.equal(http.pathname, '/xxxx')
					assert.deepEqual(http.headers, { host: '127.0.0.1', Host: 'www.welefen.com' })
					assert.deepEqual(http.get, { name: 'welefen', date: '20140919' });
					done();
				}
			})
		})
		it('messageHandle with headers', function(done){
			instance.messageHandle(JSON.stringify({jsonrpc: '2.0', method: '/xxxx?ww=11', params: {
				headers: {'Host': 'www.welefen.com'},
				data: {name: 'welefen', date: '20140919'}
			}}), {
				socket: {
					send: function(code, message){
						//assert.equal(code, -100004);
						//assert.equal(message, 'data.method is not valid');
					}
				}
			}, {
				listener: function(http){
					//console.log(http)
					assert.equal(http.pathname, '/xxxx')
					assert.deepEqual(http.headers, { host: '127.0.0.1', Host: 'www.welefen.com' })
					assert.deepEqual(http.get, { name: 'welefen', date: '20140919', ww: 11 })
					assert.equal(isObject(http.websocket), true);
					done();
				}
			})
		})
		it('messageHandle write', function(done){
			instance.messageHandle(JSON.stringify({jsonrpc: '2.0', method: '/xxxx?ww=11', params: {
				headers: {'Host': 'www.welefen.com'},
				data: {name: 'welefen', date: '20140919'}
			}}), {
				socket: {
					send: function(data){
						assert.equal(data, '{"jsonrpc":"2.0","result":{"name":"welefen"}}')
						done();
					}
				}
			}, {
				listener: function(http){
					http.echo(JSON.stringify({name: 'welefen'}));
				}
			})
		})
		it('messageHandle close', function(done){
			instance.messageHandle(JSON.stringify({jsonrpc: '2.0', method: '/xxxx?ww=11', params: {
				headers: {'Host': 'www.welefen.com'},
				data: {name: 'welefen', date: '20140919'}
			}}), {
				socket: {
					send: function(data){
						assert.equal(data, '{"jsonrpc":"2.0","result":{"name":"welefen"}}')
					}
				},close: function(){done()}
			}, {
				listener: function(http){
					http.end(JSON.stringify({name: 'welefen'}));
				}
			})
		})
	})
	describe('getRPCData', function(){
		it('getRPCData function ', function(){
			assert.deepEqual(instance.getRPCData(502,'bad gateway'), {jsonrpc: '2.0', error: {code: 502, message: 'bad gateway'}});
			assert.deepEqual(instance.getRPCData({a: 2, b: 3}), {jsonrpc: '2.0', result: {a: 2, b: 3}});
		})
	})
	describe('open', function(done){
		it('open', function(){
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.headers['sec-websocket-version'] = 13;
			instance.open(request).then(function(driver){
				var data = driver.send('welefen');
				assert.equal(data, true);
				var data = driver.send(new Buffer('welefen'));
				assert.equal(data, true);
				assert.equal(typeof driver.send, 'function')
				driver.socket.close();
				driver.socket.send('welefen');
				done();
			});
		})
		it('open', function(done){
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.socket.send = function(data){
				assert.equal(data, 'welefen');
				done();
			}
			request.headers['sec-websocket-version'] = 13;
			instance.open(request).then(function(driver){
				var data = driver.send('welefen');
				assert.equal(data, true);
				var data = driver.send(new Buffer('welefen'));
				assert.equal(data, true);
				assert.equal(typeof driver.send, 'function')
				driver.socket.close();
				driver.socket.send('welefen');
			});
		})
		it('message text', function(done){
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.socket.send = function(data){
				assert.equal(data, 'welefen');
				done();
			}
			request.headers['sec-websocket-version'] = 13;
			var fn = instance.messageHandle;
			instance.messageHandle = function(message){
				assert.equal(message, 'message');
				done();
			}
			instance.open(request).then(function(driver){
				driver.messages.emit('data', 'message')
			});
		})
		it('message buffer', function(done){
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.socket.send = function(data){
				assert.equal(data, 'welefen');
				done();
			}
			request.headers['sec-websocket-version'] = 13;
			var fn = instance.messageHandle;
			var buffer = new Buffer('welefen')
			instance.messageHandle = function(message){
				assert.equal(message, buffer);
				done();
			}
			instance.open(request).then(function(driver){
				driver.messages.emit('data', buffer)
			});
		})
		it('message text, user function', function(done){
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.socket.send = function(data){
				assert.equal(data, 'welefen');
				done();
			}
			request.headers['sec-websocket-version'] = 13;
			var fn = instance.messageHandle;
			C('websocket_message_handle', function(message){
				assert.equal(message, 'message')
				done();
			})
			instance.open(request).then(function(driver){
				driver.messages.emit('data', 'message')
			});
		})
		it('websocket.close', function(done){
			var fn = instance.openHandle;
			instance.openHandle = function(){
				var Http = thinkRequire('Http');
				var h = Http.getDefaultHttp('/');
				return Http(h.req, h.res).run().then(function(http){
					http.on('websocket.close', function(){
						instance.openHandle = fn;
						done();
					})
					return {
						cookie: 'name=welefen',
						http: http
					}
				})
			}
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.headers['sec-websocket-version'] = 13;
			instance.open(request).then(function(driver){
				driver.emit('close')
			})
		})
	})
	describe('run', function(){
		it('run, not WebSocket', function(){
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.headers['sec-websocket-version'] = 13;
			instance.run();
			instance.httpServer.emit('upgrade', request, request.socket);
		})
		it('run', function(){
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.headers['sec-websocket-version'] = 13;
			request.headers['Sec-WebSocket-Key'] = 'yy8/Zm+rgCPXjbiRGaGjNg==';
			request.method = 'GET';
			request.headers.upgrade = 'websocket';
			request.headers.origin = 'www.baidu.com';
			request.headers['connection'] = 'Upgrade';
			instance.run();
			instance.httpServer.emit('upgrade', request, request.socket);
		})
		it('run, originIsAllowed false', function(){
			var request = new http.IncomingMessage();
			request.url = '/';
			request.socket = new net.Socket();
			request.headers['sec-websocket-version'] = 13;
			request.headers['Sec-WebSocket-Key'] = 'yy8/Zm+rgCPXjbiRGaGjNg==';
			request.method = 'GET';
			request.headers.upgrade = 'websocket';
			request.headers.origin = 'www.baidu.com';
			request.headers['connection'] = 'Upgrade';
			C('websocket_allow_origin', 'www.welefen.com')
			instance.run();
			instance.httpServer.emit('upgrade', request, request.socket);
		})
	})
})

describe('rm tmp files', function(){
  it('rm tmp files', function(done){
    rmdir(path.normalize(__dirname + '/../../App')).then(done)
  })
})