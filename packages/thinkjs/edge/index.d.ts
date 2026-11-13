export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}
export interface EdgeOptions {
  env?: string;
  bodyLimit?: number;
  clientIP?: (request: Request, env: Record<string, unknown>) => string;
  logger?: {error(error: unknown): void};
}
export type Middleware = (ctx: EdgeContext, next: () => Promise<void>) => unknown;
export interface MiddlewareDescriptor {
  handle: string | ((options: Record<string, unknown>, app: EdgeApplication) => Middleware);
  options?: Record<string, unknown> | (() => Promise<Record<string, unknown>>);
  enable?: boolean;
  match?: string | RegExp | ((ctx: EdgeContext) => boolean);
  ignore?: string | RegExp | ((ctx: EdgeContext) => boolean);
}
export interface EdgeManifest {
  modules?: string[];
  controllers?: Record<string, typeof Controller | Record<string, typeof Controller>>;
  logics?: Record<string, typeof Logic | Record<string, typeof Logic>>;
  services?: Record<string, unknown>;
  config?: Record<string, unknown>;
  routers?: unknown[] | Record<string, unknown>;
  validators?: {rules?: Record<string, Function>; messages?: Record<string, unknown>};
  middleware?: Record<string, (options: Record<string, unknown>, app: EdgeApplication) => Middleware>;
  middlewares?: Array<string | Middleware | MiddlewareDescriptor>;
  extensions?: Record<string, object>;
  bootstrap?: Array<() => unknown | Promise<unknown>>;
}
export interface CookieOptions {
  keys?: string[];
  signed?: boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'strict' | 'lax' | 'none';
}
export interface EdgeContext {
  app: EdgeApplication;
  think: typeof think;
  webRequest: Request;
  env: Record<string, unknown>;
  executionContext?: ExecutionContext;
  state: Record<string, unknown>;
  module: string;
  controller: string;
  action: string;
  method: string;
  path: string;
  url: string;
  ip: string;
  ips: string[];
  secure: boolean;
  status: number;
  type: string;
  body: unknown;
  request: {query: Record<string, unknown>; body: {post: unknown; file: Record<string, File | File[]>}; rawBody?: string};
  header: Record<string, string>;
  param(name?: string | string[] | Record<string, unknown>, value?: unknown): any;
  post(name?: string | string[] | Record<string, unknown>, value?: unknown): any;
  file(name: string): File | File[] | undefined;
  file(): Record<string, File | File[]>;
  get(name: string): string;
  set(name: string | Record<string, string | string[]>, value?: string | string[]): void;
  cookie(name: string, value?: string | null, options?: CookieOptions): string | undefined | void;
  config(name?: string, value?: unknown, module?: string): any;
  json(value: unknown): false;
  success(data?: unknown, message?: string): false;
  fail(errno: unknown, errmsg?: unknown, data?: unknown): false;
  throw(status: number, message?: string): never;
  redirect(url: string, alt?: string): void;
  waitUntil(promise: Promise<unknown>): void;
  service(name: string, ...args: unknown[]): any;
}
export class Controller {
  constructor(ctx: EdgeContext);
  ctx: EdgeContext;
  body: unknown;
  status: number;
  type: string;
  method: string;
  get(name?: string | string[] | Record<string, unknown>, value?: unknown): any;
  query(name?: string | string[], value?: unknown): any;
  post(name?: string | string[] | Record<string, unknown>, value?: unknown): any;
  file(name: string): File | File[] | undefined;
  file(): Record<string, File | File[]>;
  header(name: string | Record<string, string>, value?: string): string | void;
  cookie(name: string, value?: string | null, options?: CookieOptions): string | void;
  config(name?: string, value?: unknown, module?: string): any;
  json(value: unknown): false;
  success(data?: unknown, message?: string): false;
  fail(errno: unknown, errmsg?: unknown, data?: unknown): false;
  redirect(url: string, alt?: string): false;
  service(name: string, ...args: unknown[]): any;
  controller(name: string, module?: string): Controller;
  action(controller: string | Controller, action: string, module?: string): Promise<unknown>;
}
export class Logic extends Controller {
  rules: Record<string, unknown>;
  scope: Record<string, unknown>;
  allowMethods: string | string[];
  validateErrors: Record<string, unknown>;
  validate(rules: Record<string, unknown>, messages?: Record<string, unknown>): boolean;
}
export class Service {}
export interface EdgeApplication {
  fetch(request: Request, env?: Record<string, unknown>, context?: ExecutionContext): Promise<Response>;
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): void;
  think: typeof think;
  env: string;
}
export const think: {
  Controller: typeof Controller;
  Logic: typeof Logic;
  Service: typeof Service;
  app: EdgeApplication;
  env: string;
  config(name?: string, value?: unknown, module?: string): any;
  beforeStartServer(fn: () => unknown | Promise<unknown>): void;
  service(name: string, ...args: unknown[]): any;
};
export function installGlobal(): typeof think;
export function createApp(manifest?: EdgeManifest, options?: EdgeOptions): EdgeApplication;
