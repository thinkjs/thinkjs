var WebSocket = Class(function(){
	return {
		init: function(request){
			this.request = request;
		}
	}
})
/**
 * 是否是websocket请求
 * @param  {[type]}  req [description]
 * @return {Boolean}     [description]
 */
WebSocket.isWebSocket = function(request){
	if (request.method !== 'GET') {
		return false;
	};
	var connection = request.headers.connection || "";
	var upgrade = request.headers.upgrade;
	return connection.toLowerCase().indexOf('upgrade') > -1 && upgrade.toLowerCase() === 'websocket';
}
module.exports = WebSocket;