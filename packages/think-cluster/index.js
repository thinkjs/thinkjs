const util = require('./lib/util.js');
const messenger = require('./lib/messenger.js');

exports.Worker = require('./lib/worker.js');
exports.Agent = require('./lib/agent.js');
exports.Master = require('./lib/master.js');
exports.delegate = require('./lib/delegate.js');

exports.messenger = new messenger();
exports.isAgent = util.isAgent;
exports.isFirstWorker = util.isFirstWorker;