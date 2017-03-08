const test = require('ava');
// const path = require('path');
// const muk = require('muk-require');

// test('cluster file logger in master', () => {
//   const loggingEvents = [];
//   let onChildProcessForked;
//   let onMasterReceiveChildMessage;
//   const fakeWorker = {
//     on(event, callback) {
//       onMasterReceiveChildMessage = callback;
//     },
//     process: {
//       pid: 123
//     },
//     id: 'workerid'
//   };
//   const fakeCluster = {
//     on(event, callback) {
//       registeredClusterEvents.push(event);
//       onChildProcessForked = () => fakeWorker;
//     },
//     isMaster: true,
//     isWorker: false,
//     workers: [
//       fakeWorker
//     ]
//   };

//   onChildProcessForked(fakeWorker);
//   const Base = muk('../src/adapter/base', {cluster: fakeCluster});
//   const FileAdapter = muk('../src/adapter/file', {'./base': Base});
//   const Logger = muk('../src', {'./adapter/file': FileAdapter});
//   new Logger({
//     handle: FileAdapter,
//     filename: path.join(__dirname, 'test.log')
//   });
//    // Fork workers.
//     for (var i = 0; i < 4; i++) {
//         var worker = cluster.fork();
//         logger.info("forked: " + i);
//     }

// })


// test.before('cluster file logger', () => {
//   const registeredClusterEvents = [];
  
//   const fakeCluster = {
//     on(event, callback) {
//       registeredClusterEvents.push(event);
//       onChildProcessForked = callback;
//     },
//     isMaster: true,
//     isWorker: false
//   };

//   const appenderMmodule = sandbox.require('../src', {
//     requires: {
//       cluster: fakeCluster
//     }
//   });

//   onChildProcessForked(fakeWorker);

//   try {
//     fs.statSync(filename);
//     fs.unlinkSync(filename);
//   } catch(e) {

//   } finally {
//     fs.writeFileSync(filename, '', {encoding: 'utf-8'});
//   }  
// })
// test('cluster file logger', t => {
//   new Logger({
//     handle: Adapter,
//     filename
//   });
// });
test.todo('cluster file logger');