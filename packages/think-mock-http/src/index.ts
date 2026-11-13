import http = require('http');
import helper = require('think-helper');
import querystring = require('querystring');
import stream = require('stream');
import type {Socket} from 'net';

interface RequestArgs {
  req?: unknown;
  res?: unknown;
  exitOnEnd?: unknown;
  [name: string]: unknown;
}

type ArgumentKeys<A> = A extends unknown ? keyof A : never;
type OrdinaryArgs<A> = {[K in Extract<ArgumentKeys<A>, 'req' | 'res'>]?: never};

type DefaultRequest = Omit<http.IncomingMessage, 'method' | 'httpVersion'> & {
  method: string;
  httpVersion: string;
};
type AppliedKeys<A> = Exclude<Extract<keyof A, string | number>, 'exitOnEnd'>;
type AppliedRequest<A> = A extends unknown ? Omit<DefaultRequest, AppliedKeys<A>> & Pick<A, AppliedKeys<A>> : never;

interface Exchange<R, S> {
  req: R;
  res: S;
}

interface Application<R, S, T> {
  callback(): (req: R, res: S) => T;
}

interface MockHttp {
  <A extends object>(args: A & (string extends ArgumentKeys<A> ? never : OrdinaryArgs<A>), app?: null | false): Exchange<AppliedRequest<A>, http.ServerResponse>;
  <A extends object, T>(args: A & (string extends ArgumentKeys<A> ? never : OrdinaryArgs<A>), app: Application<AppliedRequest<A>, http.ServerResponse, T>): T;
  // Strings may contain JSON with injected req/res. Injected requests are
  // shallow copies, not IncomingMessage instances. Do not promise Node shapes.
  (args: string | object, app?: null | false): Exchange<Record<string, unknown>, unknown>;
  // The caller chooses the handler's input types at this dynamic boundary.
  <T>(args: string | object, app: Application<never, never, T>): T;
}

const defaultArgs = {
  method: 'GET',
  httpVersion: '1.1'
};

// These operations preserve the original non-strict behavior on frozen or
// read-only injected values after TypeScript emits a strict CommonJS module.
function assign(target: unknown, name: string, value: unknown): void {
  Reflect.set(Object(target), name, value, target);
}

export = (function(reqArgs: string | RequestArgs, app?: Application<never, never, unknown> | null | false) {
  if (helper.isString(reqArgs)) {
    const input = reqArgs as string;
    if (input[0] === '{') {
      reqArgs = JSON.parse(input) as RequestArgs;
    } else if (/^\w+=/.test(input)) {
      reqArgs = querystring.parse(input);
    } else {
      reqArgs = {url: reqArgs};
    }
  }
  const input = reqArgs as RequestArgs;
  let req: Record<string, unknown>;
  if (input.req) {
    req = Object.assign({}, input.req);
    Reflect.deleteProperty(input, 'req');
  } else {
    // Legacy mock transport deliberately supplies a Readable, not a socket.
    req = new http.IncomingMessage(new stream.Readable() as Socket) as unknown as Record<string, unknown>;
  }
  let res: unknown;
  if (input.res) {
    res = input.res;
    Reflect.deleteProperty(input, 'res');
  } else {
    res = new http.ServerResponse(req as unknown as http.IncomingMessage);
  }

  if (input.exitOnEnd) {
    Reflect.deleteProperty(input, 'exitOnEnd');
    assign(res, 'end', (msg: unknown) => {
      process.exit();
    });
  }

  const args = Object.assign({}, defaultArgs, input);
  for (const name in args) {
    assign(req, name, args[name]);
  }

  if (!app) return {req, res};
  const fn = app.callback();
  return fn(req as never, res as never);
}) as MockHttp;
