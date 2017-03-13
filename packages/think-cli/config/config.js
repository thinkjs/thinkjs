/**
 * default config
 */
module.exports = {
  port: 8360, //server port
  host: '0.0.0.0', //server host
  workers: 1, //server workers num, if value is 0 then get cpus num
  startServerTimeout: 3000, //before start server time
  reloadSignal: 'SIGUSR2', //reload process signal
  onUnhandledRejection: '', //unhandledRejection handle
  onUncaughtException: '', //uncaughtException handle
  processKillTimeout: 10 * 1000 //process kill timeout
}