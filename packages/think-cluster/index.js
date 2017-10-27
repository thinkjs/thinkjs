const Messenger = require('./lib/messenger.js');

exports.Worker = require('./lib/worker.js');
exports.Master = require('./lib/master.js');

exports.messenger = new Messenger();
