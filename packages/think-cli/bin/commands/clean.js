const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const logger = require('../../lib/logger');
const helper = require('think-helper');
const config = require('../../config');

/**
 * Padding.
 */

console.log();
process.on('exit', function() {
  console.log();
});

/**
 * Start.
 */

const appPath = path.join(path.resolve('./'));
if (!utils.isThinkApp(appPath)) {
  logger.error(
    'Please execute the command in the ' +
    chalk.yellow.underline.bold('thinkjs project') +
    ' root directory.\nIf you are sure you have already in the thinkjs root directory, please execute ' +
    chalk.green.underline.bold('thinkjs migrate') +
    ' to migrate your project to think-cli 2.0'
  );
}

const spinner = ora({ text: 'Clear the cache template...', spinner: 'arrow3' }).start();
const thinkjsInfo = require(path.join(appPath, 'package.json')).thinkjs;
const cacheTemplatePath = path.join(config.templateCacheDirectory, thinkjsInfo.template.replace(/[\/\\:]/g, '-'));

helper
  .rmdir(cacheTemplatePath)
  .then(_ => {
    spinner.stop();
    logger.success('Clean up completed~');
  })
  .catch(err => {
    spinner.stop();
    console.error(err);
    console.log('');
    logger.warning(
      'Please feedback this issue to issues: ' +
      chalk.green.underline('https://github.com/thinkjs/thinkjs/issues')
    );
  });
