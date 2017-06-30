const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const CONFIG_PATH = path.resolve(__dirname, '../runtime/config');

function createFile(dir, filename, content, cb) {
  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir);
  }
  let filePath = path.join(dir, filename);
  fs.openSync(filePath, 'w');
  if (content) {
    fs.writeFile(filePath, content, cb);
  }
}

function touchConfig(config = {}, cb) {
  let json = JSON.stringify(config,function(key, val) {
    if (typeof val === 'function') {
      return val + ''; // implicitly `toString` it
    }
    return val;
  })
  let content = `module.exports = ${json}`;
  createFile(CONFIG_PATH, 'config.js', content);
}

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

module.exports = {
  touchConfig,
  sleep
}

