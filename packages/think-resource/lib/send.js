'use strict';

/**
 * Send file at `path` with the
 * given `options` to the koa `ctx`.
 *
 * @param {Context} ctx
 * @param {String} path
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

var send = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, path) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var root, trailingSlash, index, maxage, hidden, format, extensions, gzip, setHeaders, encoding, list, i, ext, stats, notfound;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            assert(ctx, 'koa context required');
            assert(path, 'pathname required');

            // options
            debug('send "%s" %j', path, opts);
            root = opts.root ? normalize(resolve(opts.root)) : '';
            trailingSlash = '/' == path[path.length - 1];

            path = path.substr(parse(path).root.length);
            index = opts.index;
            maxage = opts.maxage || opts.maxAge || 0;
            hidden = opts.hidden || false;
            format = opts.format === false ? false : true;
            extensions = Array.isArray(opts.extensions) ? opts.extensions : false;
            gzip = opts.gzip === false ? false : true;
            setHeaders = opts.setHeaders;

            if (!(setHeaders && typeof setHeaders !== 'function')) {
              _context.next = 15;
              break;
            }

            throw new TypeError('option setHeaders must be function');

          case 15:
            encoding = ctx.acceptsEncodings('gzip', 'deflate', 'identity');

            // normalize path

            path = decode(path);

            if (!(-1 == path)) {
              _context.next = 19;
              break;
            }

            return _context.abrupt('return', ctx.throw(400, 'failed to decode'));

          case 19:

            // index file support
            if (index && trailingSlash) path += index;

            path = resolvePath(root, path);

            // hidden file support, ignore

            if (!(!hidden && isHidden(root, path))) {
              _context.next = 23;
              break;
            }

            return _context.abrupt('return');

          case 23:
            _context.t0 = encoding === 'gzip' && gzip;

            if (!_context.t0) {
              _context.next = 28;
              break;
            }

            _context.next = 27;
            return fs.exists(path + '.gz');

          case 27:
            _context.t0 = _context.sent;

          case 28:
            if (!_context.t0) {
              _context.next = 32;
              break;
            }

            path = path + '.gz';
            ctx.set('Content-Encoding', 'gzip');
            ctx.res.removeHeader('Content-Length');

          case 32:
            if (!(extensions && !/\..*$/.exec(path))) {
              _context.next = 48;
              break;
            }

            list = [].concat(extensions);
            i = 0;

          case 35:
            if (!(i < list.length)) {
              _context.next = 48;
              break;
            }

            ext = list[i];

            if (!(typeof ext !== 'string')) {
              _context.next = 39;
              break;
            }

            throw new TypeError('option extensions must be array of strings or false');

          case 39:
            if (!/^\./.exec(ext)) ext = '.' + ext;
            _context.next = 42;
            return fs.exists(path + ext);

          case 42:
            if (!_context.sent) {
              _context.next = 45;
              break;
            }

            path = path + ext;
            return _context.abrupt('break', 48);

          case 45:
            i++;
            _context.next = 35;
            break;

          case 48:

            // stat
            stats = void 0;
            _context.prev = 49;
            _context.next = 52;
            return fs.stat(path);

          case 52:
            stats = _context.sent;

            if (!stats.isDirectory()) {
              _context.next = 62;
              break;
            }

            if (!(format && index)) {
              _context.next = 61;
              break;
            }

            path += '/' + index;
            _context.next = 58;
            return fs.stat(path);

          case 58:
            stats = _context.sent;
            _context.next = 62;
            break;

          case 61:
            return _context.abrupt('return');

          case 62:
            _context.next = 71;
            break;

          case 64:
            _context.prev = 64;
            _context.t1 = _context['catch'](49);
            notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];

            if (!notfound.includes(_context.t1.code)) {
              _context.next = 69;
              break;
            }

            throw createError(404, _context.t1);

          case 69:
            _context.t1.status = 500;
            throw _context.t1;

          case 71:

            if (setHeaders) setHeaders(ctx.res, path, stats);

            // stream
            ctx.set('Content-Length', stats.size);
            if (!ctx.response.get('Last-Modified')) ctx.set('Last-Modified', stats.mtime.toUTCString());
            if (!ctx.response.get('Cache-Control')) ctx.set('Cache-Control', 'max-age=' + (maxage / 1000 | 0));
            ctx.type = type(path);
            ctx.body = fs.createReadStream(path);

            return _context.abrupt('return', path);

          case 78:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[49, 64]]);
  }));

  return function send(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Check if it's hidden.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Module dependencies.
 */

var debug = require('debug')('koa-send');
var resolvePath = require('resolve-path');
var createError = require('http-errors');
var assert = require('assert');
var fs = require('mz/fs');

var _require = require('path'),
    normalize = _require.normalize,
    basename = _require.basename,
    extname = _require.extname,
    resolve = _require.resolve,
    parse = _require.parse,
    sep = _require.sep;

/**
 * Expose `send()`.
 */

module.exports = send;function isHidden(root, path) {
  path = path.substr(root.length).split(sep);
  for (var i = 0; i < path.length; i++) {
    if (path[i][0] === '.') return true;
  }
  return false;
}

/**
 * File type.
 */

function type(file) {
  return extname(basename(file, '.gz'));
}

/**
 * Decode `path`.
 */

function decode(path) {
  try {
    return decodeURIComponent(path);
  } catch (err) {
    return -1;
  }
}