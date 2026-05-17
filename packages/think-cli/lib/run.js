const path = require('path');
const helper = require('think-helper');
const Download = require('./download');
const Sync = require('./sync');
const generate = require('./generate');
const getOptions = require('./options');
const utils = require('./utils');
const config = require('../config');

const GENERATE_CACHE = Symbol('think-cli#cache');
const GENERATE_REMOTE = Symbol('think-cli#remote');

class Run extends Download {
  constructor(options) {
    super();
    this.options = options;
    this._cacheTemplatePath = path.join(config.templateCacheDirectory, this.options.template.replace(/[\\/\\:]/g, '-'));
    this.sync = new Sync(Object.assign(options, {
      cacheTemplatePath: this._cacheTemplatePath
    }));
  }

  start() {
    helper.isExist(this._cacheTemplatePath)
      ? this[GENERATE_CACHE]()
      : this[GENERATE_REMOTE]();
  }

  /**
   * Generate from a cache template
   */
  [GENERATE_CACHE]() {
    return this.generate();
  }

  /**
   * Generate from a remote template
   */
  [GENERATE_REMOTE]() {
    return this.sync.start()
      .then(_ => this.generate());
  }

  generate() {
    const {template, targetPath, options, done} = this.options;
    const metadata = getOptions(this._cacheTemplatePath, {name: options.name});
    const getter = utils.parsePath(options.maps);
    options.metadata = metadata;
    options.maps = getter(metadata);
    options.template = template;

    return generate(this._cacheTemplatePath, targetPath, options, done);
  }
}

module.exports = Run;
