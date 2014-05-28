var EventEmitter = require('events').EventEmitter;
var crypto   = require('crypto');

var GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

var WebSocket = module.exports = Class().inherits(EventEmitter).extend(function(){
	"use strict";
	return {
		init: function(request, socket){
			EventEmitter.call(this);
			this.request = request;
			this.socket = socket || request.socket;
		},
		handshake: function(){
			var headers = this.request.headers;
			var secKey = headers['sec-websocket-key'];
			if (!secKey) {
				return;
			}
			var accept = WebSocket.generateAccept(secKey);
			var sendHeaders = [
				'HTTP/1.1 101 Switching Protocols',
				'Upgrade: websocket',
				'Connection: Upgrade',
				'Sec-WebSocket-Accept: ' + accept,
				'',
				''
			];
			var buffer = new Buffer(sendHeaders.join('\r\n'), 'utf8');
			this.socket.write(buffer);
		},
		run: function(){
			this.handshake();
			this.socket.on("data", function(data){
				console.log(data.toString());
			})
		}
	};
});
/**
 * 是否是websocket请求
 * @param  {[type]}  req [description]
 * @return {Boolean}     [description]
 */
WebSocket.isWebSocket = function(request){
	"use strict";
	if (request.method !== 'GET') {
		return false;
	}
	var connection = request.headers.connection || "";
	var upgrade = request.headers.upgrade || "";
	return connection.toLowerCase().indexOf('upgrade') > -1 && upgrade.toLowerCase() === 'websocket';
};
/**
 * [generateAccept description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
WebSocket.generateAccept = function(key){
 	var sha1 = crypto.createHash('sha1');
  	sha1.update(key + GUID);
  	return sha1.digest('base64');
}
