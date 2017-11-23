import test from 'ava';
import helper from 'think-helper';
import websocket from '../index.js';

let defaultCtx = {
  req: {
    websocketData: 'websocketData',
    websocket: 'websocket'
  },
  isMethod(val) {
    return val
  },
  res: {
    statusCode: ''
  }
}


class WebSocketHandle {
  emit() {
    return 'EMIT';
  }

  broadcast() {
    return 'BROADCAST';
  }

  run() {
  }
}

let app = {
  server: '',
  think: {
    config() {
      return {
        handle: WebSocketHandle
      }
    }
  },
  on(event, cb) {
    cb();
  }
}


test('websocket', t => {
  let result = websocket(app);
  result.context = helper.extend(result.context, defaultCtx);
  result.controller.ctx = helper.extend(result.controller.ctx, result.context);

  let c1 = result.context.data === 'websocketData';
  let c11 = result.context.wsData === 'websocketData';
  let c2 = result.context.websocket === 'websocket';
  let c3 = result.context.isWebsocket === 'WEBSOCKET';
  result.context.emit();
  let c4 = result.context.res.statusCode === 200;
  result.context.res.statusCode = '';
  result.context.broadcast();
  let c5 = result.context.res.statusCode === 200
  result.context.res.statusCode = '';

  let cc1 = result.controller.data === 'websocketData';
  let cc11 = result.controller.wsData === 'websocketData';
  let cc2 = result.controller.websocket === 'websocket';
  let cc3 = result.controller.isWebsocket === 'WEBSOCKET';
  result.controller.emit();
  let cc4 = result.controller.ctx.res.statusCode === 200;
  result.controller.ctx.res.statusCode = '';
  result.controller.broadcast();
  let cc5 = result.controller.ctx.res.statusCode === 200
  result.controller.ctx.res.statusCode = '';
  let cc6 = result.controller.wsCallback;

  t.true(c1 && c11 && c2 && c3 && c4 && c5 && cc1 && cc11 && cc2 && cc3 && cc4 && cc5 && !cc6);
});
