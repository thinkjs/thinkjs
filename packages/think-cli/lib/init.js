const helper = require('think-helper');
const utils = require('./utils.js');
const generate = require('./core/generate.js');
const logger = require('./logger.js');
const getOptions = require('./core/options.js');
const Download = require('./download.js');

const THINK_LOCAL = Symbol('think-cli#local');
const THINK_GENERATE = Symbol('think-cli#generate');
const THINK_DOWNLOAD_AND_GENERATE = Symbol('think-cli#downloadAndGenerate');

class Init extends Download {
  constructor(options) {
    super();
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
    const {name, template: rawTemplate, targetPath, clone, isMultiModule, context} = this.options;
    const template = utils.getLocalTemplatePath(rawTemplate);
    if (!helper.isExist(template)) {
      console.log();
      logger.error('Local template "%s" not found.', template);
      return;
    }

    this[THINK_GENERATE](template, targetPath, {name, command: 'new', template, clone, isMultiModule, context});
  }

  [THINK_DOWNLOAD_AND_GENERATE]() {
    const {name, template: rawTemplate, cacheTemplatePath, targetPath, clone, isMultiModule, context} = this.options;

    const template = rawTemplate.indexOf('/') > -1
      ? rawTemplate
      : 'think-template/' + rawTemplate;

    this.download(template, cacheTemplatePath, clone).then(_ => {
      this[THINK_GENERATE](cacheTemplatePath, targetPath, {name, command: 'new', template, clone, isMultiModule, context});
    });
  }

  [THINK_GENERATE](source, target, options) {
    const metadata = getOptions(options.name, source);
    options.metadata = metadata;
    options.maps = metadata[options.command][options.isMultiModule ? 'multiModule' : 'default'];

    return generate(source, target, options, (err, files) => {
      if (err) return logger.error(err);
      console.log();
      logger.success('Generated %s', options.name);
      if (options.metadata.completeMessage) {
        logger.message(options.metadata.completeMessage, {
          destDirName: options.name,
          inPlace: target === process.cwd()
        });
      }
    });
  }
}

module.exports = Init;
