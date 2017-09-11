const Metalsmith = require('metalsmith');
const path = require('path');
const os = require('os');
const helper = require('think-helper');
const utils = require('./utils');
const toString = Object.prototype.toString;
const tmpName = 'think-cli-generate';
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
      const fileName = dest[index].split('/').pop();
      const targetPath = path.join(tmpdirIn, fileName);
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
        .build(err => err ? reject(err) : resolve());
    });
  };
}

function copyOut(dest) {
  return _ => {
    if (toString.call(dest) === '[object String]') {
      return utils.copyFile(path.join(tmpdirOut, dest.split('/').pop()), dest);
    }

    if (toString.call(dest) === '[object Array]') {
      const list = dest.map(targetPath => {
        const fileName = targetPath.split('/').pop();
        const filePath = path.join(tmpdirOut, fileName);
        return utils.copyFile(filePath, targetPath);
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
