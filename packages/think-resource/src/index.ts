import createDebug = require('debug');
const debug = createDebug('think-resource');
import path = require('path');
const resolve = path.resolve;
import assert = require('assert');
import helper = require('think-helper');
import send = require('koa-send');

/** Structural Node response surface used by the header hook. */
interface Response {
  setHeader(name: string, value: string | number | readonly string[]): unknown;
  getHeader(name: string): string | number | string[] | undefined;
  removeHeader(name: string): void;
}

/** Structural fs.Stats surface useful for custom cache headers. */
interface FileStats {
  size: number;
  mtime: Date;
  ctime: Date;
  atime: Date;
  birthtime: Date;
  mode: number;
  isFile(): boolean;
  isDirectory(): boolean;
}

// The hook deliberately accepts explicitly annotated Node response/Stats
// callbacks without requiring ambient Node declarations for every consumer.
// Method bivariance permits richer callback annotations; custom extra fields
// are not guaranteed by the structural contract.
type HeaderHook = {invoke(response: Response, path: string, stats: FileStats): void}['invoke'];

interface Options {
  root: string;
  publicPath?: string | RegExp;
  index?: string | false;
  hidden?: boolean;
  format?: boolean;
  gzip?: boolean;
  extensions?: string[] | false;
  maxage?: number;
  maxAge?: number;
  setHeaders?: HeaderHook | false;
  notFoundNext?: boolean;
}

/** The Koa context operations used by koa-send 3.3.0. */
interface Context {
  path: string;
  method: string;
  acceptsEncodings(...encodings: string[]): string | false;
  throw(message: string, status: number): never;
  set(field: string, value: string | number | string[]): unknown;
  res: Response;
  response: {get(field: string): string};
  type: string;
  body: unknown;
}

type Resolved<T> = T extends PromiseLike<infer Value> ? Value : T;

interface Middleware {
  // Unmatched requests return next() unchanged. Matched requests use send's
  // promise, discard its filename, and optionally adopt the downstream value.
  <T>(ctx: Context, next: () => T): T | Promise<Resolved<T> | undefined>;
}

interface Factory {
  (options: Options): Middleware;
  new (options: Options): Middleware;
}

const defaultOptions = {
  root: '',
  publicPath: '/',
  index: 'index.html',
  hidden: false,
  format: true,
  gzip: false,
  extensions: false,
  maxage: 0,
  setHeaders: false,
  notFoundNext: false
};

const prefixPath = <T extends string | RegExp>(path: T): T | string => {
  if (helper.isString(path) && !(path as string).startsWith('/')) {
    path = ('/' + path) as T;
  }
  return path;
};

const matchRoute = (path: string, route: string | RegExp | undefined) => {
  if (helper.isRegExp(route)) {
    return path.match(route as RegExp);
  }
  if (helper.isString(route)) {
    const routeParts = (route as string).split('/');
    const pathParts = path.split(/\/+/);
    return routeParts.every((item, index) => {
      if (!item || item === pathParts[ index ]) {
        return true;
      }
    });
  }
};

export = function(options: Options): Middleware {
  // Keep helper.extend's recursive merge, inherited keys and getter read order.
  // Its legacy declaration is broad; the assertion is a local build boundary.
  options = helper.extend({}, defaultOptions, options || {}) as Options;

  const root = options.root;
  assert(root, 'root directory is required to serve files');
  debug('static "%s" %j', root, options);
  options.root = resolve(root);

  const publicPath = options.publicPath;
  assert(helper.isRegExp(publicPath) || helper.isString(publicPath), 'publicPath must be regexp or string');
  options.publicPath = prefixPath(publicPath as string | RegExp);

  const notFoundNext = options.notFoundNext;

  return function serve<T>(ctx: Context, next: () => T) {
    if (matchRoute(ctx.path, options.publicPath) && (ctx.method === 'HEAD' || ctx.method === 'GET')) {
      return send(ctx, prefixPath(ctx.path), options).then(done => {
        if (!done && notFoundNext) {
          return next();
        }
      }) as Promise<Resolved<T> | undefined>;
    }
    return next();
  };
} as Factory;
