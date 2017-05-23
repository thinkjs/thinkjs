const test = require('ava');
const mock = require('mock-require');
const cluster = require('cluster');
const http = require('http');
const path = require('path');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const spawn = require('child_process').spawn;
const helper = require('think-helper');

let masterProcess = null;
test.afterEach.always(() => {
  if (masterProcess) {
    masterProcess.kill();
  }
});

function executeProcess(fileName, options, callback) {
  let scriptPath = path.join(__dirname, 'script', fileName);
  masterProcess = spawn(`node`, [scriptPath, JSON.stringify(options)]);

  masterProcess.stdout.on('data', (buf) => {
    callback(JSON.parse(buf.toString('utf-8')));
  })
}

test.serial('test case', async t => {
  try {
    let result = {};
    let options = {
      workers: 1
    };
    executeProcess('master.js', options, (output) => {
      Object.assign(result, output);
    });
    await sleep(5000);
    t.is(result.isForked, true);
    t.is(result.options.workers, 1);
  } catch (e) {
  }
});

test.serial('test case', async t => {
  try {
    let result = {};
    let options = {
      workers: 2,
      reloadSignal: 'SIGUSR2',
      enableAgent: true
    };
    executeProcess('master.js', options, (output) => {
      Object.assign(result, output);
    });
    await sleep(5000);
    console.log(result);
    t.is(result.isForked, true);
    t.is(result.options.enableAgent, true);
  } catch (e) {
  }
});

test.serial('test case', async t => {
  try {
    let result = {};
    let options = {
      workers: 1,
      reloadSignal: 'SIGUSR2',
      enableAgent: true
    };
    executeProcess('master.js', options, (output) => {
      Object.assign(result, output);
    });
    await sleep(5000);
    console.log(result);
    t.is(result.isForked, true);
    // if workers < 2, set enableAgent false
    t.is(result.options.enableAgent, false);
  } catch (e) {
  }
});