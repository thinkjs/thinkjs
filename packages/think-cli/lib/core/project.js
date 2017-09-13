const Metalsmith = require('metalsmith');
const inquirer = require('inquirer');
const Handlebars = require('handlebars');
const renderRaw = require('consolidate').handlebars.render;
const path = require('path');
const multimatch = require('multimatch');
const getOptions = require('./options.js');
const logger = require('../logger.js');
const utils = require('../utils');
const render = utils.promisify(renderRaw, renderRaw);

Handlebars.registerHelper('author', function(res) {
  return new Handlebars.SafeString(res.data.root.author);
});

module.exports = function({name, templateName, cacheTemplatePath, targetPath, clone, isMultiModule}, done) {
  const src = cacheTemplatePath || templateName;
  const metadata = getOptions(name, src);

  Metalsmith(path.join(src, 'template'))
    .source('.')
    .destination(targetPath)
    .use(ask(metadata.prompts, isMultiModule))
    .use(template(metadata.skipCompile))
    .use(multiModule(metadata.paths, metadata.multiModule, isMultiModule))
    .use(insertCliInfoToPackage({name, templateName, cacheTemplatePath, clone, isMultiModule}))
    .build(done);
};

/**
 * Prompt plugin.
 *
 * @param {Object} prompts
 */

function ask(prompts, isMultiModule) {
  prompts = Object.keys(prompts).map(key => Object.assign({name: key}, prompts[key]));
  if (isMultiModule) {
    prompts.push({
      name: 'defaultModule',
      type: 'string',
      message: 'Please enter a default module name',
      default: 'home'
    });
  }

  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();
    inquirer.prompt(prompts).then((answers) => {
      for (var key in answers) {
        metadata[key] = answers[key];
      }
      done();
    });
  };
}

/**
 * Template in place plugin.
 *
 * @param {Object} skip compile
 */

function template(skipCompile) {
  skipCompile = typeof skipCompile === 'string'
    ? [skipCompile]
    : skipCompile;

  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();

    const promises = Object.keys(files).map(file => {
      if (skipCompile && multimatch([file], skipCompile, { dot: true }).length) {
        return Promise.resolve();
      }

      const str = files[file].contents.toString();
      return render(str, metadata)
        .then(res => {
          files[file].contents = Buffer.from(res);
        })
        .catch(_ => {
          logger.error('"%s" file render failed. Please add the file to the skipCompile key in the metadata.js', file);
        });
    });

    Promise.all(promises).then(() => {
      done(null);
    }, done);
  };
}

/**
 * MultiModule plugin.
 * In multi module mode, multi module project is generated
 *
 * @param {Object} paths
 * @param {Object} multi module map
 * @param {Boolean} isMultiModule
 */

function multiModule(paths, multiModuleMap, isMultiModule) {
  return function(files, metalsmith, done) {
    if (!isMultiModule) return done(null);

    const defaultModule = metalsmith.metadata().defaultModule;

    // Add multi module project structure
    for (const file in files) {
      for (const name in multiModuleMap) {
        const tmpPrefixPath = paths[name];
        const targetPrefixPath = multiModuleMap[name].replace(new RegExp('(\\[defaultModule\\])', 'g'), defaultModule);
        if (!tmpPrefixPath || !new RegExp('^' + tmpPrefixPath).test(file)) continue;
        const path = file.replace(new RegExp('^' + tmpPrefixPath), targetPrefixPath);
        files[path] = files[file];
      }
    }

    // Clear single module project structure
    for (const file in files) {
      for (const name in multiModuleMap) {
        const tmpPrefixPath = paths[name];
        if (!tmpPrefixPath || !new RegExp('^' + tmpPrefixPath).test(file)) continue;
        delete files[file];
      }
    }
    done();
  };
}

function insertCliInfoToPackage({name: projectName, templateName, cacheTemplatePath, clone, isMultiModule}) {
  return function(files, metalsmith, done) {
    if (!files['package.json']) return done();
    const defaultModule = metalsmith.metadata().defaultModule;
    const str = files['package.json'].contents.toString();
    const json = JSON.parse(str);

    json.thinkCli = {
      projectName,
      templateName,
      cacheTemplatePath,
      defaultModule,
      clone,
      isMultiModule
    };

    files['package.json'].contents = Buffer.from(JSON.stringify(json, null, '  '), 'binary');
    done();
  };
}
