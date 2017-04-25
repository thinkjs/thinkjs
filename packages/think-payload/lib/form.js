const raw = require('raw-body');
const inflate = require('inflation');
const qs = require('querystring');

exports.before = function (ctx, opts = {}) {
  const req = ctx.req;

  // defaults
  var len = req.headers['content-length'];
  var encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') opts.length = ~~len;
  opts.encoding = opts.encoding || 'utf8';
  opts.limit = opts.limit || '1mb';

  return raw(inflate(req), opts).then(str => qs.parse(str));
};