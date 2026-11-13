import qs = require('qs');

interface Options {
  query?: boolean;
  post?: boolean;
}

interface Context {
  request: {
    querystring?: string;
    _query?: unknown;
    body?: unknown;
  };
}

interface Middleware {
  // Do not wrap or await next(): its return value and thrown errors are preserved.
  <T>(ctx: Context, next: () => T): T;
}

const defaultOptions = {
  query: true,
  post: true
};

// Generic options accept interface-typed qs settings without requiring an
// index signature. qs owns the remaining options and custom decoder results.
export = <T extends object>(options?: T & Options | null): Middleware => {
  const settings = Object.assign({}, defaultOptions, options);
  return (ctx, next) => {
    if (settings.query) {
      const querystring = ctx.request.querystring;
      const obj = qs.parse(querystring, settings);
      // Legacy CommonJS assignments fail silently on read-only properties.
      // Boxing plus the original receiver also preserves primitive receivers.
      const request = ctx.request;
      // A getter/decoder can change the request between the read and write.
      // Do not turn a nullish assignment target into an empty boxed object.
      Reflect.set(request == null ? request : Object(request), '_query', obj, request);
    }
    // The payload is a dynamic framework boundary, not an assertion that every
    // body is an object. Keep the original truthiness/property-read behavior.
    const body = ctx.request.body as {post?: unknown} | null | undefined;
    if (settings.post && body && body.post) {
      const flag = Object.keys(body.post).some(item => {
        return item.indexOf('[') > -1 && item.indexOf(']') > -1;
      });
      if (!flag) return next();
      const obj = qs.parse(qs.stringify(body.post), settings);
      Reflect.set(Object(body), 'post', obj, body);
    }
    return next();
  };
};
