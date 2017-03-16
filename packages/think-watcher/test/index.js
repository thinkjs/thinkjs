const test = require('ava');
const mock = require('mock-require');
const helper = require('think-helper');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

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

function createFile(dir, filename) {
  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir);
  }
  let filePath = path.join(dir, filename);
  fs.openSync(filePath, 'w');
}

const defaultCallback = () => {
};

test.afterEach.always(_ => {
  const tmp = path.resolve(__dirname, 'tmp');
  rimraf.sync(tmp);
});

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

test('buildOptions function -- Array srcPath,string diffPath,undefined filter,undefined allowExts', t => {
  const Watcher = getWatcher();
  let options = {
    srcPath: ['watchFiles1','watchFiles2'],
    diffPath: 'diffFiles'
  };
  let watcher = new Watcher(options, defaultCallback);
  t.deepEqual(watcher.options.srcPath, ['watchFiles1','watchFiles2']);
  t.deepEqual(watcher.options.diffPath, ['diffFiles']);
  t.deepEqual(watcher.options.allowExts, defaultOptions.allowExts);
  t.deepEqual(helper.isFunction(watcher.options.filter), true);
});

test('buildOptions function -- options.filter', t => {
  const Watcher = getWatcher();
  let options = {
    srcPath: ['watchFiles1','watchFiles2'],
    diffPath: 'diffFiles',
    filter:()=>{}
  };
  let watcher = new Watcher(options, defaultCallback);
  t.deepEqual(watcher.options.srcPath, ['watchFiles1','watchFiles2']);
  t.deepEqual(watcher.options.diffPath, ['diffFiles']);
  t.deepEqual(watcher.options.allowExts, defaultOptions.allowExts);
  t.deepEqual(helper.isFunction(watcher.options.filter), true);
});

test('buildOptions function -- options.allowExts', t => {
  const Watcher = getWatcher();
  let options = {
    srcPath: ['watchFiles1','watchFiles2'],
    diffPath: 'diffFiles',
    allowExts:['js','ts','jsx']
  };
  let watcher = new Watcher(options, defaultCallback);
  t.deepEqual(watcher.options.srcPath, ['watchFiles1','watchFiles2']);
  t.deepEqual(watcher.options.diffPath, ['diffFiles']);
  t.deepEqual(watcher.options.allowExts, ['js','ts','jsx']);
  t.deepEqual(helper.isFunction(watcher.options.filter), true);
});

test('defaultOptions.filter function -- hidden file', t => {
  const Watcher = getWatcher();
  let watcher = new Watcher('watchFiles',defaultCallback);
  let fileInfo = {
    file: '/foo/bar/.baz/qux'
  };
  let result = watcher.options.filter(fileInfo);
  t.is(result,false);
});

test('defaultOptions.filter function -- valid extend name', t => {
  const Watcher = getWatcher();
  let watcher = new Watcher('watchFiles',defaultCallback);
  let fileInfo = {
    file: '/foo/bar/baz/qux/admin1.js'
  };
  let result = watcher.options.filter(fileInfo,watcher.options);
  t.is(result,true);
});

test('defaultOptions.filter function -- invalid extend name', t => {
  const Watcher = getWatcher();
  let watcher = new Watcher('watchFiles',defaultCallback);
  let fileInfo = {
    file: '/foo/bar/baz/qux/a.jsx'
  };
  let result = watcher.options.filter(fileInfo,watcher.options);
  t.is(result,false);
});

test('getChangedFiles function -- srcPath must be an absolute path', t => {
  let assertCallParams = [];
  mockAssert(assertCallParams);
  const Watcher = getWatcher();
  let options = {
    srcPath: ['./admin']
  };
  let watcher = new Watcher(options, defaultCallback);
  watcher.getChangedFiles();
  t.deepEqual(assertCallParams,
    [
      true,
      'callback must be a function',
      ['./admin'],
      'srcPath can not be blank',
      false,
      'srcPath must be an absolute path'
    ]
  );
});

test('getChangedFiles function -- empty diffPath', t => {
  const Watcher = getWatcher();
  let [admin, home] = [path.resolve(__dirname, 'tmp','admin'), path.resolve(__dirname, 'tmp', 'home')];
  let options = {
    srcPath: [admin, home]
  };

  createFile(admin, 'admin.js');
  createFile(home, 'home.js');

  let watcher = new Watcher(options, defaultCallback);
  let watchFiles = watcher.getChangedFiles();
  t.deepEqual(
    watchFiles,
    [
      {
        path: admin,
        file: 'admin.js'
      },
      {
        path: home,
        file: 'home.js'
      },
    ]
  )
});

test('getChangedFiles function -- delete error files in diffPath', t => {
  const Watcher = getWatcher();
  let [admin, diffAdmin] = [
    path.resolve(__dirname, 'tmp', 'admin'),
    path.resolve(__dirname, 'tmp', 'diff-admin'),
  ];

  createFile(admin, 'admin1.js');
  createFile(diffAdmin,'diff1.js');
  createFile(diffAdmin,'admin1.js');

  let options = {
    srcPath: [admin],
    diffPath: [diffAdmin]
  };

  let watcher = new Watcher(options, defaultCallback);
  watcher.removeDeletedFiles(
    [ 'admin1.js' ],
    [ 'admin1.js', 'diff2.js' ],  // create diff1.js,but give an error diff2.js file path
    diffAdmin
  );
  t.deepEqual(helper.getdirFiles(diffAdmin),[ 'admin1.js', 'diff1.js' ]);
});

test('getChangedFiles function -- delete extra files in diffPath', t => {
  const Watcher = getWatcher();
  let [admin, home, diff] = [
    path.resolve(__dirname, 'tmp','admin'),
    path.resolve(__dirname, 'tmp','home'),
    path.resolve(__dirname, 'tmp','diff'),
  ];

  createFile(diff, 'diff.js');

  let options = {
    srcPath: [admin, home],
    diffPath: [diff]
  };
  let watcher = new Watcher(options, defaultCallback);
  watcher.getChangedFiles();
  let files = helper.getdirFiles(diff);
  t.deepEqual(files, []);
});

test('getChangedFiles function -- delete extra files in diffPath', t => {
  const Watcher = getWatcher();
  let [admin, diff] = [
    path.resolve(__dirname, 'tmp','admin'),
    path.resolve(__dirname, 'tmp','diff'),
  ];

  createFile(admin, 'admin.js');
  createFile(diff, 'diff.js');

  let options = {
    srcPath: [admin],
    diffPath: [diff]
  };
  let watcher = new Watcher(options, defaultCallback);
  watcher.getChangedFiles();
  let files = helper.getdirFiles(diff);
  t.deepEqual(files, []);
});

test('getChangedFiles function -- delete extra files in diffPath', t => {
  const Watcher = getWatcher();
  let [admin, home, diffAdmin, diffHome] = [
    path.resolve(__dirname, 'tmp', 'admin'),
    path.resolve(__dirname, 'tmp', 'home'),
    path.resolve(__dirname, 'tmp', 'diff-admin'),
    path.resolve(__dirname, 'tmp', 'diff-home'),
  ];

  createFile(admin, 'admin1.js');
  createFile(home, 'home1.js');
  createFile(diffAdmin,'diff1.js');
  createFile(diffAdmin,'admin1.js');
  createFile(diffHome,'diff2.js');
  createFile(diffHome,'home1.js');

  let options = {
    srcPath: [admin, home],
    diffPath: [diffAdmin,diffHome]
  };
  let watcher = new Watcher(options, defaultCallback);
  watcher.getChangedFiles();
  let adminFiles = helper.getdirFiles(diffAdmin);
  let homeFiles = helper.getdirFiles(diffHome);

  t.deepEqual(adminFiles, ['admin1.js']);
  t.deepEqual(homeFiles, ['home1.js']);
});



test('getChangedFiles function -- get empty file if mtime of diff file is later then src file', async (t)=>{
  function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
  }

  const Watcher = getWatcher();
  let [admin, diffAdmin] = [
    path.resolve(__dirname, 'tmp', 'admin'),
    path.resolve(__dirname, 'tmp', 'diff-admin'),
  ];

  createFile(admin, 'admin1.js');
  // ensure diff file's mtime is later then src file.
  await sleep(1000);
  createFile(diffAdmin,'admin1.js');

  let options = {
    srcPath: admin,
    diffPath: diffAdmin
  };

  let watcher = new Watcher(options, defaultCallback);
  let files = watcher.getChangedFiles();
  t.deepEqual(files,[]);
});


test('getChangedFiles function -- watch file change', async(t) => {
  function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
  }
  const Watcher = getWatcher();
  let [admin] = [
    path.resolve(__dirname, 'tmp1', 'admin'),
  ];
  createFile(admin, 'admin1.js');
  let options = {
    srcPath: admin,
  };
  let fileChange = false;
  let cb = () => {
    fileChange = true;
  };
  let watcher = new Watcher(options, cb);
  watcher.watch();

  await sleep(1000);

  fs.writeFile(path.resolve(__dirname, 'tmp1', 'admin','admin1.js'),"console.log('Hello thinkjs!')");

  await sleep(1000);

  t.is(fileChange,true);

  const tmp = path.resolve(__dirname, 'tmp1');
  rimraf.sync(tmp);
});
