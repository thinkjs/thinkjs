const Metalsmith = require('metalsmith');
const inquirer = require('inquirer');
const Handlebars = require('handlebars');
const render = require('consolidate').handlebars.render;
const path = require('path');
const multimatch = require('multimatch');
const getOptions = require('./options.js');
const logger = require('./logger.js');

Handlebars.registerHelper('author', function(res) {
  return new Handlebars.SafeString(res.data.root.author);
});

module.exports = function(name, src, dest, isMultiModule, done) {
  const metadata = getOptions(name, src);

  Metalsmith(path.join(src, 'template'))
    .source('.')
    .destination(dest)
    .use(ask(metadata.prompts))
    .use(template(metadata.skipCompile))
    .use(multiModule(metadata.paths, metadata.multiModule, isMultiModule))
    .build(done);
};

/**
 * Prompt plugin.
 *
 * @param {Object} prompts
 */

function ask(prompts) {
  prompts = Object.keys(prompts).map(key => Object.assign({name: key}, prompts[key]));

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

      return new Promise((resolve, reject) => {
        const str = files[file].contents.toString();

        render(str, metadata, (err, res) => {
          if (err) reject(err);
          try {
            files[file].contents = Buffer.from(res);
          } catch (e) {
            logger.error('"%s" file render failed. Please add the file to the skipCompile key in the metadata.js', file);
          }
          resolve();
        });
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
