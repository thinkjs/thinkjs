const test = require('ava');
const mock = require('mock-require');
const helper = require('think-helper');

const defaultOptions = {
  allowExts: ['js', 'es', 'ts'],
  filter: (fileInfo, options) => {
    let seps = fileInfo.file.split(path.sep);
    //filter hidden file
    let flag = seps.some(item => {
      if (item[0] === '.') {
        return true;
      }
    });
    if (flag) {
      return false;
    }
    let ext = path.extname(fileInfo.file).slice(1);
    if (options.allowExts.indexOf(ext) === -1) {
      return false;
    }
    return true;
  }
};

function getWatcher() {
  return mock.reRequire('../index');
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

const defaultCallback = () => {

};

test('constructor function -- cb not a function', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  let options = {
    srcPath: 'watchFiles'
  };
  const Watcher = getWatcher();
  new Watcher(options);
  t.deepEqual(assertCallParams,
    [
      false,
      'callback must be a function',
      'watchFiles',
      'srcPath can not be blank'
    ]
  )
});

test('buildOptions function -- undefined options', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const Watcher = getWatcher();
  new Watcher(undefined, defaultCallback);
  t.deepEqual(assertCallParams,
    [
      true,
      'callback must be a function',
      undefined,
      'srcPath can not be blank'
    ]
  )
});

test('buildOptions function -- string srcPath,undefined diffPath,undefined filter,undefined allowExts', t => {
  const Watcher = getWatcher();
  let options = {
    srcPath: 'watchFiles'
  };
  let watcher = new Watcher(options, defaultCallback);
  t.deepEqual(watcher.options.srcPath, ['watchFiles']);
  t.deepEqual(watcher.options.diffPath, []);
  t.deepEqual(watcher.options.allowExts, defaultOptions.allowExts);
  t.deepEqual(helper.isFunction(watcher.options.filter), true);
});

test('buildOptions function -- string options', t => {
  const Watcher = getWatcher();
  let watcher = new Watcher('watchFiles', defaultCallback);
  t.deepEqual(watcher.options.srcPath, ['watchFiles']);
  t.deepEqual(watcher.options.diffPath, []);
  t.deepEqual(watcher.options.allowExts, defaultOptions.allowExts);
  t.deepEqual(helper.isFunction(watcher.options.filter), true);
});

test('buildOptions function -- empty string options', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const Watcher = getWatcher();
  new Watcher('', defaultCallback);
  t.deepEqual(assertCallParams,
    [
      true,
      'callback must be a function',
      '',
      'srcPath can not be blank'
    ]
  )
});


