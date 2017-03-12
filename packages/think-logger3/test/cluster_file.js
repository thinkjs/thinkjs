const fs = require('fs');
const test = require('ava');
const path = require('path');
const Logger = require('../src');
const sandbox = require('sandboxed-module');
const LoggingEvent = require('log4js/lib/logger').LoggingEvent;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const filename = path.join(__dirname, 'test_cluster.log');

test.before('cluster file logger', () => {
  try {
    fs.statSync(filename);
    fs.unlinkSync(filename);
  } catch(e) {

  } finally {
    fs.writeFileSync(filename, '', {encoding: 'utf-8'});
  }  
});

test('cluster file logger in master', async t => {
  const fakeWorker = {
    on(event, callback) {
      if(event === 'message') {
        const simulatedLoggingEvent = new LoggingEvent(null, 'Info', ['hello world from worker']);
        callback({
          type: '::log-message',
          event: JSON.stringify(simulatedLoggingEvent)
        });
      }
    },
    process: {
      pid: 123
    },
    id: 'workerid',
    isMaster: false,
    isWorker: true
  };

  const fakeMaster = {
    on(event, callback) {
      if(event === 'fork') {
        callback(fakeWorker);
      }
    },
    isMaster: true,
    isWorker: false,
    workers: {
      '1': fakeWorker
    }
  };

  const MasterFileAdapter = sandbox.require('../src/adapter/file', {
    requires: {
      cluster: fakeMaster,
    }
  });
  const WorkerFileAdapter = sandbox.require('../src/adapter/file', {
    requires: {
      cluster: fakeWorker
    }
  });
  let masterLogger = new Logger({
    handle: MasterFileAdapter,
    filename
  });
  let workerLogger = new Logger({handle: WorkerFileAdapter});

  masterLogger.info('hello world from master');
  await sleep(500);

  let text = fs.readFileSync(filename, {encoding: 'utf-8'});
  t.true(text.includes('hello world from worker'));
  fs.unlinkSync(filename);
});