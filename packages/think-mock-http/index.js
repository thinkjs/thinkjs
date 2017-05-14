const http = require('http');
const helper = require('think-helper');
const querystring = require('querystring');
const Readable = require('stream').Readable;
const IncomingMessage = http.IncomingMessage;
const ServerResponse = http.ServerResponse;

/**
 * default mock args
 */
const defaultArgs = {
  method: 'GET',
  httpVersion: '1.1'
}

module.exports = function(reqArgs, app){
  if(helper.isString(reqArgs)){
    if (reqArgs[0] === '{') {
      reqArgs = JSON.parse(reqArgs);
    }else if (/^\w+\=/.test(reqArgs)) {
      reqArgs = querystring.parse(reqArgs);
    }else{
      reqArgs = {url: reqArgs};
    }
  }
  const socket = new Readable();
  const req = new IncomingMessage(socket);
  const args = Object.assign({}, defaultArgs, reqArgs);
  for(let name in args){
    req[name] = args[name];
  }
  const res = new ServerResponse(req);
  if(!app) return {req, res};
  let fn = app.callback();
  return fn(req, res);
}