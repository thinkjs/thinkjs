const path = require('path');
const ora = require('ora');
const helper = require('think-helper');
const utils = require('./utils');
const downloadRaw = require('download-git-repo');
const download = helper.promisify(downloadRaw, downloadRaw);
const generate = require('./core/generate');

const DOWNLOAD = Symbol('think-cli#download');
const GENERATE = Symbol('think-cli#generate');
const DOWNLOAD_AND_GENERATE = Symbol('think-cli#downloadAndGenerate');
const ENSURE_TARGET_PATH = Symbol('think-cli#ensureTargetPath');

class add {
  constructor(options) {
    this.options = options;
  }

  run() {
    const {template} = this.options;
    return utils.isLocalPath(template)
      ? this[GENERATE]()
      : this[DOWNLOAD_AND_GENERATE]();
  }

  [GENERATE]() {
    const {paths, name, cacheTemplatePath, isMultiModule, moduleName} = this.options;

    const sources = [];
    const targets = [];

    for (let i = 0; i < paths.length; i++) {
      const item = paths[i];
      item[1] = path.join(item[2] ? item[2] : 'src', isMultiModule ? moduleName : '', item[1]);
      item[1] = item[1].replace(/(\[name\])/g, name);
      sources.push(path.join(cacheTemplatePath, 'template', item[0]));
      targets.push(item[1]);
    }

    return generate(sources, targets);
  }

  [DOWNLOAD_AND_GENERATE]() {
    const {cacheTemplatePath} = this.options;
    const spinner = ora({text: 'downloading template...', spinner: 'arrow3'}).start();
    return this[ENSURE_TARGET_PATH](cacheTemplatePath)
      .then(this[DOWNLOAD]())
      .then(_ => {
        spinner.stop();
        return this[GENERATE]();
      });
  }

  [DOWNLOAD]() {
    const {template, cacheTemplatePath, clone} = this.options;
    return _ => download(template, cacheTemplatePath, {clone});
  }

  [ENSURE_TARGET_PATH](path) {
    return helper.isExist(path)
      ? helper.rmdir(path)
      : Promise.resolve();
  }
}

module.exports = add;
