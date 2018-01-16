/* eslint-disable no-return-await */
const debug = require('debug')('think-ratelimiter');
const Limiter = require('ratelimiter');
const ms = require('ms');

function ratelimit(opts = {}) {
  const {
    remaining = 'X-RateLimit-Remaining',
    reset = 'X-RateLimit-Reset',
    total = 'X-RateLimit-Limit'
  } = opts.headers || {};

  const actionKeys = Object.keys(opts.actions);

  return async (ctx, next) => {
    if (actionKeys.length === 0) {
      return await next();
    }

    let path = `${ctx.controller}/${ctx.action}`;
    if (ctx.module) path = `${ctx.module}/${path}`;
    if (actionKeys.indexOf(path) === -1) {
      return await next();
    }

    const opt = opts.actions[path];
    const id = opt.id ? opt.id(ctx) : ctx.ip;

    if (id === false) return await next();

    // initialize limiter
    const limiter = new Limiter(Object.assign({}, opt, { id, db: opts.db }));

    // check limit
    const limit = await thenify(limiter.get.bind(limiter));

    // check if current call is legit
    const calls = limit.remaining > 0 ? limit.remaining - 1 : 0;

    // header fields
    const headers = {
      [remaining]: calls,
      [reset]: limit.reset,
      [total]: limit.total
    };

    ctx.set(headers);

    debug('remaining %s/%s %s', remaining, limit.total, id);
    if (limit.remaining) return await next();

    const delta = (limit.reset * 1000) - Date.now() | 0;
    const after = limit.reset - (Date.now() / 1000) | 0;
    ctx.set('Retry-After', after);

    ctx.status = 429;
    ctx.body = opts.errorMessage || `Rate limit exceeded, retry in ${ms(delta, { long: true })}.`;

    if (opts.throw) {
      ctx.throw(ctx.status, ctx.body, { headers });
    }
  };
}

/**
 * Helper function to convert a callback to a Promise.
 */

async function thenify(fn) {
  return await new Promise((resolve, reject) => {
    function callback(err, res) {
      if (err) return reject(err);
      return resolve(res);
    }
    fn(callback);
  });
}

module.exports = ratelimit;
