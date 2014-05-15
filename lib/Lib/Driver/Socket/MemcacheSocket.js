var net = require("net");
var EventEmitter = require("events").EventEmitter;

var CRLF = "\r\n"; //换行符
var CRLF_LENGTH = CRLF.length;
var ERRORS = ['ERROR', 'NOT_FOUND', 'CLIENT_ERROR', 'SERVER_ERROR']; //错误
var ERRORS_LENGTH = ERRORS.length;

//读取一行数据
function readLine(string){
	var pos = string.indexOf(CRLF);
	if (pos > -1) {
		return string.substr(0, pos);
	}
	return string;
}
/**
 * memcache类
 * @return {[type]} [description]
 */
module.exports = inherits(EventEmitter, function(){
	return {
		init: function(port, hostname){
			EventEmitter.call(this);
			this.port = port || 11211;
			this.hostname = hostname || "localhost";
			this.buffer = "";
			this.callbacks = []; //回调函数
			this.handle = null; //socket连接句柄
		},
		/**
		 * 建立连接
		 * @return {[type]} [description]
		 */
		connect: function(){
			if (this.handle) {
				return this;
			}
			var self = this;
			var deferred = getDefer();
			this.handle = net.createConnection(this.port, this.host);
			this.handle.on("connect", function(){
				this.setTimeout(0);
				this.setNoDelay();
				self.emit("connect");
				deferred.resolve();
			});
			this.handle.on("data", function(data){
				self.buffer += data.toString();
				self.handleData();
			});
			this.handle.on("end", function(){
				self.handle.end();
				self.handle = null;
			});
			this.handle.on("close", function(){
				self.handle = null;
				self.emit("close");
			});
			this.handle.on("timeout", function(){
				self.handle = null;
				self.emit("timeout");
			});
			this.handle.on("error", function(error){
				self.handle = null;
				self.emit("error", error);
			});
			this.promise = deferred.promise;
			return this;
		},
		/**
		 * 处理接收的数据
		 * @return {[type]} [description]
		 */
		handleData: function(){
			while(this.buffer.length > 0){
				var result = this.getHandleResult(this.buffer);
				if(result === false){
					break;
				}
				var value = result[0];
				var pos = result[1];
				var error = result[2];
				if (pos > this.buffer.length) {
					break;
				}
				this.buffer = this.buffer.substring(pos);
				var callback = this.callbacks.shift();
				if (callback && callback.callback) {
					callback.callback(error, value);
				}
			}
		},
		getHandleResult: function(buffer){
			if (buffer.indexOf(CRLF) === -1) {
				return false;
			}
			for(var i = 0; i < ERRORS_LENGTH; i++){
				var item = ERRORS[i];
				if (buffer.indexOf(item) > -1) {
					return this.handleError(buffer);
				}
			}
			var callback = this.callbacks[0];
			if (callback && callback.type) {
				return this['handle' + ucfirst(callback.type)](buffer);
			}
			return false;
		},
		/**
		 * 处理错误
		 * @param  {[type]} buffer [description]
		 * @return {[type]}        [description]
		 */
		handleError: function(buffer){
			var line = readLine(buffer);
			return [null, line.length + CRLF_LENGTH, line];
		},
		/**
		 * 处理获取数据
		 * @param  {[type]} buffer [description]
		 * @return {[type]}        [description]
		 */
		handleGet: function(buffer){
			var value = null;
			var end = 3;
			var resultLen = 0;
			var firstPos;
			if (buffer.indexOf('END') === 0) {
				return [value, end + CRLF_LENGTH];
			}else if (buffer.indexOf('VALUE') === 0 && buffer.indexOf('END') > -1) {
				firstPos = buffer.indexOf(CRLF) + CRLF_LENGTH;
				var endPos = buffer.indexOf('END');
				resultLen = endPos - firstPos - CRLF_LENGTH;
				value = buffer.substr(firstPos, resultLen);
				return [value, firstPos + parseInt(resultLen, 10) + CRLF_LENGTH + end + CRLF_LENGTH];
			}else{
				firstPos = buffer.indexOf(CRLF) + CRLF_LENGTH;
				resultLen = buffer.substr(0, firstPos).split(' ')[3];
				value = buffer.substr(firstPos, resultLen);
				return [value, firstPos + parseInt(resultLen) + CRLF_LENGTH + end + CRLF_LENGTH];
			}
		},
		/**
		 * 处理简单数据
		 * @param  {[type]} buffer [description]
		 * @return {[type]}        [description]
		 */
		handleSimple: function(buffer){
			var line = readLine(buffer);
			return [line, line.length + CRLF_LENGTH, null];
		},
		/**
		 * 版本号
		 * @param  {[type]} buffer [description]
		 * @return {[type]}        [description]
		 */
		handleVersion: function(buffer){
			var pos = buffer.indexOf(CRLF);
			//8 is length of 'VERSION '
			var value = buffer.substr(8, pos - 8);
			return [value, pos + CRLF_LENGTH, null];
		},
		/**
		 * 查询
		 * @param  {[type]}   query    [description]
		 * @param  {[type]}   type     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		query: function(query, type){
			this.connect();
			var self = this;
			var deferred = getDefer();
			var callback = function(error, value){
				return error ? deferred.reject(error) : deferred.resolve(value);
			}
			this.promise.then(function(){
				self.callbacks.push({type: type, callback: callback});
				self.handle.write(query + CRLF);
			});
			return deferred.promise;
		},
		/**
		 * 获取
		 * @param  {[type]}   key      [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		get: function(key){
			return this.query('get ' + key, 'get');
		},
		/**
		 * 存储
		 * @return {[type]} [description]
		 */
		store: function(key, value, type, lifetime, flags){
			lifetime = lifetime || 0;
			flags = flags || 0;
			var length  = Buffer.byteLength(value.toString());
			var query = [type, key, flags, lifetime, length].join(" ") + CRLF + value;
			return this.query(query, 'simple');
		},
		/**
		 * 删除
		 * @param  {[type]}   key      [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		delete: function(key){
			return this.query('delete ' + key, 'simple');
		},
		/**
		 * 获取版本号
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		version: function(){
			return this.query('version', 'version');
		},
		/**
		 * 增长
		 * @param  {[type]}   key      [description]
		 * @param  {[type]}   step     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		increment: function(key, step){
			if (typeof step === 'function') {
				callback = step;
				step = 1;
			}
			step = step || 1;
			return this.query('incr ' + key + ' ' + step, 'simple');
		},
		/**
		 * 减少
		 * @param  {[type]}   key      [description]
		 * @param  {[type]}   step     [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		decrement: function(key, step){
			step = step || 1;
			return this.query('decr ' + key + ' ' + step, 'simple');
		},
		/**
		 * 关闭
		 * @return {[type]} [description]
		 */
		close: function(){
			if (this.handle && this.handle.readyState === 'open') {
				this.handle.end();
				this.handle = null;
			}
		}
	}
}).extend(function(){
	var result = {};
	['set', 'add', 'replace', 'append', 'prepend'].forEach(function(item){
		result[item] = function(key, value, callback, lifetime, flags){
			return this.store(key, value, item, callback, lifetime, flags);
		}
	});
	return result;
});