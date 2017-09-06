const test = require('ava');
const mock = require('mock-require');
const cluster = require('cluster');
const http = require('http');
const path = require('path');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const helper = require('think-helper');

const interval = 5000;

let masterProcess = null;
test.afterEach.always(() => {
  if (masterProcess) {
    masterProcess.kill();
  }
});

function executeProcess(fileName, options, funcName, callback) {
  const scriptPath = path.join(__dirname, '../script', fileName);
  masterProcess = spawn(`node`, [scriptPath, funcName, JSON.stringify(options)]);

  masterProcess.stdout.on('data', (buf) => {
    try {
      const json = JSON.parse(buf.toString('utf-8'));
      callback(json);
    } catch (e) {
      callback({message: buf.toString('utf-8')});
    }
  });

  return masterProcess;
}

test.serial('normal case', async t => {
  console.log('worker');
  try {
    const result = {};
    const options = {
      workers: 4
    };
    executeProcess('worker.js', options, 'forkWorkers', (output) => {
      Object.assign(result, output);
    });
    await sleep(interval);
    t.is(result.isForked, true);
    t.is(result.options.workers, 4);
  } catch (e) {
  }
});
