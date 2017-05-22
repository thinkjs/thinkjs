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

function executeProcess(fileName, options,callback) {
  let scriptPath = path.join(__dirname, 'script', fileName);
  masterProcess = spawn(`node`, [scriptPath,JSON.stringify(options)]);

  masterProcess.stdout.on('data',(data)=>{
    callback(JSON.parse(data.toString('utf-8')));
  })
}

test.serial('test case', async t => {
  let result = {};
  executeProcess('master.js',{},(output)=>{
    Object.assign(result,output);
  });
  await sleep(5000);
  t.is(result.isForked,true);
});