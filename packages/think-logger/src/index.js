const assert = require('assert');
const ConsoleAdapter = require('./adapter/console');
const FileAdapter = require('./adapter/file');
const DateFileAdapter = require('./adapter/file');

class Logger {
  constructor(config) {
    let handle = config.handle;
    delete config.handle;
    
    this._logger = new handle(config);
    ['debug', 'info', 'warn', 'error'].forEach(level => {
      assert(this._logger[level], `adapter function ${level} not exist!`);
      this[level] = this._logger[level].bind(this);
    });
  }
}

Logger.Console = ConsoleAdapter;
Logger.File = FileAdapter;
Logger.DateFile = DateFileAdapter;
module.exports = Logger;