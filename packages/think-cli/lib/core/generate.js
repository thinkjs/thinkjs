const Metalsmith = require('metalsmith');
const path = require('path');
const os = require('os');
const helper = require('think-helper');
const utils = require('../utils');
const renderRaw = require('consolidate').handlebars.render;
const render = helper.promisify(renderRaw, renderRaw);
const toString = Object.prototype.toString;
const tmpName = 'think-cli-generate';
const logger = require('../logger.js');
const tmpdir = path.join(os.tmpdir(), tmpName);
const tmpdirIn = path.join(tmpdir, 'in');
const tmpdirOut = path.join(tmpdir, 'out');

ensurePathExist(tmpdirIn);
ensurePathExist(tmpdirOut);

module.exports = function(src, dest) {
  return copyIn(src, dest)
    .then(generate(tmpdirIn, tmpdirOut))
    .then(copyOut(dest));
};

function copyIn(src, dest) {
  if (toString.call(src) === '[object String]') {
    return Promise.resolve(utils.copyFile(src, path.join(tmpdirIn, dest.split('/').pop())));
  }
  if (toString.call(src) === '[object Array]') {
    const list = src.map((filePath, index) => {
      const targetPath = path.join(tmpdirIn, dest[index]);
      return utils.copyFile(filePath, targetPath);
    });
    return Promise.all(list);
  }
}

function generate(src, dest) {
  return path => {
    return new Promise((resolve, reject) => {
      Metalsmith(src)
        .source('.')
        .destination(dest)
        .use(template)
        .build(err => err ? reject(err) : resolve());
    });
  };
}

function template(files, metalsmith, done) {
  const thinkjsInfo = require(path.join(path.resolve('./'), 'package.json')).thinkjs;
  const metadata = thinkjsInfo.metadata;
  const promises = Object.keys(files).map(file => {
    const str = files[file].contents.toString();
    return render(str, Object.assign(metadata, {rootPath: process.cwd()}))
      .then(res => {
        files[file].contents = Buffer.from(res);
      })
      .catch(e => {
        logger.error('"%s" file render failed. message: %s', file, e.message);
      });
  });

  Promise.all(promises).then(() => {
    done(null);
  }, done);
}

function copyOut(dest) {
  return _ => {
    if (toString.call(dest) === '[object String]') {
      return utils.copyFile(path.join(tmpdirOut, dest.split('/').pop()), path.join(path.resolve('./'), dest));
    }

    if (toString.call(dest) === '[object Array]') {
      const list = dest.map(targetPath => {
        const filePath = path.join(tmpdirOut, targetPath);
        return utils.copyFile(filePath, path.join(path.resolve('./'), targetPath));
      });
      return Promise.all(list);
    }
  };
}

function ensurePathExist(path) {
  if (!helper.isExist(path)) {
    helper.mkdir(path);
  }
}
