// Loaded only by the Node branch of Application.
module.exports = () => ({
  path: require('path'),
  cluster: require('cluster'),
  helper: require('think-helper'),
  thinkCluster: require('think-cluster'),
  pm2: require('think-pm2'),
  http: require('http'),
  mockHttp: require('think-mock-http'),
  ThinkLoader: require('../loader'),
  think: globalThis.think
});
