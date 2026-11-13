import {helper} from './shared.generated.js';
import {CookieJar} from './cookies.js';

export function parameters(entries) {
  const result = Object.create(null);
  for (const [key, value] of entries) {
    result[key] = Object.hasOwn(result, key)
      ? [].concat(result[key], value)
      : value;
  }
  return result;
}

function access(store, name, value, ctx) {
  if (!name) return store;
  if (helper.isObject(name)) {
    for (const key of Object.keys(name)) {
      if (!['__proto__', 'constructor', 'prototype'].includes(key))
        store[key] = name[key];
    }
    return ctx;
  }
  if (value !== undefined) {
    if (!['__proto__', 'constructor', 'prototype'].includes(name))
      store[name] = value;
    return ctx;
  }
  if (typeof name === 'string' && name.includes(','))
    name = name.split(/\s*,\s*/);
  if (Array.isArray(name))
    return Object.fromEntries(
      name
        .filter((key) => store[key] !== undefined)
        .map((key) => [key, store[key]])
    );
  return store[name];
}

export class Context {
  constructor(app, request, env, executionContext) {
    const url = new URL(request.url);
    this.app = app;
    this.think = app.think;
    this.webRequest = request;
    this.env = env;
    this.executionContext = executionContext;
    this.state = {};
    this.method = request.method;
    this.url = url.pathname + url.search;
    this.path = url.pathname;
    this.hostname = url.hostname;
    this.protocol = url.protocol.slice(0, -1);
    this.header = Object.fromEntries(request.headers);
    this.headers = this.header;
    this.status = 404;
    this.responseHeaders = new Headers();
    this.request = {
      query: parameters(url.searchParams),
      body: {post: {}, file: {}}
    };
    this.response = {get: (name) => this.responseHeaders.get(name) || ''};
    this._params = null;
    this._post = null;
    this._file = null;
    this._body = undefined;
    this.ip = app.options.clientIP ? app.options.clientIP(request, env) : '';
    this.ips = this.ip ? [this.ip] : [];
    this.jar = new CookieJar(this, app.think.config('cookie'));
  }

  get secure() {
    return this.protocol === 'https';
  }
  get subdomains() {
    return this.hostname
      .split('.')
      .reverse()
      .slice(this.app.subdomainOffset || 2);
  }
  get body() {
    return this._body;
  }
  set body(value) {
    this._body = value;
    if (this.status === 404 && value != null) this.status = 200;
  }
  get type() {
    return this.responseHeaders.get('content-type') || '';
  }
  set type(value) {
    const types = {
      json: 'application/json',
      html: 'text/html',
      text: 'text/plain',
      txt: 'text/plain',
      js: 'application/javascript'
    };
    this.set('content-type', types[value] || value);
  }
  get userAgent() {
    return this.header['user-agent'];
  }
  get isGet() {
    return this.method === 'GET';
  }
  get isPost() {
    return this.method === 'POST';
  }
  get isCli() {
    return false;
  }
  isMethod(method) {
    return this.method === method.toUpperCase();
  }
  isAjax(method) {
    return (
      (!method || this.isMethod(method)) &&
      this.header['x-requested-with'] === 'XMLHttpRequest'
    );
  }
  get(name) {
    return this.webRequest.headers.get(name) || '';
  }
  set(name, value) {
    if (typeof name === 'object') {
      for (const [key, val] of Object.entries(name)) this.set(key, val);
    } else {
      this.responseHeaders.delete(name);
      for (const val of [].concat(value))
        this.responseHeaders.append(name, String(val));
    }
  }
  append(name, value) {
    this.responseHeaders.append(name, value);
  }
  remove(name) {
    this.responseHeaders.delete(name);
  }
  throw(status, message) {
    throw Object.assign(new Error(message || String(status)), {status});
  }
  assert(value, status, message) {
    if (!value) this.throw(status, message);
  }
  config(name, value, module = this.module) {
    return this.think.config(name, value, module);
  }
  param(name, value) {
    if (!this._params) {
      this._params = Object.assign(Object.create(null), this.request.query);
      this.app.emit('filterParam', this._params);
    }
    return access(this._params, name, value, this);
  }
  post(name, value) {
    if (!this._post) {
      this._post = Array.isArray(this.request.body.post)
        ? [...this.request.body.post]
        : Object.assign(Object.create(null), this.request.body.post);
      this.app.emit('filterParam', this._post);
    }
    return access(this._post, name, value, this);
  }
  file(name, value) {
    this._file ||= Object.assign(Object.create(null), this.request.body.file);
    return access(this._file, name, value, this);
  }
  cookie(...args) {
    return this.jar.cookie(...args);
  }
  json(value) {
    this.type = this.config('jsonContentType');
    this.body = value;
    return false;
  }
  success(data = '', message = '') {
    return this.json({
      [this.config('errnoField')]: 0,
      [this.config('errmsgField')]: message,
      data
    });
  }
  fail(errno, errmsg = '', data = '') {
    if (helper.isObject(errno)) return this.json(errno);
    const mapped = this.app.validators.messages?.[errno];
    if (Array.isArray(mapped)) [errno, errmsg] = mapped;
    if (typeof errno !== 'number')
      [data, errmsg, errno] = [errmsg, errno, this.config('defaultErrno')];
    const result = {
      [this.config('errnoField')]: errno,
      [this.config('errmsgField')]: errmsg
    };
    if (data) result.data = data;
    return this.json(result);
  }
  redirect(url, alt) {
    if (url === 'back') url = this.get('referer') || alt || '/';
    this.set('location', url);
    if (![301, 302, 303, 307, 308].includes(this.status)) this.status = 302;
    this.body = `Redirecting to ${url}`;
  }
  referer(onlyHost) {
    const value = this.header.referer;
    if (!onlyHost) return value;
    try {
      return new URL(value).hostname;
    } catch {
      return undefined;
    }
  }
  referrer(onlyHost) {
    return this.referer(onlyHost);
  }
  isJsonp(field = this.config('jsonpCallbackField')) {
    return Boolean(this.param(field));
  }
  jsonp(data, field = this.config('jsonpCallbackField')) {
    const callback = String(this.param(field) || '').replace(/[^\w.]/g, '');
    this.type = this.config('jsonpContentType');
    this.body = callback ? `${callback}(${JSON.stringify(data)})` : data;
    return false;
  }
  expires(time) {
    const duration = helper.ms(time);
    this.set('cache-control', `max-age=${duration}`);
    this.set('expires', new Date(Date.now() + duration).toUTCString());
  }
  service(...args) {
    return this.think.service(...args);
  }
  waitUntil(promise) {
    if (!this.executionContext?.waitUntil)
      throw new Error('waitUntil is unavailable in this runtime');
    this.executionContext.waitUntil(promise);
  }
  download() {
    throw new Error(
      'Edge download requires a Web stream response; filesystem paths are unsupported'
    );
  }

  async prepare() {
    await this.jar.prepare();
    const request = this.webRequest;
    if (!request.body) return;
    const limit = this.app.options.bodyLimit ?? 1024 * 1024;
    const reader = request.body.getReader();
    const chunks = [];
    let total = 0;
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > limit) {
          await reader.cancel();
          this.throw(413, 'Request body too large');
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    const contentType = request.headers.get('content-type') || '';
    const text = new TextDecoder().decode(bytes);
    this.request.rawBody = text;
    try {
      if (/^application\/(?:[\w.-]+\+)?json\b/i.test(contentType)) {
        this.request.body.post = text ? JSON.parse(text) : {};
      } else if (/^application\/x-www-form-urlencoded\b/i.test(contentType)) {
        this.request.body.post = parameters(new URLSearchParams(text));
      } else if (/^multipart\/form-data\b/i.test(contentType)) {
        const form = await new Response(bytes, {
          headers: {'content-type': contentType}
        }).formData();
        this.request.body.post = parameters(
          [...form].filter(([, value]) => typeof value === 'string')
        );
        this.request.body.file = parameters(
          [...form].filter(([, value]) => typeof value !== 'string')
        );
      } else {
        this.request.body.post = {text};
      }
    } catch {
      this.throw(400, 'Malformed request body');
    }
  }

  async toResponse() {
    let body = this.body;
    if (body && typeof body.pipe === 'function')
      throw new Error('Node.js streams are unsupported; use ReadableStream');
    if (
      body != null &&
      typeof body === 'object' &&
      !(body instanceof ReadableStream) &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      !ArrayBuffer.isView(body)
    ) {
      body = JSON.stringify(body);
      if (!this.type) this.type = 'application/json';
    } else if (typeof body === 'string' && !this.type) {
      this.type = 'text/plain; charset=utf-8';
    }
    if (body == null && this.status === 404) body = 'Not Found';
    if (body == null && this.status === 200) this.status = 204;
    if (this.method === 'HEAD' || [204, 205, 304].includes(this.status)) {
      if (body instanceof ReadableStream) await body.cancel();
      body = null;
    }
    if ([204, 205, 304].includes(this.status)) {
      this.remove('content-type');
      this.remove('content-length');
      this.remove('transfer-encoding');
    }
    await this.jar.flush(this.responseHeaders);
    return new Response(body, {
      status: this.status,
      headers: this.responseHeaders
    });
  }
}
