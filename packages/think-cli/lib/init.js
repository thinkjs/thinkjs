const ora = require('ora');
const downloadRaw = require('download-git-repo');
const helper = require('think-helper');
const download = helper.promisify(downloadRaw, downloadRaw);
const utils = require('./utils.js');
const generate = require('./core/gen.js');
const logger = require('./logger.js');

const THINK_LOCAL = Symbol('think-cli#local');
const THINK_GENERATE = Symbol('think-cli#generate');
const THINK_DOWNLOAD_AND_GENERATE = Symbol('think-cli#downloadAndGenerate');
const THINK_DOWNLOAD = Symbol('think-cli#download');
const ENSURE_TARGET_PATH = Symbol('think-cli#ensureTargetPath');

class init {
  constructor(options) {
    this.options = options;
  }

  run() {
    const {template} = this.options;

    utils.isLocalPath(template)
     ? this[THINK_LOCAL]()
     : this[THINK_DOWNLOAD_AND_GENERATE]();
  }

  /**
   * Generate from a local template
   * @param {String} template
   */
  [THINK_LOCAL]() {
    const {name, template: rawTemplate, targetPath, clone, isMultiModule} = this.options;
    const template = utils.getLocalTemplatePath(rawTemplate);
    if (!helper.isExist(template)) {
      console.log();
      logger.error('Local template "%s" not found.', template);
      return;
    }

    const options = {name, command: 'new', template, clone, isMultiModule};
    this[THINK_GENERATE](template, targetPath, options);
  }

  [THINK_DOWNLOAD_AND_GENERATE]() {
    const {name, template: rawTemplate, cacheTemplatePath, targetPath, clone, isMultiModule} = this.options;
    const spinner = ora({text: 'downloading template...', spinner: 'arrow3'}).start();

    const template = rawTemplate.indexOf('/') > -1
      ? rawTemplate
      : 'think-template/' + rawTemplate;

    this[ENSURE_TARGET_PATH](cacheTemplatePath)
      .then(this[THINK_DOWNLOAD](template, cacheTemplatePath, clone))
      .then(_ => {
        spinner.stop();
        const options = {name, command: 'new', template, clone, isMultiModule};
        this[THINK_GENERATE](cacheTemplatePath, targetPath, options);
      }).catch(err => {
        logger.error(err);
      });
  }

  [THINK_GENERATE](source, target, options) {
    return generate(source, target, options, (err) => {
      if (err) return logger.error(err);
      console.log();
      logger.success('Generated %s', options.name);
    });
  }

  [ENSURE_TARGET_PATH](path) {
    return helper.isExist(path)
      ? helper.rmdir(path)
      : Promise.resolve();
  }

  [THINK_DOWNLOAD](template, cacheTemplatePath, clone) {
    return _ => download(template, cacheTemplatePath, {clone});
  }
}

module.exports = init;
