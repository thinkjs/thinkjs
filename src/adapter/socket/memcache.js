'use strict';

var net = require('net');
var EventEmitter = require('events').EventEmitter;

var CRLF = '\r\n'; //line break
var CRLF_LENGTH = CRLF.length;
var ERRORS = ['ERROR', 'NOT_FOUND', 'CLIENT_ERROR', 'SERVER_ERROR']; //error message
var ERRORS_LENGTH = ERRORS.length;

//read line data
function readLine(string){
  'use strict';
  var pos = string.indexOf(CRLF);
  if (pos > -1) {
    return string.substr(0, pos);
  }
  return string;
}

/**
 * memcache class
 */
module.exports = think.adapter(EventEmitter, {
  init: function(port, hostname){
    EventEmitter.call(this);
    this.port = port || 11211;
    this.hostname = hostname || '127.0.0.1';
    this.buffer = '';
    this.callbacks = []; 
    this.handle = null; 
  },
  connect: function(){
    if (this.handle) {
      return this;
    }
    var self = this;
    var deferred = Promise.defer();
    this.handle = net.createConnection(this.port, this.host);
    this.handle.on('connect', function(){
      this.setTimeout(0);
      this.setNoDelay();
      self.emit('connect');
      deferred.resolve();
    });
    this.handle.on('data', function(data){
      self.buffer += data.toString();
      self.handleData();
    });
    this.handle.on('end', function(){
      while(self.callbacks.length > 0){
        var callback = self.callbacks.shift();
        if (callback && callback.callback) {
          callback.callback('CONNECTION_CLOSED');
        }
      }
      self.handle = null;
    });
    this.handle.on('close', function(){
      self.handle = null;
      self.emit('close');
    });
    this.handle.on('timeout', function(){
      if (self.callbacks.length > 0) {
        var callback = self.callbacks.shift();
        if (callback && callback.callback) {
          callback.callback('TIMEOUT');
        }
      }
      self.emit('timeout');
    });
    this.handle.on('error', function(error){
      while(self.callbacks.length > 0){
        var callback = self.callbacks.shift();
        if (callback && callback.callback) {
          callback.callback('ERROR');
        }
      }
      self.handle = null;
      self.emit('clienterror', error);
    });
    this.promise = deferred.promise;
    return this;
  },
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
  handleError: function(buffer){
    var line = readLine(buffer);
    return [null, line.length + CRLF_LENGTH, line];
  },
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
  handleSimple: function(buffer){
    var line = readLine(buffer);
    return [line, line.length + CRLF_LENGTH, null];
  },
  handleVersion: function(buffer){
    var pos = buffer.indexOf(CRLF);
    //8 is length of 'VERSION '
    var value = buffer.substr(8, pos - 8);
    return [value, pos + CRLF_LENGTH, null];
  },
  query: function(query, type){
    this.connect();
    var self = this;
    var deferred = Promise.defer();
    var callback = function(error, value){
      return error ? deferred.reject(error) : deferred.resolve(value);
    }
    this.promise.then(function(){
      self.callbacks.push({type: type, callback: callback});
      self.handle.write(query + CRLF);
    });
    return deferred.promise;
  },
  get: function(key){
    return this.query('get ' + key, 'get');
  },
  store: function(key, value, type, lifetime, flags){
    lifetime = lifetime || 0;
    flags = flags || 0;
    var length  = Buffer.byteLength(value.toString());
    var query = [type, key, flags, lifetime, length].join(' ') + CRLF + value;
    return this.query(query, 'simple');
  },
  delete: function(key){
    return this.query('delete ' + key, 'simple');
  },
  version: function(){
    return this.query('version', 'version');
  },
  increment: function(key, step){
    step = step || 1;
    return this.query('incr ' + key + ' ' + step, 'simple');
  },
  decrement: function(key, step){
    step = step || 1;
    return this.query('decr ' + key + ' ' + step, 'simple');
  },
  close: function(){
    if (this.handle && this.handle.readyState === 'open') {
      this.handle.end();
      this.handle = null;
    }
  }
}).extend(function(){
  var result = {};
  ['set', 'add', 'replace', 'append', 'prepend'].forEach(function(item){
    result[item] = function(key, value, lifetime, flags){
      return this.store(key, value, 'set', lifetime, flags);
    }
  });
  return result;
});