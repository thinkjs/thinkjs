import meta = require('think-meta');
import root = require('think-meta/index.js');
import compiled = require('think-meta/lib/index.js');
import defaultImport from 'think-meta';

const ctx = {
  res: {headersSent: false, setHeader(name: string, value: string) { return this; },
    setTimeout(milliseconds: number, callback: () => void) { return this; }},
  method: 'GET', url: '/', status: 200
};
const app = {think: {version: '4.0.0', logger: {info(message: string) {}}}};
const next = () => Promise.resolve(42);
const options: Parameters<typeof meta>[0] = {
  requestTimeout: '2s', sendPowerBy: true, sendResponseTime: false, logRequest: true,
  ignoreUrl: ['/health'], requestTimeoutCallback(request, resolved) {
    const timeout: number = resolved.requestTimeout;
    const receiverTimeout: number = this.requestTimeout;
    request.res.setHeader('X-Timeout', String(timeout));
    resolved.requestTimeoutCallback = null;
    // @ts-expect-error Callback receives normalized numeric milliseconds.
    const unsafe: string = resolved.requestTimeout;
    void receiverTimeout; void unsafe;
  }
};
const result: Promise<number | undefined> = meta(options, app)(ctx, next);
meta(null, app)(ctx, next); meta(undefined, app)(ctx, next);
meta({requestTimeoutCallback: false}, app)(ctx, next);
root({}, app)(ctx, next); compiled({}, app)(ctx, next); defaultImport({}, app)(ctx, next);
const extended = {...ctx, user: {id: 1}};
const specialized = meta({requestTimeoutCallback(request: typeof extended) {
  const id: number = request.user.id; void id;
}}, app);
specialized(extended, next);
const koaCompatible: (request: typeof ctx, next: () => Promise<unknown>) => Promise<unknown> = meta({}, app);
const typeOnly: ReturnType<typeof meta> = meta({}, app);
// @ts-expect-error The factory is an arrow, not a constructor.
new meta({}, app);
// @ts-expect-error The middleware is also an arrow, not a constructor.
new typeOnly(ctx, next);
// @ts-expect-error Timing may discard the downstream value.
const unsafeResult: Promise<number> = meta({}, app)(ctx, next);
// @ts-expect-error Downstream must supply a promise in the supported contract.
meta({}, app)(ctx, () => 42);
// @ts-expect-error Requires a ThinkJS application interface.
meta({}, {});
// @ts-expect-error Requires a response with timeout/header operations.
meta({}, app)({method: 'GET', url: '/', status: 200}, next);
// @ts-expect-error A callback is a function, null or false, not a string.
meta({requestTimeoutCallback: 'bad'}, app);
// @ts-expect-error Timeouts are numbers or duration strings.
meta({requestTimeout: {}}, app);
// @ts-expect-error Ignore list entries are URL strings.
meta({ignoreUrl: [true]}, app);
// @ts-expect-error Boolean flags do not accept strings.
meta({logRequest: 'yes'}, app);
// @ts-expect-error Specialized callbacks require the context they access.
specialized(ctx, next);
void result; void koaCompatible; void unsafeResult;
