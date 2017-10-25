const Metalsmith = require('metalsmith');
const inquirer = require('inquirer');
const Handlebars = require('handlebars');
const renderRaw = require('consolidate').handlebars.render;
const path = require('path');
const multimatch = require('multimatch');
const helper = require('think-helper');
const getOptions = require('./options.js');
const logger = require('../logger.js');
const render = helper.promisify(renderRaw, renderRaw);

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
    .use(filesignore(metadata.filesignore))
    .use(template(metadata.skipCompile, {rootPath: targetPath, isMultiModule}))
    .use(multiModule(metadata.multiModule, isMultiModule))
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
      metadata[isMultiModule] = !!isMultiModule;
      done();
    });
  };
}

/**
 * Template in place plugin.
 *
 * @param {Object} skip compile
 */

function template(skipCompile, ctx) {
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
      return render(str, Object.assign(metadata, ctx))
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

function filesignore(filesIgnore) {
  return function(files, metalsmith, done) {
    const reg = /(\.tpl\.js)$/;
    for (const file in files) {
      if (reg.test(file)) {
        delete files[file];
        continue;
      }

      for (let i = 0; i < filesIgnore.length; i++) {
        const regPrefixPath = new RegExp('^' + filesIgnore[i]);
        if (regPrefixPath.test(file)) {
          delete files[file];
        }
      }
    }

    done(null);
  };
}

/**
 * MultiModule plugin.
 * In multi module mode, multi module project is generated
 *
 * @param {Object} multi module map
 * @param {Boolean} isMultiModule
 */

function multiModule(multiModuleMap, isMultiModule) {
  return function(files, metalsmith, done) {
    if (!isMultiModule) return done(null);

    const defaultModule = metalsmith.metadata().defaultModule;

    // Add multi module project structure
    for (const file in files) {
      for (let i = 0; i < multiModuleMap.length; i++) {
        const tmpPrefixPath = multiModuleMap[i][0];
        const targetPrefixPath = multiModuleMap[i][1].replace(/(\[defaultModule\])/g, defaultModule);
        const reg = new RegExp('^' + tmpPrefixPath);
        if (!reg.test(file)) continue;
        const finalPath = file.replace(reg, targetPrefixPath);
        files[finalPath] = files[file];
      }
    }

    // Clear single module project structure
    for (const file in files) {
      for (let j = 0; j < multiModuleMap.length; j++) {
        const tmpPrefixPath = multiModuleMap[j][0];
        if (!new RegExp('^' + tmpPrefixPath).test(file)) continue;
        delete files[file];
      }
    }
    done();
  };
}

function insertCliInfoToPackage({name: projectName, templateName, cacheTemplatePath, clone, isMultiModule}) {
  return function(files, metalsmith, done) {
    if (!files['package.json']) return done();
    const metadata = metalsmith.metadata();
    const defaultModule = metadata.defaultModule;
    const str = files['package.json'].contents.toString();
    const json = JSON.parse(str);

    json.thinkjs = Object.assign(json.thinkjs || {}, {
      metadata,
      projectName,
      templateName,
      cacheTemplatePath,
      defaultModule,
      clone,
      isMultiModule
    });

    files['package.json'].contents = Buffer.from(JSON.stringify(json, null, '  '), 'binary');
    done();
  };
}
