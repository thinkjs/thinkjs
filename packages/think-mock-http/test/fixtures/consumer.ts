import mockHttp = require('think-mock-http');
import root = require('think-mock-http/index');
import deep = require('think-mock-http/lib/index');
import interop from 'think-mock-http';
import {IncomingMessage, ServerResponse} from 'http';

interface UserArgs {url: string; method: string}
const namedArgs: UserArgs = {url: '/named', method: 'PATCH'};
const named: string = mockHttp(namedArgs).req.url;
const openBag: Record<string, unknown> = {req: {}, res: true};
const unknownResponse = mockHttp(openBag).res;
const symbol = Symbol('ignored');
const symbolResult = mockHttp({[symbol]: 42});
declare const unionArgs: {url: string} | {url: string; res: true};
const unionResult = mockHttp(unionArgs);
const normal = mockHttp({url: '/typed', method: 'POST', custom: 42});
const url: string = normal.req.url;
const method: string = normal.req.method;
const version: string = normal.req.httpVersion;
const custom: number = normal.req.custom;
const response: ServerResponse = normal.res;
const replaced = mockHttp({url: 42, method: undefined, headers: {test: 'yes'}});
const numericUrl: number = replaced.req.url;
const noMethod: undefined = replaced.req.method;
const header: string = replaced.req.headers.test;
const overrideResult: number = mockHttp({url: 42}, {callback: () => req => req.url});
const ordinaryResult: number = mockHttp({url: '/callback'}, {callback() {
  return (req, res) => { const url: string | undefined = req.url; res.setHeader('x-test', url || ''); return 42; };
}});
const token = {ok: true};
const app = {callback() { return (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('x-test', req.url || ''); return token;
}; }};
const exact: typeof token = mockHttp('/app', app);
const asyncResult: Promise<number> = mockHttp({req: {}, res: {}}, {callback: () => () => Promise.resolve(42)});
const json = mockHttp('{"req":{"url":1},"res":true}');
const untrusted: unknown = json.res;
const copied = mockHttp({req: new IncomingMessage(null as never), res: {custom: 42}});
const copiedUrl: unknown = copied.req.url;
const optional: {url: string; req?: object} = {url: '/optional'};
const dynamic = mockHttp(optional);
const plain = root({url: '/root'});
const generated = deep({url: '/deep'});
const imported = interop({url: '/interop'});
const maybeAbsent = mockHttp({url: '/none'}, false);
void [overrideResult, named, unknownResponse, symbolResult, url, method, version, custom, response, numericUrl, noMethod, header, ordinaryResult, exact,
  asyncResult, untrusted, copiedUrl, plain, generated, imported, maybeAbsent];

// @ts-expect-error: one union member injects a non-Node response.
const unsafeUnion: ServerResponse = unionResult.res;
// @ts-expect-error: dynamic bags can inject arbitrary responses.
const unsafeOpenBag: ServerResponse = unknownResponse;
// @ts-expect-error: the for-in copy omits symbols.
const missingSymbol: number = symbolResult.req[symbol];
// @ts-expect-error: overridden url remains a number, not the Node base string.
const wrongUrl: string = replaced.req.url;
// @ts-expect-error: JSON can inject a non-Node response.
const unsafeResponse: ServerResponse = json.res;
// @ts-expect-error: injected request loses its Node prototype.
copied.req.setTimeout(1);
// @ts-expect-error: an optional injected request cannot promise Node methods.
dynamic.req.setTimeout(1);
// @ts-expect-error: arguments are required.
mockHttp();
// @ts-expect-error: raw numbers are outside the supported input contract.
mockHttp(42);
// @ts-expect-error: callback must return a request handler.
mockHttp('/', {callback: () => 42});
// @ts-expect-error: callback return types are preserved.
const wrongReturn: string = mockHttp('/', {callback: () => () => 42});
// @ts-expect-error: constructor use is runtime legacy behavior, not the documented TS API.
new mockHttp('/constructor');
void [unsafeUnion, unsafeOpenBag, missingSymbol, wrongUrl, unsafeResponse, wrongReturn];
