const raw = require('raw-body');
const inflate = require('inflation');
const qs = require('querystring');

module.exports = function(ctx, opts = {}) {
  const req = ctx.req;

  // defaults
  const len = req.headers['content-length'];
  const encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') opts.length = ~~len;
  opts.encoding = opts.encoding || 'utf8';
  opts.limit = opts.limit || '1mb';

  return raw(inflate(req), opts)
    .then(str => qs.parse(str))
    .then(data => ({post: data}));
};
