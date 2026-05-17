const inquirer = require('inquirer');
const utils = require('../utils.js');
const helper = require('think-helper');
const path = require('path');
const logger = require('../logger.js');

module.exports = function(command) {
  return function(files, metalsmith, done) {
    if (command === 'new') return done(null);
    const confirm = utils.compose(batch, inquire)();
    confirm(files).then(list => {
      if (list.length > 0) console.log('');
      done(null);
    }, _ => {
      console.log('');
      logger.warning('Abort the operation');
    });
  };
};

function batch(fn) {
  const confirmedFiles = [];
  return files => new Promise((resolve, reject) => {
    const list = Object.keys(files);

    onFulfilled();

    function onFulfilled(res) {
      if (res === false) {
        return reject(new Error('Not allowed overwrite'));
      }

      const filePath = list.shift();
      if (filePath === undefined) return resolve(confirmedFiles);
      next(filePath);
    }

    function onRejected(err) {
      return reject(err);
    }

    function next(filePath) {
      if (!helper.isExist(filePath)) return onFulfilled();
      confirmedFiles.push(filePath);
      fn(path.normalize(filePath)).then(onFulfilled, onRejected);
    }
  });
}

function inquire() {
  return filePath => inquirer.prompt([{
    type: 'confirm',
    message: `${filePath} already exists. Continue?`,
    name: 'ok'
  }]).then(answers => answers.ok);
}
