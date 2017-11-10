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
  const funcNames = ['debug', 'info', 'warn', 'error'];
  const logger = new Logger({handle: Adapter});

  t.plan(funcNames.length);
  for (const funcName of funcNames) {
    const func = logger[funcName];
    func('Hello World');
    t.true(global.server_log.includes('Hello World'));
    global.server_log = '';
  }
});
