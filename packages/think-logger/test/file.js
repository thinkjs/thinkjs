const fs = require('fs');
const test = require('ava');
const Logger = require('../src');
const Adapter = Logger.File;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const filename = `${__dirname}/test.log`;

test.before('file logger', () => {
  try {
    fs.statSync(filename);
    fs.unlinkSync(filename);
  } catch (e) {

  } finally {
    fs.writeFileSync(filename, '', {encoding: 'utf-8'});
  }
});

test('file logger', async t => {
  const logger = new Logger({
    handle: Adapter,
    filename
  });

  const funcs = ['debug', 'info', 'warn', 'error'];
  funcs.forEach(func => logger[func]('Hello World'));

  await sleep(500);

  const text = fs.readFileSync(filename, {encoding: 'utf-8'});
  t.true(text.split('Hello World').length === funcs.length + 1);

  fs.unlinkSync(filename);
});
