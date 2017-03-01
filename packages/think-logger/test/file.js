const fs = require('fs');
const test = require('ava');
const log4js = require('log4js');
const Logger = require('../lib');
const process = require('process');
const Adapter = Logger.File;

for(let func of ['debug', 'info', 'warn', 'error']) {
  const filename = `${__dirname}/test-${func}.log`;
  test.before('file logger '+func, () => {
    try {
      fs.statSync(filename);
      fs.unlinkSync(filename);
    } catch(e) {

    } finally {
      fs.writeFileSync(filename, '', {encoding: 'utf-8'});
    }
  });

  test('file logger '+func, t => {
    let logger = new Logger({
      handle: Adapter,
      filename: filename
    });

    // log4js.shutdown(() => {
    //   console.log(filename);
    //   let text = fs.readFileSync(filename, {encoding: 'utf-8'});
    //   t.true(text.includes('Hello World'));
    //   fs.unlinkSync(filename);
    // });

    logger[func]('Hello World');
  });
}
