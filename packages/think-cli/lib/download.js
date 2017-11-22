const downloadRaw = require('download-git-repo');
const helper = require('think-helper');
const download = helper.promisify(downloadRaw, downloadRaw);
const ora = require('ora');
const logger = require('./logger.js');

const DOWNLOAD = Symbol('think-cli#download');
const ENSURE_CACHE_PATH = Symbol('think-cli#ensureCachePath');

class Download {
  download(template, cachePath, clone) {
    const spinner = ora({text: 'downloading template...', spinner: 'arrow3'}).start();
    return this[ENSURE_CACHE_PATH](cachePath)
      .then(this[DOWNLOAD](template, cachePath, clone))
      .then(_ => {
        spinner.stop();
        return cachePath;
      })
      .catch(err => {
        spinner.stop();
        logger.error(err);
      });
  }

  [ENSURE_CACHE_PATH](path) {
    return helper.isExist(path)
      ? helper.rmdir(path)
      : Promise.resolve();
  }

  [DOWNLOAD](template, target, clone) {
    return _ => download(template, target, {clone});
  }
}

module.exports = Download;
