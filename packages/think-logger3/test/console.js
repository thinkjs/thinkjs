const test = require('ava');
const Logger = require('../src');
const process = require('process');
const Adapter = Logger.Console;

test.before('console logger', () => {
  global.server_log = '';
  process.stdout.write = (write => (string, ...args) => {
    global.server_log += string;
    write.apply(process.stdout, [string, ...args]);
  })(process.stdout.write);
});

test('console logger', t => {
  let func_names = ['debug', 'info', 'warn', 'error'];
  let logger = new Logger({handle: Adapter});

  t.plan(func_names.length);
  for(let func_name of func_names) {
    let func = logger[func_name];
    func('Hello World');
    t.true(global.server_log.includes('Hello World'));
    global.server_log = '';
  }
});