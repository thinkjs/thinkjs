const test = require('ava');
const {isDirectory, rmdir} = require('think-helper');
const Commander = require('../commander');
const path = require('path');

process.cwd = function() {
  return __dirname;
};

const instance = new Commander();

test.serial('version', t => {
  let processArgv = [ '/usr/local/bin/node', __filename, '-v' ];
  instance.parseArgv(processArgv);
  processArgv = [ '/usr/local/bin/node', __filename, '-V' ];
  instance.parseArgv(processArgv);
  processArgv = [ '/usr/local/bin/node', __filename, '--version' ];
  instance.parseArgv(processArgv);
});

test.serial('new test1', t => {
  const processArgv = ['/usr/local/bin/node', __filename, 'new', 'test1', '-m', 'module'];
  instance.parseArgv(processArgv);
  t.is(isDirectory(path.resolve(__dirname, 'test1')), true);
});

test.serial('create controller', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test1');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test1'), 'controller', 'abc' ];
  instance.parseArgv(processArgv);
});

test.serial('create restful controller', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test1');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test1'), 'controller', 'home/user/def', '-r' ];
  instance.parseArgv(processArgv);
});

test.serial('create service', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test1');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test1'), 'service', 'abc' ];
  instance.parseArgv(processArgv);
});

test.serial('create model', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test1');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test1'), 'model', 'abc' ];
  instance.parseArgv(processArgv);
});

test.serial('create middleware', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test1');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test1'), 'middleware', 'abc' ];
  instance.parseArgv(processArgv);
});

test.serial('create adapter', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test1');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test1'), 'adapter', 'abc' ];
  instance.parseArgv(processArgv);
});

test.serial('create module', t => {
  process.cwd = function() {
    return path.join(__dirname, 'test1');
  };
  const processArgv = [ '/usr/local/bin/node', path.join(__dirname, 'test1'), 'module', 'abc' ];
  instance.parseArgv(processArgv);
});
test.after('cleanup', async ()=>{
  console.log('begin gc', path.join(__dirname, 'test1'));
  await rmdir(path.join(__dirname, 'test1'));
});
