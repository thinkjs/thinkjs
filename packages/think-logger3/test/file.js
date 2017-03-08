const fs = require('fs');
const test = require('ava');
const log4js = require('log4js');
const Logger = require('../src');
const process = require('process');
const Adapter = Logger.File;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const filename = `${__dirname}/test.log`;

test.before('file logger', () => {
  try {
    fs.statSync(filename);
    fs.unlinkSync(filename);
  } catch(e) {

  } finally {
    fs.writeFileSync(filename, '', {encoding: 'utf-8'});
  }  
});

test('file logger', async t => {
  let logger = new Logger({
    handle: Adapter,
    filename
  });

  let funcs = ['debug', 'info', 'warn', 'error'];
  funcs.forEach(func => logger[func]('Hello World'));

  await sleep(500);

  let text = fs.readFileSync(filename, {encoding: 'utf-8'});
  t.true(text.split('Hello World').length === funcs.length+1 );
  
  fs.unlinkSync(filename);
});
