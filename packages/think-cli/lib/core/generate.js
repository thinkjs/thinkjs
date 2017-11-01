const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const path = require('path');
const ask = require('./ask.js');
const fileFilter = require('./file-filter.js');
const mapping = require('./mapping.js');
const template = require('./template.js');
const normalizePath = require('./normalize-path.js');
const insertThinkjsInfoToPackage = require('./insert-thinkjs-info-to-package.js');
const saveCtxToMetadata = require('./save-ctx-to-metadata.js');

Handlebars.registerHelper('author', function(res) {
  return new Handlebars.SafeString(res.data.root.author);
});

module.exports = function(source, target, options, done) {
  const metalsmith = Metalsmith(path.join(source, 'template'));

  if (options.command === 'new') {
    metalsmith.use(ask(options.metadata.prompts, {isMultiModule: options.isMultiModule}));
    metalsmith.use(insertThinkjsInfoToPackage({
      projectName: options.name,
      templateName: options.template,
      cacheTemplatePath: source,
      clone: options.clone,
      isMultiModule: options.isMultiModule,
      skipCompile: options.metadata.skipCompile
    }));
  }

  if (options.command !== 'new') {
    metalsmith.use(saveCtxToMetadata(options.metadata));
  }

  metalsmith.clean(options.command === 'new')
    .source('.')
    .use(fileFilter(options.maps))
    .use(mapping(options.maps))
    .use(template(options.metadata.skipCompile))
    .use(normalizePath())
    .destination(target)
    .build(done);
};
