const raw = require('raw-body');
const inflate = require('inflation');

module.exports = function(ctx, opts = {}) {
  const req = ctx.req;

  // defaults
  const len = req.headers['content-length'];
  const encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') opts.length = ~~len;
  opts.encoding = opts.encoding || 'utf8';
  opts.limit = opts.limit || '1mb';

  return raw(inflate(req), opts);
};
