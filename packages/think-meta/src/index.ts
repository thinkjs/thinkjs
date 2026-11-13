import helper = require('think-helper');

/** Only the response operations used by this middleware are required. */
interface Context {
  res: {
    headersSent?: boolean;
    setTimeout(milliseconds: number, callback: () => void): unknown;
    setHeader(name: string, value: string): unknown;
  };
  method: string;
  url: string;
  status: number | string;
}

interface Application {
  think: {
    version: string;
    logger: {info(message: string): unknown};
  };
}

interface Options<C extends Context> {
  requestTimeout?: number | string;
  requestTimeoutCallback?: ((this: ResolvedOptions<C>, ctx: C, options: ResolvedOptions<C>) => void) | null | false;
  sendPowerBy?: boolean;
  sendResponseTime?: boolean;
  logRequest?: boolean;
  ignoreUrl?: string[];
}

type ResolvedOptions<C extends Context> = Omit<Options<C>, 'requestTimeout'> & {requestTimeout: number};

interface Middleware<C extends Context> {
  // Timing/logging discards successful downstream values. With both disabled,
  // the original next() promise and its fulfillment value are returned intact.
  <T>(ctx: C, next: () => Promise<T>): Promise<T | undefined>;
}

/**
 * default options
 */
const defaultOptions = {
  requestTimeout: 10 * 1000, // request timeout, default is 10s
  requestTimeoutCallback: () => {}, // request timeout callback
  sendPowerBy: true, // send powerby
  sendResponseTime: true, // send response time
  logRequest: true,
  ignoreUrl: []
};

/**
 * send meta middleware
 */
export = <C extends Context = Context>(inputOptions: Options<C> | null | undefined, app: Application): Middleware<C> => {
  // Object.assign intentionally lets explicit undefined override a default.
  const options = Object.assign({}, defaultOptions, inputOptions) as ResolvedOptions<C>;
  options.requestTimeout = helper.ms(options.requestTimeout);

  return <T>(ctx: C, next: () => Promise<T>): Promise<T | undefined> => {
    // set request timeout
    if (helper.isFunction(options.requestTimeoutCallback)) {
      ctx.res.setTimeout(options.requestTimeout, () => {
        // Re-read at invocation time: callbacks may be replaced after setup.
        (options.requestTimeoutCallback as Exclude<Options<C>['requestTimeoutCallback'], null | false | undefined>)(ctx, options);
      });
    }
    // send power by header
    if (options.sendPowerBy && !ctx.res.headersSent) {
      const version = app.think.version;
      ctx.res.setHeader('X-Powered-By', `thinkjs-${version}`);
    }
    // send response time header
    if (options.sendResponseTime || options.logRequest) {
      const startTime = Date.now();
      let err: unknown;
      return next().catch(e => {
        err = e;
      }).then(() => {
        const endTime = Date.now();
        if (options.sendResponseTime && !ctx.res.headersSent) {
          ctx.res.setHeader('X-Response-Time', `${endTime - startTime}ms`);
        }
        if (options.logRequest) {
          process.nextTick(() => {
            if (!(options.ignoreUrl as string[]).includes(ctx.url)) {
              app.think.logger.info(`${ctx.method} ${ctx.url} ${ctx.status} ${endTime - startTime}ms`);
            }
          });
        }
        if (err) return Promise.reject(err);
      });
    } else {
      return next();
    }
  };
};
