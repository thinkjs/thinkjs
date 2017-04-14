const cache = require('think-cache');
const session = require('think-session');
const clusterExtend = require('think-cluster').extend;

module.exports = [
  clusterExtend(think.app),
  cache,
  session
];