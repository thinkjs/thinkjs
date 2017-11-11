const Metalsmith = require('metalsmith');
const path = require('path');
const ask = require('./ask.js');
const fileFilter = require('./file-filter.js');
const mapping = require('./mapping.js');
const template = require('./template.js');
const normalizePath = require('./normalize-path.js');
const insertThinkjsInfoToPackage = require('./insert-thinkjs-info-to-package.js');
const saveCtxToMetadata = require('./save-ctx-to-metadata.js');
const confirmOverwrite = require('./confirm-overwrite.js');

module.exports = function(source, target, options, done) {
  const metalsmith = Metalsmith(path.join(source, 'template'));

  if (options.command === 'new') {
    metalsmith.use(ask(options.metadata.prompts, {isMultiModule: options.isMultiModule}));
    metalsmith.use(insertThinkjsInfoToPackage({
      projectName: options.name,
      templateName: options.template,
      cacheTemplatePath: source,
      clone: options.clone,
      isMultiModule: options.isMultiModule
    }));
  }

  metalsmith.clean(options.command === 'new')
    .source('.')
    .use(saveCtxToMetadata(options.context))
    .use(fileFilter(options.maps))
    .use(mapping(options.maps))
    .use(normalizePath())
    .use(confirmOverwrite(options.command))
    .use(template(source, options.metadata.skipCompile))
    .destination(target)
    .build((err, files) => done(err, files, options));
};
