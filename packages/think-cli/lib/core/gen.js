const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const path = require('path');
const getOptions = require('./options.js');
const ask = require('./ask.js');
const fileFilter = require('./file-filter.js');
const mapping = require('./mapping.js');
const template = require('./template.js');
const normalizePath = require('./normalize-path.js');
const insertThinkjsInfoToPackage = require('./insert-thinkjs-info-to-package.js');

Handlebars.registerHelper('author', function(res) {
  return new Handlebars.SafeString(res.data.root.author);
});

module.exports = function(source, target, options, done) {
  const metadata = getOptions(options.name, source);
  const metalsmith = Metalsmith(path.join(source, 'template'));
  const maps = metadata[options.command][options.isMultiModule ? 'multiModule' : 'default'];

  if (options.command === 'new') {
    metalsmith.use(ask(metadata.prompts, {isMultiModule: options.isMultiModule}));
  }

  metalsmith
    .source('.')
    .use(fileFilter(maps))
    .use(mapping(maps))
    .use(template(metadata.skipCompile))
    .use(insertThinkjsInfoToPackage({
      projectName: options.name,
      templateName: options.template,
      cacheTemplatePath: source,
      clone: options.clone,
      isMultiModule: options.isMultiModule
    }))
    .use(normalizePath())
    .destination(target)
    .build(done);
};
