const util = require('./lib/util.js');

exports.Worker = require('./lib/worker.js');
exports.Agent = require('./lib/agent.js');
exports.Master = require('./lib/master.js');
exports.delegate = require('./lib/delegate.js');
exports.Messenger = require('./lib/messenger.js');

//add extend to think object
exports.extend = {
  think: {
    messenger: new exports.Messenger()
  }
}

exports.isAgent = util.isAgent;
exports.canDelegate = util.canDelegate;
exports.isFirstWorker = util.isFirstWorker;