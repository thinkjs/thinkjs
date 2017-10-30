const inquirer = require('inquirer');
const utils = require('../utils.js');

module.exports = function(prompts, options = {}) {
  prompts = utils.compose(addMultiModulePrompt, formatPrompts)(prompts)(options);
  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();
    inquirer
      .prompt(prompts)
      .then(saveAnswersToMetadata(metadata, options, done));
  };
};

function formatPrompts(prompts) {
  return Object
    .keys(prompts)
    .map(key => Object.assign({name: key}, prompts[key]));
}

function addMultiModulePrompt(prompts) {
  return options => {
    const multiModulePrompt = {
      name: 'defaultModule',
      type: 'string',
      message: 'Please enter a default module name',
      default: 'home'
    };
    return options.isMultiModule
      ? [...prompts, multiModulePrompt]
      : prompts;
  };
}

function saveAnswersToMetadata(metadata, options, done) {
  return answers => {
    for (var key in answers) {
      metadata[key] = answers[key];
    }
    done();
  };
}
