const chalk = require('chalk');
const format = require('util').format;
const render = require('consolidate').ejs.render;

var prefix = '   think-cli';
var sep = chalk.gray('·');

exports.log = function() {
  const msg = format.apply(format, arguments);
  console.log(chalk.white(prefix), sep, msg);
};

exports.warning = function() {
  const msg = format.apply(format, arguments);
  console.log(chalk.yellow(prefix), sep, msg);
};

exports.error = function(err) {
  console.log(err);
  if (err instanceof Error) err = err.message.trim();
  const msg = format.apply(format, arguments);
  console.error(chalk.red(prefix), sep, msg);
  process.exit(1);
};

exports.success = function() {
  const msg = format.apply(format, arguments);
  console.log(chalk.green(prefix), sep, msg);
};

exports.message = function(message, data) {
  if (!message) return;
  render(message, data, function(err, res) {
    if (err) {
      console.error('\n   Error when rendering template complete message: ' + err.message.trim());
    } else {
      console.log('\n' + res.split(/\r?\n/g).map(function(line) {
        return '   ' + line;
      }).join('\n'));
    }
  });
};
