const encoder = new TextEncoder();

async function signature(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {name: 'HMAC', hash: 'SHA-1'},
    false,
    ['sign', 'verify']
  );
  const bytes = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  );
  return btoa(String.fromCharCode(...bytes))
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/=+$/, '');
}

function equal(a, b) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < a.length; i++)
    diff |= a.charCodeAt(i) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export class CookieJar {
  constructor(ctx, defaults = {}) {
    this.ctx = ctx;
    this.defaults = defaults;
    this.values = Object.create(null);
    this.verified = new Map();
    this.pending = new Map();
    for (const part of (ctx.webRequest.headers.get('cookie') || '').split(
      /;\s*/
    )) {
      const pos = part.indexOf('=');
      if (pos > 0 && !Object.hasOwn(this.values, part.slice(0, pos))) {
        this.values[part.slice(0, pos)] = part.slice(pos + 1);
      }
    }
  }

  async prepare() {
    const keys = this.defaults.keys || [];
    for (const name of Object.keys(this.values)) {
      if (name.endsWith('.sig')) continue;
      const sig = this.values[`${name}.sig`];
      if (!sig) continue;
      for (let i = 0; i < keys.length; i++) {
        if (
          equal(await signature(`${name}=${this.values[name]}`, keys[i]), sig)
        ) {
          this.verified.set(name, this.values[name]);
          if (i > 0)
            this.pending.set(`${name}.sig`, {
              value: await signature(`${name}=${this.values[name]}`, keys[0]),
              options: {...this.defaults, signed: false}
            });
          break;
        }
      }
      if (!this.verified.has(name))
        this.pending.set(`${name}.sig`, {
          value: null,
          options: {...this.defaults, signed: false}
        });
    }
  }

  cookie(name, value, options = {}) {
    if (!name || !/^[!#$%&'*+\-.^_`|~\da-zA-Z]+$/.test(name))
      throw new TypeError('Invalid cookie name');
    if (options.keys && options.keys !== this.defaults.keys)
      throw new Error(
        'Edge cookie keys must be configured before request preparation'
      );
    options = {...this.defaults, ...options};
    const signed = options.signed ?? Boolean(options.keys?.length);
    if (signed && !options.keys?.length)
      throw new Error('Signed cookies require cookie.keys');
    if (value === undefined) {
      if (this.pending.has(name))
        return this.pending.get(name).value ?? undefined;
      return signed ? this.verified.get(name) : this.values[name];
    }
    if (
      value !== null &&
      (typeof value !== 'string' || /[^\u0021-\u003A\u003C-\u007E]/.test(value))
    )
      throw new TypeError('Invalid cookie value');
    if (options.secure && !this.ctx.secure)
      throw new Error('Cannot send secure cookie over insecure connection');
    this.pending.set(name, {value, options: {...options, signed}});
  }

  async flush(headers) {
    const append = (name, value, options) => {
      let result = `${name}=${value ?? ''}`;
      const path = options.path ?? '/';
      for (const item of [path, options.domain]) {
        if (
          item != null &&
          [...String(item)].some(
            (char) =>
              char === ';' ||
              char.charCodeAt(0) < 32 ||
              char.charCodeAt(0) === 127
          )
        )
          throw new TypeError('Invalid cookie attribute');
      }
      if (path) result += `; path=${path}`;
      if (options.domain) result += `; domain=${options.domain}`;
      const expires =
        value === null
          ? new Date(0)
          : options.maxAge != null
            ? new Date(Date.now() + options.maxAge)
            : options.expires;
      if (expires) result += `; expires=${new Date(expires).toUTCString()}`;
      if (options.httpOnly !== false) result += '; httponly';
      if (options.secure ?? this.ctx.secure) result += '; secure';
      if (options.sameSite) {
        const sameSite =
          options.sameSite === true
            ? 'strict'
            : String(options.sameSite).toLowerCase();
        if (!['strict', 'lax', 'none'].includes(sameSite))
          throw new TypeError('Invalid sameSite');
        result += `; samesite=${sameSite}`;
      }
      headers.append('Set-Cookie', result);
    };
    for (const [name, {value, options}] of this.pending) {
      append(name, value, options);
      if (options.signed)
        append(
          `${name}.sig`,
          value === null
            ? null
            : await signature(`${name}=${value}`, options.keys[0]),
          options
        );
    }
  }
}
