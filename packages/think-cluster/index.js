const util = require('./lib/util.js');

exports.Worker = require('./lib/worker.js');
exports.Agent = require('./lib/agent.js');
exports.Master = require('./lib/master.js');
exports.delegate = require('./lib/delegate.js');
exports.Messager = require('./lib/messager.js');

//add extend to think object
exports.extend = {
  think: {
    messager: new exports.Messager()
  }
}

exports.isAgent = util.isAgent;
exports.canDelegate = util.canDelegate;