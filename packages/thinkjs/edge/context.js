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
  cookie(...args) {
    return this.jar.cookie(...args);
  }
  redirect(url, alt) {
    if (url === 'back') url = this.get('referer') || alt || '/';
    this.set('location', url);
    if (![301, 302, 303, 307, 308].includes(this.status)) this.status = 302;
    this.body = `Redirecting to ${url}`;
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
