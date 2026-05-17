const chalk = require('chalk');
const ora = require('ora');
const urllib = require('urllib');

/**
 * Padding.
 */

console.log();
process.on('exit', function() {
  console.log();
});

const spinner = ora({ text: 'Searching...', spinner: 'monkey' }).start();
urllib.request('https://api.github.com/orgs/think-template/repos', (err, data, res) => {
  spinner.stop();
  if (err) return console.error(err);

  let list;
  try {
    list = JSON.parse(data.toString());
  } catch (e) {
    console.error(e);
  }

  if (Array.isArray(list)) {
    console.log('  Available templates:');
    console.log();

    list
      .forEach(item => {
        console.log(
          '  ' + '🐶' +
          '  ' + chalk.cyan(item.name) +
          ' - ' + item.description);
      });
  } else {
    console.error(list.message);
  }
});
