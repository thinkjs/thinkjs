const ora = require('ora');
const download = require('download-git-repo');
const helper = require('think-helper');
const utils = require('./utils.js');
const generate = require('./core/project.js');
const logger = require('./logger.js');

const THINK_GENERATE = Symbol('think-cli#generate');
const THINK_DOWNLOAD_AND_GENERATE = Symbol('think-cli#downloadAndGenerate');

class init {
  constructor(options) {
    this.options = options;
  }

  run() {
    const {template} = this.options;

    utils.isLocalPath(template)
     ? this[THINK_GENERATE]()
     : this[THINK_DOWNLOAD_AND_GENERATE]();
  }

  /**
   * Generate from a local template
   * @param {String} template
   */
  [THINK_GENERATE]() {
    const {name, template: rawTemplate, targetPath, isMultiModule} = this.options;
    const template = utils.getLocalTemplatePath(rawTemplate);
    if (!helper.isExist(template)) {
      console.log();
      logger.error('Local template "%s" not found.', template);
      return;
    }
    generate({name, templateName: template, targetPath, isMultiModule}, (err) => {
      if (err) return logger.error(err);
      console.log();
      logger.success('Generated %s', name);
    });
  }

  /**
   * Download a generate from a template repo.
   * @param {String} template
   */
  [THINK_DOWNLOAD_AND_GENERATE]() {
    const {name, template: rawTemplate, cacheTemplatePath, targetPath, clone, isMultiModule} = this.options;
    const spinner = ora({text: 'downloading template...', spinner: 'arrow3'}).start();

    const template = rawTemplate.indexOf('/') > -1
      ? rawTemplate
      : 'haotech/' + rawTemplate;

    function ensureTargetPath(path) {
      return helper.isExist(path)
        ? helper.rmdir(path)
        : Promise.resolve();
    }

    ensureTargetPath(cacheTemplatePath).then(() => {
      download(template, cacheTemplatePath, {clone}, err => {
        spinner.stop();
        if (err) return logger.error(err);

        generate({name, templateName: template, cacheTemplatePath, targetPath, clone, isMultiModule}, (err) => {
          if (err) return logger.error(err);
          console.log();
          logger.success('Generated %s', name);
        });
      });
    });
  }
}

module.exports = init;
