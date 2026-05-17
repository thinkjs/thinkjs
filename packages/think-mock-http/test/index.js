const test = require('ava');
const mock = require('mock-require');
const http = require('http');
const IncomingMessage = http.IncomingMessage;
const ServerResponse = http.ServerResponse;

function getMockHttp() {
  return mock.reRequire('../index');
}

test('test case', t => {
  let mockHttp = getMockHttp();
  let request = null , response = null;
  let app = {
    callback:()=>{
      return (req,res)=>{
        request = req;
        response = res;
      }
    }
  };
  mockHttp(JSON.stringify({url:'./test'}),app);

  t.is(request instanceof IncomingMessage,true);
  t.is(request.url,'./test');
  t.is(response instanceof ServerResponse,true);
});

test('test case', t => {
  let mockHttp = getMockHttp();
  let request = null , response = null;
  let app = {
    callback:()=>{
      return (req,res)=>{
        request = req;
        response = res;
      }
    }
  };
  mockHttp('url=./test',app);

  t.is(request instanceof IncomingMessage,true);
  t.is(request.url,'./test');
  t.is(response instanceof ServerResponse,true);
});

test('test case', t => {
  let mockHttp = getMockHttp();
  let request = null , response = null;
  let app = {
    callback:()=>{
      return (req,res)=>{
        request = req;
        response = res;
      }
    }
  };
  mockHttp('./test',app);

  t.is(request instanceof IncomingMessage,true);
  t.is(request.url,'./test');
  t.is(response instanceof ServerResponse,true);
});

test('test case', t => {
  let mockHttp = getMockHttp();
  let request = null , response = null;
  let app = {
    callback:()=>{
      return (req,res)=>{
        request = req;
        response = res;
      }
    }
  };
  mockHttp({url:'./test'},app);

  t.is(request instanceof IncomingMessage,true);
  t.is(request.url,'./test');
  t.is(response instanceof ServerResponse,true);
});

test('test case', t => {
  let mockHttp = getMockHttp();
  let {req,res} = mockHttp('./test');
  t.is(req instanceof IncomingMessage,true);
  t.is(req.url,'./test');
  t.is(res instanceof ServerResponse,true);
});