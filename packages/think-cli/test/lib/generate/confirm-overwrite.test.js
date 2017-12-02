const test = require('ava')
const inquirer = require('inquirer');
const confirmOverwrite = require('../../../lib/generate/confirm-overwrite.js');

test.cb('file already exists. Continue? yes', t => {
  inquirer.prompt = generatePrompt({ok: true})
  const run = confirmOverwrite('test');
  run({
    [__filename]: {}
  }, null, _ => {
    t.end();
  })
});

test.cb('file already exists. Continue? no', t => {
  inquirer.prompt = generatePrompt({ok: false})
  const run = confirmOverwrite('test');
  run({
    [__filename]: {}
  }, null, _ => {})

  t.end();
});

test.cb('The new command should be skipped', t => {
  const run = confirmOverwrite('new');

  run({
    [__filename]: {}
  }, null, _ => {
    t.end();
  })
});

function generatePrompt(answers) {
  return (questions) => {
    const _answers = {}
    for (var i = 0; i < questions.length; i++) {
      const key = questions[i].name
      _answers[key] = answers[key]
    }
    return Promise.resolve(_answers)
  }
}
