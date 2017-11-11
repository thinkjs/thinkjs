const Metalsmith = require('metalsmith');
const helper = require('think-helper');
const utils = require('./utils.js');
const logger = require('./logger.js');
const Download = require('./download.js');

const LOCAL = Symbol('think-cli#local');
const REMOTE = Symbol('think-cli#remote');

/**
 * Synchronize the cache from the template
 */
class Synchronous extends Download {
  constructor(options) {
    super();
    this.template = options.template;
    this.cacheTemplatePath = options.cacheTemplatePath;
    this.clone = options.clone;
  }

  start() {
    return utils.isLocalPath(this.template)
     ? this[LOCAL]()
     : this[REMOTE]();
  }

  /**
   * Synchronize from local template
   */
  [LOCAL]() {
    const template = utils.getLocalTemplatePath(this.template);
    if (!helper.isExist(template)) {
      console.log();
      logger.error('The template is a local template, but it does not exist. The template path is "%s".', template);
      return;
    }

    return new Promise(resolve => {
      Metalsmith(template)
        .clean(true)
        .source('.')
        .destination(this.cacheTemplatePath)
        .build((err, files) => {
          if (err) {
            console.log();
            logger.error('Local template synchronization failed, reason: "%s".', err.message.trim());
          }
          resolve(this.cacheTemplatePath);
        });
    });
  }

  /**
   * Synchronize from remote template
   */
  [REMOTE]() {
    const template = this.template.indexOf('/') > -1
      ? this.template
      : 'think-template/' + this.template;

    return this.download(template, this.cacheTemplatePath, this.clone).then(_ => {
      return this.cacheTemplatePath;
    }, err => {
      if (err instanceof Error) err = err.message.trim();
      console.log();
      logger.error('Remote template synchronization failed, reason: "%s".', err);
    });
  }
}

module.exports = Synchronous;
