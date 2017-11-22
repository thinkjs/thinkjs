const helper = require('think-helper');
const Download = require('./download');
const Sync = require('./sync');
const generate = require('./generate');
const getOptions = require('./options');
const utils = require('./utils');

const GENERATE_CACHE = Symbol('think-cli#cache');
const GENERATE_REMOTE = Symbol('think-cli#remote');

class Run extends Download {
  constructor(options) {
    super();
    this.options = options;
    this.sync = new Sync(options);
  }

  start() {
    const {cacheTemplatePath} = this.options;

    helper.isExist(cacheTemplatePath)
      ? this[GENERATE_CACHE]()
      : this[GENERATE_REMOTE]();
  }

  /**
   * Generate from a cache template
   */
  [GENERATE_CACHE]() {
    const {cacheTemplatePath, targetPath, options, done} = this.options;
    return this.generate(cacheTemplatePath, targetPath, options, done);
  }

  /**
   * Generate from a remote template
   */
  [GENERATE_REMOTE]() {
    const {cacheTemplatePath, targetPath, options, done} = this.options;
    return this.sync.start()
      .then(_ => this.generate(cacheTemplatePath, targetPath, options, done));
  }

  generate(cacheTemplatePath, targetPath, options, done) {
    const metadata = getOptions(options.name, cacheTemplatePath);
    const getter = utils.parsePath(options.maps);
    options.metadata = metadata;
    options.maps = getter(metadata);
    return generate(cacheTemplatePath, targetPath, options, done);
  }
}

module.exports = Run;
