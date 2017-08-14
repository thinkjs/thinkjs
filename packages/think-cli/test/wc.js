const test = require('ava');
const {isDirectory, rmdir} = require('think-helper');
const Commander = require('../commander');
const path = require('path');

process.cwd = function() {
  return __dirname;
};

const instance = new Commander();

test.serial('new test2', t => {
  const processArgv = ['/usr/local/bin/node', __filename, 'new', 'test2', '-w'];
  instance.parseArgv(processArgv);
  t.is(isDirectory(path.resolve(__dirname, 'test2')), true);
});

test.serial('create controller', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test2');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test2'), 'controller', 'abc' ];
  instance.parseArgv(processArgv);
});

test.serial('create restful controller', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test2');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test2'), 'controller', 'user/def', '-r' ];
  instance.parseArgv(processArgv);
});
test.after('cleanup', function() {
  console.log('begin gc');
  rmdir(path.join(__dirname, 'test2'));
});
